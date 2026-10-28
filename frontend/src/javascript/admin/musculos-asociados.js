import { apiRequest, getToken, clearToken } from '../api.js';
import { renderAdminLayout } from '../layout-admin.js';

const form = document.getElementById('formMusculosAsociados');
const tabla = document.getElementById('tablaRelaciones');
const confirmDialog = document.getElementById('confirmDialog');
const inputBuscar = document.getElementById('inputBuscar');
const selectEjercicio = document.getElementById('idEjercicio');
const selectGrupoMusc = document.getElementById('idGrupoMusc');
const cantResultados = document.getElementById('cantResultados');
const toast = document.getElementById('toast');

let relacionesTotales = [];
let idEliminarSeleccionado = null;

document.addEventListener('DOMContentLoaded', async () => {
    renderAdminLayout('musculos_asociados');

    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }

    inputBuscar?.addEventListener('input', aplicarFiltros);
    document.getElementById('btnCancelarModal')?.addEventListener('click', () => confirmDialog.close());
    document.getElementById('btnConfirmarEliminar')?.addEventListener('click', procesarEliminacion);

    await Promise.all([cargarEjercicios(), cargarGruposMusculares()]);
    await cargarRelaciones();
});

// Cargas de selects (igual que antes)
async function cargarEjercicios() {
    try {
        const token = getToken();
        const ejercicios = await apiRequest('/api/admin/ejercicios', { token });
        let opciones = '<option value="">Selecciona un ejercicio...</option>';
        ejercicios.forEach(ej => opciones += `<option value="${ej.idEjercicio}">${ej.nomEjercicio}</option>`);
        selectEjercicio.innerHTML = opciones;
    } catch (error) {}
}

async function cargarGruposMusculares() {
    try {
        const token = getToken();
        const grupos = await apiRequest('/api/admin/grupos-musculares', { token });
        let opciones = '<option value="">Selecciona un grupo muscular...</option>';
        grupos.forEach(g => opciones += `<option value="${g.idGrupoMusc}">${g.nombreGrupo}</option>`);
        selectGrupoMusc.innerHTML = opciones;
    } catch (error) {}
}

async function cargarRelaciones() {
    try {
        const token = getToken();
        relacionesTotales = await apiRequest('/api/admin/musculos-asociados', { token });
        aplicarFiltros();
    } catch (error) {
        mostrarToast("Error al cargar: " + error.message);
    }
}

function renderizarTabla(lista) {
    tabla.innerHTML = '';
    cantResultados.textContent = `${lista.length} registro(s)`;

    if (lista.length === 0) {
        tabla.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 28px; color: var(--muted);">No se encontraron relaciones.</td></tr>`;
        return;
    }

    lista.forEach(rel => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${rel.nombreEjercicio}</strong></td>
            <td>${rel.nombreGrupo}</td>
            <td><span class="role-label">${rel.prioridadMusc || '-'}</span></td>
            <td>
                <div class="table-actions">
                    <button type="button" data-edit="${rel.idMuscAsociados}">Modificar</button>
                    <button type="button" class="is-danger" data-delete="${rel.idMuscAsociados}">Eliminar</button>
                </div>
            </td>
        `;

        tr.querySelector(`[data-edit="${rel.idMuscAsociados}"]`).addEventListener('click', () => prepararEdicion(rel));
        tr.querySelector(`[data-delete="${rel.idMuscAsociados}"]`).addEventListener('click', () => abrirModalEliminar(rel.idMuscAsociados));
        tabla.appendChild(tr);
    });
}

function aplicarFiltros() {
    const texto = inputBuscar.value.toLowerCase().trim();
    const filtrados = relacionesTotales.filter(rel =>
        rel.nombreEjercicio.toLowerCase().includes(texto) ||
        rel.nombreGrupo.toLowerCase().includes(texto) ||
        (rel.prioridadMusc && rel.prioridadMusc.toLowerCase().includes(texto))
    );
    renderizarTabla(filtrados);
}

// POST / PUT
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusMsg = document.getElementById('formStatus');
    statusMsg.textContent = '';

    const id = document.getElementById('idMuscAsociados').value;
    const token = getToken();

    const payload = {
        idGrupoMusc: parseInt(selectGrupoMusc.value),
        idEjercicio: parseInt(selectEjercicio.value),
        prioridadMusc: document.getElementById('prioridadMusc').value
    };

    try {
        if (id) {
            await apiRequest(`/api/admin/musculos-asociados/${id}`, {
                method: 'PUT', body: JSON.stringify(payload), token
            });
            mostrarToast("Prioridad actualizada con éxito.");
        } else {
            await apiRequest('/api/admin/musculos-asociados', {
                method: 'POST', body: JSON.stringify(payload), token
            });
            mostrarToast("Vínculo creado con éxito.");
        }

        window.resetearFormulario();
        await cargarRelaciones();
    } catch (error) {
        statusMsg.textContent = error.message;
    }
});

function prepararEdicion(rel) {
    document.getElementById('idMuscAsociados').value = rel.idMuscAsociados;

    selectGrupoMusc.value = rel.idGrupoMusc;
    selectEjercicio.value = rel.idEjercicio;

    // Bloqueamos los selects para que no cambien el músculo/ejercicio en modo edición
    selectGrupoMusc.disabled = true;
    selectEjercicio.disabled = true;

    document.getElementById('prioridadMusc').value = rel.prioridadMusc || '';

    document.getElementById('form-kicker').textContent = "Edición de Registro";
    document.getElementById('form-title').textContent = `Modificando Prioridad`;
    document.getElementById('btnGuardar').textContent = "Actualizar Vínculo";
    document.getElementById('btnCancelar').style.display = 'inline-flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.resetearFormulario = () => {
    form.reset();
    document.getElementById('idMuscAsociados').value = '';

    selectGrupoMusc.disabled = false;
    selectEjercicio.disabled = false;

    document.getElementById('formStatus').textContent = '';
    document.getElementById('form-kicker').textContent = "Nueva Relación";
    document.getElementById('form-title').textContent = "Vincular Músculo a Ejercicio";
    document.getElementById('btnGuardar').textContent = "Guardar Vínculo";
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
        await apiRequest(`/api/admin/musculos-asociados/${idEliminarSeleccionado}`, {
            method: 'DELETE', token
        });

        mostrarToast("Vínculo eliminado correctamente.");
        confirmDialog.close();
        await cargarRelaciones();
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