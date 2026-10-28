import { apiRequest, getToken, clearToken } from '../api.js';
import { renderAdminLayout } from '../layout-admin.js';

const form = document.getElementById('formEjercicio');
const tabla = document.getElementById('tablaEjercicios');
const confirmDialog = document.getElementById('confirmDialog');
const inputBuscar = document.getElementById('inputBuscar');
const filtroCategoria = document.getElementById('filtroCategoria');
const selectCatGen = document.getElementById('idCatGen');
const selectEquip = document.getElementById('idEquip');
const cantResultados = document.getElementById('cantResultados');
const toast = document.getElementById('toast');

let ejerciciosTotales = [];
let categoriasCargadas = [];
let idEliminarSeleccionado = null;

document.addEventListener('DOMContentLoaded', async () => {
    renderAdminLayout('ejercicios');

    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }

    inputBuscar?.addEventListener('input', aplicarFiltros);
    filtroCategoria?.addEventListener('change', aplicarFiltros);
    document.getElementById('btnCancelarModal')?.addEventListener('click', () => confirmDialog.close());
    document.getElementById('btnConfirmarEliminar')?.addEventListener('click', procesarEliminacion);

    // Cargar listas dependientes antes de los ejercicios
    await Promise.all([cargarCategorias(), cargarEquipamientos()]);
    await cargarEjercicios();
});

// GET CATEGORÍAS
async function cargarCategorias() {
    try {
        const token = getToken();
        categoriasCargadas = await apiRequest('/api/admin/categorias-ejercicios', { token });

        let opciones = '<option value="">Selecciona una categoría...</option>';
        let opcionesFiltro = '<option value="">Todas las Categorías</option>';

        categoriasCargadas.forEach(cat => {
            opciones += `<option value="${cat.idCategoriaGen}">${cat.nombreCat}</option>`;
            opcionesFiltro += `<option value="${cat.idCategoriaGen}">${cat.nombreCat}</option>`;
        });

        selectCatGen.innerHTML = opciones;
        filtroCategoria.innerHTML = opcionesFiltro;
    } catch (error) {
        console.error("Error al cargar categorías", error);
    }
}

// GET EQUIPAMIENTOS
async function cargarEquipamientos() {
    try {
        const token = getToken();
        const equipamientos = await apiRequest('/api/admin/equipamiento', { token });

        let opciones = '<option value="">Selecciona equipamiento...</option>';
        equipamientos.forEach(eq => {
            opciones += `<option value="${eq.idEquipamiento}">${eq.nomEquipamiento}</option>`;
        });
        selectEquip.innerHTML = opciones;
    } catch (error) {
        console.error("Error al cargar equipamientos", error);
    }
}

// GET EJERCICIOS
async function cargarEjercicios() {
    try {
        const token = getToken();
        ejerciciosTotales = await apiRequest('/api/admin/ejercicios', { token });
        aplicarFiltros();
    } catch (error) {
        mostrarToast("Error al cargar ejercicios: " + error.message);
    }
}

function renderizarTabla(lista) {
    tabla.innerHTML = '';
    cantResultados.textContent = `${lista.length} registro(s)`;

    if (lista.length === 0) {
        tabla.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 28px; color: var(--muted);">No se encontraron ejercicios.</td></tr>`;
        return;
    }

    lista.forEach(ej => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div>
                    <strong>${ej.nomEjercicio}</strong>
                </div>
            </td>
            <td>
                <span class="role-label">${ej.nombreCategoria}</span><br>
                <small style="color: var(--muted);">${ej.nombreEquipamiento}</small>
            </td>
            <td>
                <div class="table-actions">
                    <button type="button" data-edit="${ej.idEjercicio}">Modificar</button>
                    <button type="button" class="is-danger" data-delete="${ej.idEjercicio}">Eliminar</button>
                </div>
            </td>
        `;

        tr.querySelector(`[data-edit="${ej.idEjercicio}"]`).addEventListener('click', () => prepararEdicion(ej));
        tr.querySelector(`[data-delete="${ej.idEjercicio}"]`).addEventListener('click', () => abrirModalEliminar(ej.idEjercicio));
        tabla.appendChild(tr);
    });
}

function aplicarFiltros() {
    const texto = inputBuscar.value.toLowerCase().trim();
    const catFiltroId = filtroCategoria.value ? parseInt(filtroCategoria.value) : null;

    const filtrados = ejerciciosTotales.filter(ej => {
        const coincideTexto = ej.nomEjercicio.toLowerCase().includes(texto);
        const coincideCat = !catFiltroId || ej.idCatGen === catFiltroId;
        return coincideTexto && coincideCat;
    });
    renderizarTabla(filtrados);
}

// POST / PUT
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusMsg = document.getElementById('formStatus');
    statusMsg.textContent = '';

    const id = document.getElementById('idEjercicio').value;
    const token = getToken();

    const payload = {
        nomEjercicio: document.getElementById('nomEjercicio').value,
        idCatGen: parseInt(document.getElementById('idCatGen').value),
        idEquip: parseInt(document.getElementById('idEquip').value),
        descEjercicio: document.getElementById('descEjercicio').value,
        dirImgEjercicio: document.getElementById('dirImgEjercicio').value
    };

    try {
        if (id) {
            await apiRequest(`/api/admin/ejercicios/${id}`, {
                method: 'PUT', body: JSON.stringify(payload), token
            });
            mostrarToast("Ejercicio actualizado con éxito.");
        } else {
            await apiRequest('/api/admin/ejercicios', {
                method: 'POST', body: JSON.stringify(payload), token
            });
            mostrarToast("Ejercicio creado con éxito.");
        }

        window.resetearFormulario();
        await cargarEjercicios();
    } catch (error) {
        statusMsg.textContent = error.message;
    }
});

function prepararEdicion(ej) {
    document.getElementById('idEjercicio').value = ej.idEjercicio;
    document.getElementById('nomEjercicio').value = ej.nomEjercicio;
    document.getElementById('idCatGen').value = ej.idCatGen || '';
    document.getElementById('idEquip').value = ej.idEquip || '';
    document.getElementById('descEjercicio').value = ej.descEjercicio || '';
    document.getElementById('dirImgEjercicio').value = ej.dirImgEjercicio || '';

    document.getElementById('form-kicker').textContent = "Edición de Registro";
    document.getElementById('form-title').textContent = `Modificando: ${ej.nomEjercicio}`;
    document.getElementById('btnGuardar').textContent = "Actualizar Ejercicio";
    document.getElementById('btnCancelar').style.display = 'inline-flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.resetearFormulario = () => {
    form.reset();
    document.getElementById('idEjercicio').value = '';
    document.getElementById('formStatus').textContent = '';
    document.getElementById('form-kicker').textContent = "Nuevo Registro";
    document.getElementById('form-title').textContent = "Crear Ejercicio";
    document.getElementById('btnGuardar').textContent = "Guardar Ejercicio";
    document.getElementById('btnCancelar').style.display = 'none';
};

function abrirModalEliminar(id) {
    idEliminarSeleccionado = id;
    confirmDialog.showModal();
}

async function procesarEliminacion() {
    if (!idEliminarSeleccionado) return;

    try {
        const token = getToken();
        await apiRequest(`/api/admin/ejercicios/${idEliminarSeleccionado}`, {
            method: 'DELETE', token
        });

        mostrarToast("Ejercicio eliminado.");
        confirmDialog.close();
        await cargarEjercicios();
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