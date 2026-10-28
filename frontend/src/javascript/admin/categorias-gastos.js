import { apiRequest, getToken, clearToken } from '../api.js';
import { renderAdminLayout } from '../layout-admin.js';

const form = document.getElementById('formCategoriaGasto');
const tabla = document.getElementById('tablaCategoriasGastos');
const confirmDialog = document.getElementById('confirmDialog');
const inputBuscar = document.getElementById('inputBuscar');
const cantResultados = document.getElementById('cantResultados');
const toast = document.getElementById('toast');

let categoriasTotales = [];
let idEliminarSeleccionado = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Renderea el layout e ilumina el botón "09 Categorías de Gastos"
    renderAdminLayout('cat_gastos');

    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }

    inputBuscar?.addEventListener('input', aplicarFiltros);
    document.getElementById('btnCancelarModal')?.addEventListener('click', () => confirmDialog.close());
    document.getElementById('btnConfirmarEliminar')?.addEventListener('click', procesarEliminacion);

    await cargarCategorias();
});

// GET
async function cargarCategorias() {
    try {
        const token = getToken();
        categoriasTotales = await apiRequest('/api/admin/categorias-gastos', { token });
        aplicarFiltros();
    } catch (error) {
        mostrarToast("Error al cargar: " + error.message);
    }
}

function renderizarTabla(lista) {
    tabla.innerHTML = '';
    cantResultados.textContent = `${lista.length} registro(s)`;

    if (lista.length === 0) {
        tabla.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 28px; color: var(--muted);">No se encontraron categorías de gastos.</td></tr>`;
        return;
    }

    lista.forEach(cat => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${cat.idCategoriaGasto}</td>
            <td><strong>${cat.nombreCatGasto}</strong></td>
            <td>
                <div class="table-actions">
                    <button type="button" data-edit="${cat.idCategoriaGasto}">Modificar</button>
                    <button type="button" class="is-danger" data-delete="${cat.idCategoriaGasto}">Eliminar</button>
                </div>
            </td>
        `;

        tr.querySelector(`[data-edit="${cat.idCategoriaGasto}"]`).addEventListener('click', () => prepararEdicion(cat));
        tr.querySelector(`[data-delete="${cat.idCategoriaGasto}"]`).addEventListener('click', () => abrirModalEliminar(cat.idCategoriaGasto));
        tabla.appendChild(tr);
    });
}

function aplicarFiltros() {
    const texto = inputBuscar.value.toLowerCase().trim();
    const filtrados = categoriasTotales.filter(cat =>
        cat.nombreCatGasto.toLowerCase().includes(texto)
    );
    renderizarTabla(filtrados);
}

// POST / PUT
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusMsg = document.getElementById('formStatus');
    statusMsg.textContent = '';

    const id = document.getElementById('idCategoriaGasto').value;
    const token = getToken();
    const payload = { nombreCatGasto: document.getElementById('nombreCatGasto').value };

    try {
        if (id) {
            await apiRequest(`/api/admin/categorias-gastos/${id}`, {
                method: 'PUT', body: JSON.stringify(payload), token
            });
            mostrarToast("Categoría actualizada con éxito.");
        } else {
            await apiRequest('/api/admin/categorias-gastos', {
                method: 'POST', body: JSON.stringify(payload), token
            });
            mostrarToast("Categoría creada con éxito.");
        }

        window.resetearFormulario();
        await cargarCategorias();
    } catch (error) {
        statusMsg.textContent = error.message;
    }
});

function prepararEdicion(cat) {
    document.getElementById('idCategoriaGasto').value = cat.idCategoriaGasto;
    document.getElementById('nombreCatGasto').value = cat.nombreCatGasto;

    document.getElementById('form-kicker').textContent = "Edición de Registro";
    document.getElementById('form-title').textContent = `Modificando: ${cat.nombreCatGasto}`;
    document.getElementById('btnGuardar').textContent = "Actualizar Categoría";
    document.getElementById('btnCancelar').style.display = 'inline-flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.resetearFormulario = () => {
    form.reset();
    document.getElementById('idCategoriaGasto').value = '';
    document.getElementById('formStatus').textContent = '';
    document.getElementById('form-kicker').textContent = "Nuevo Registro";
    document.getElementById('form-title').textContent = "Crear Categoría de Gasto";
    document.getElementById('btnGuardar').textContent = "Guardar Categoría";
    document.getElementById('btnCancelar').style.display = 'none';
};

// DELETE
function abrirModalEliminar(id) {
    idEliminarSeleccionado = id;
    confirmDialog.showModal();
}

async function procesarEliminacion() {
    if (!idEliminarSeleccionado) return;

    try {
        const token = getToken();
        await apiRequest(`/api/admin/categorias-gastos/${idEliminarSeleccionado}`, {
            method: 'DELETE', token
        });

        mostrarToast("Categoría eliminada.");
        confirmDialog.close();
        await cargarCategorias();
    } catch (error) {
        mostrarToast("Error al eliminar: " + error.message);
    } finally {
        idEliminarSeleccionado = null;
    }
}

function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.hidden = false;
    setTimeout(() => { toast.hidden = true; }, 3500);
}