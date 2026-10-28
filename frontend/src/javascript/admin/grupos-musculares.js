import { apiRequest, getToken, clearToken } from '../api.js';
import { renderAdminLayout } from '../layout-admin.js';

const form = document.getElementById('formGrupoMuscular');
const tabla = document.getElementById('tablaGruposMusculares');
const confirmDialog = document.getElementById('confirmDialog');
const inputBuscar = document.getElementById('inputBuscar');
const cantResultados = document.getElementById('cantResultados');
const toast = document.getElementById('toast');

let gruposTotales = [];
let idEliminarSeleccionado = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Marcamos la sección como activa
    renderAdminLayout('grupo_muscular');

    const token = getToken();
    if (!token) {
        window.location.href = '/inicio-sesion.html';
        return;
    }

    inputBuscar?.addEventListener('input', aplicarFiltros);
    document.getElementById('btnCancelarModal')?.addEventListener('click', () => confirmDialog.close());
    document.getElementById('btnConfirmarEliminar')?.addEventListener('click', procesarEliminacion);

    await cargarGrupos();
});

// GET
async function cargarGrupos() {
    try {
        const token = getToken();
        // Usamos la URL correcta pluralizada
        gruposTotales = await apiRequest('/api/admin/grupos-musculares', { token });
        aplicarFiltros();
    } catch (error) {
        mostrarToast("Error al cargar: " + error.message);
    }
}

function renderizarTabla(lista) {
    tabla.innerHTML = '';
    cantResultados.textContent = `${lista.length} registro(s)`;

    if (lista.length === 0) {
        tabla.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 28px; color: var(--muted);">No se encontraron grupos musculares.</td></tr>`;
        return;
    }

    lista.forEach(grupo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${grupo.idGrupoMusc}</td>
            <td><strong>${grupo.nombreGrupo}</strong></td>
            <td>
                <div class="table-actions">
                    <button type="button" data-edit="${grupo.idGrupoMusc}">Modificar</button>
                    <button type="button" class="is-danger" data-delete="${grupo.idGrupoMusc}">Eliminar</button>
                </div>
            </td>
        `;

        tr.querySelector(`[data-edit="${grupo.idGrupoMusc}"]`).addEventListener('click', () => prepararEdicion(grupo));
        tr.querySelector(`[data-delete="${grupo.idGrupoMusc}"]`).addEventListener('click', () => abrirModalEliminar(grupo.idGrupoMusc));
        tabla.appendChild(tr);
    });
}

function aplicarFiltros() {
    const texto = inputBuscar.value.toLowerCase().trim();
    const filtrados = gruposTotales.filter(grupo =>
        grupo.nombreGrupo.toLowerCase().includes(texto)
    );
    renderizarTabla(filtrados);
}

// POST / PUT
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusMsg = document.getElementById('formStatus');
    statusMsg.textContent = '';

    const id = document.getElementById('idGrupoMusc').value;
    const token = getToken();
    const payload = { nombreGrupo: document.getElementById('nombreGrupo').value };

    try {
        if (id) {
            await apiRequest(`/api/admin/grupos-musculares/${id}`, {
                method: 'PUT', body: JSON.stringify(payload), token
            });
            mostrarToast("Grupo muscular actualizado con éxito.");
        } else {
            await apiRequest('/api/admin/grupos-musculares', {
                method: 'POST', body: JSON.stringify(payload), token
            });
            mostrarToast("Grupo muscular creado con éxito.");
        }

        window.resetearFormulario();
        await cargarGrupos();
    } catch (error) {
        statusMsg.textContent = error.message;
    }
});

function prepararEdicion(grupo) {
    document.getElementById('idGrupoMusc').value = grupo.idGrupoMusc;
    document.getElementById('nombreGrupo').value = grupo.nombreGrupo;

    document.getElementById('form-kicker').textContent = "Edición de Registro";
    document.getElementById('form-title').textContent = `Modificando: ${grupo.nombreGrupo}`;
    document.getElementById('btnGuardar').textContent = "Actualizar Grupo";
    document.getElementById('btnCancelar').style.display = 'inline-flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.resetearFormulario = () => {
    form.reset();
    document.getElementById('idGrupoMusc').value = '';
    document.getElementById('formStatus').textContent = '';
    document.getElementById('form-kicker').textContent = "Nuevo Registro";
    document.getElementById('form-title').textContent = "Crear Grupo Muscular";
    document.getElementById('btnGuardar').textContent = "Guardar Grupo";
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
        await apiRequest(`/api/admin/grupos-musculares/${idEliminarSeleccionado}`, {
            method: 'DELETE', token
        });

        mostrarToast("Grupo muscular eliminado.");
        confirmDialog.close();
        await cargarGrupos();
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