import { apiRequest, getToken, verificarAccesoRuta } from '../api.js';
import { renderAdminLayout } from '../layout-admin.js';

const form = document.getElementById('formMusculosAsociados');
const tabla = document.getElementById('tablaRelaciones');
const confirmDialog = document.getElementById('confirmDialog');
const errorDuplicadoDialog = document.getElementById('errorDuplicadoDialog');
const inputBuscar = document.getElementById('inputBuscar');
const cantResultados = document.getElementById('cantResultados');
const toast = document.getElementById('toast');

// Campos ocultos y visibles de selección
const hiddenIdEjercicio = document.getElementById('idEjercicio');
const hiddenIdGrupoMusc = document.getElementById('idGrupoMusc');
const inputEjercicioSeleccionado = document.getElementById('inputEjercicioSeleccionado');
const inputGrupoSeleccionado = document.getElementById('inputGrupoSeleccionado');
const btnAbrirModalEjercicios = document.getElementById('btnAbrirModalEjercicios');
const btnAbrirModalGrupos = document.getElementById('btnAbrirModalGrupos');

// Elementos Modal Ejercicios
const modalEjercicios = document.getElementById('modalEjercicios');
const btnCerrarModalEjercicios = document.getElementById('btnCerrarModalEjercicios');
const inputFiltrarEjercicios = document.getElementById('inputFiltrarEjercicios');
const tbodyEjerciciosModal = document.getElementById('tbodyEjerciciosModal');

// Elementos Modal Grupos Musculares
const modalGrupos = document.getElementById('modalGrupos');
const btnCerrarModalGrupos = document.getElementById('btnCerrarModalGrupos');
const inputFiltrarGrupos = document.getElementById('inputFiltrarGrupos');
const tbodyGruposModal = document.getElementById('tbodyGruposModal');

// Caché en memoria
let relacionesTotales = [];
let ejerciciosDisponibles = [];
let gruposDisponibles = [];
let idEliminarSeleccionado = null;

document.addEventListener('DOMContentLoaded', async () => {
    renderAdminLayout('musculos_asociados');
    const tieneAcceso = await verificarAccesoRuta("/admin/validar", "/");
    if (!tieneAcceso) return;

    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }

    inputBuscar?.addEventListener('input', aplicarFiltros);
    document.getElementById('btnCancelarModal')?.addEventListener('click', () => confirmDialog.close());
    document.getElementById('btnConfirmarEliminar')?.addEventListener('click', procesarEliminacion);
    document.getElementById('btnCerrarError')?.addEventListener('click', () => errorDuplicadoDialog.close());

    // Eventos Modal Ejercicios
    btnAbrirModalEjercicios.addEventListener('click', abrirModalEjercicios);
    inputEjercicioSeleccionado.addEventListener('click', abrirModalEjercicios);
    btnCerrarModalEjercicios.addEventListener('click', cerrarModalEjercicios);
    modalEjercicios.addEventListener('click', (e) => {
        if (e.target === modalEjercicios) cerrarModalEjercicios();
    });
    inputFiltrarEjercicios.addEventListener('input', (e) => filtrarEjerciciosModal(e.target.value));

    // Eventos Modal Grupos Musculares
    btnAbrirModalGrupos.addEventListener('click', abrirModalGrupos);
    inputGrupoSeleccionado.addEventListener('click', abrirModalGrupos);
    btnCerrarModalGrupos.addEventListener('click', cerrarModalGrupos);
    modalGrupos.addEventListener('click', (e) => {
        if (e.target === modalGrupos) cerrarModalGrupos();
    });
    inputFiltrarGrupos.addEventListener('input', (e) => filtrarGruposModal(e.target.value));

    // Cerrar modales con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (modalEjercicios.classList.contains('active')) cerrarModalEjercicios();
            if (modalGrupos.classList.contains('active')) cerrarModalGrupos();
        }
    });

    await Promise.all([cargarEjercicios(), cargarGruposMusculares()]);
    await cargarRelaciones();
});

function normalizarTexto(texto) {
    return String(texto || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

// --- CARGA Y MODAL DE EJERCICIOS ---
async function cargarEjercicios() {
    try {
        ejerciciosDisponibles = await apiRequest('/api/admin/ejercicios', { token: getToken() });
        renderizarTablaEjerciciosModal(ejerciciosDisponibles);
    } catch (error) {
        tbodyEjerciciosModal.innerHTML = `<tr><td colspan="2" style="text-align: center; color: #ef4444;">Error al cargar ejercicios.</td></tr>`;
    }
}

function abrirModalEjercicios() {
    if (inputEjercicioSeleccionado.disabled) return;
    inputFiltrarEjercicios.value = '';
    renderizarTablaEjerciciosModal(ejerciciosDisponibles);
    modalEjercicios.classList.add('active');
    setTimeout(() => inputFiltrarEjercicios.focus(), 50);
}

function cerrarModalEjercicios() {
    modalEjercicios.classList.remove('active');
}

function filtrarEjerciciosModal(termino) {
    const query = normalizarTexto(termino);
    if (!query) {
        renderizarTablaEjerciciosModal(ejerciciosDisponibles);
        return;
    }
    const filtrados = ejerciciosDisponibles.filter(ej =>
        normalizarTexto(ej.nomEjercicio).includes(query)
    );
    renderizarTablaEjerciciosModal(filtrados);
}

function renderizarTablaEjerciciosModal(lista) {
    tbodyEjerciciosModal.innerHTML = '';

    if (!lista || lista.length === 0) {
        tbodyEjerciciosModal.innerHTML = `<tr><td colspan="2" style="text-align: center; color: #666;">No se encontraron ejercicios con ese nombre.</td></tr>`;
        return;
    }

    lista.forEach(ej => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${ej.nomEjercicio}</strong></td>
            <td style="text-align: center;">
                <button type="button" class="admin-primary-action btn-elegir-item" style="min-height: 32px; padding: 0 14px; font-size: 0.75rem;">
                    Seleccionar
                </button>
            </td>
        `;
        tr.querySelector('.btn-elegir-item').addEventListener('click', () => {
            hiddenIdEjercicio.value = ej.idEjercicio;
            inputEjercicioSeleccionado.value = ej.nomEjercicio;
            cerrarModalEjercicios();
        });
        tbodyEjerciciosModal.appendChild(tr);
    });
}

// --- CARGA Y MODAL DE GRUPOS MUSCULARES ---
async function cargarGruposMusculares() {
    try {
        gruposDisponibles = await apiRequest('/api/admin/grupos-musculares', { token: getToken() });
        renderizarTablaGruposModal(gruposDisponibles);
    } catch (error) {
        tbodyGruposModal.innerHTML = `<tr><td colspan="2" style="text-align: center; color: #ef4444;">Error al cargar grupos musculares.</td></tr>`;
    }
}

function abrirModalGrupos() {
    if (inputGrupoSeleccionado.disabled) return;
    inputFiltrarGrupos.value = '';
    renderizarTablaGruposModal(gruposDisponibles);
    modalGrupos.classList.add('active');
    setTimeout(() => inputFiltrarGrupos.focus(), 50);
}

function cerrarModalGrupos() {
    modalGrupos.classList.remove('active');
}

function filtrarGruposModal(termino) {
    const query = normalizarTexto(termino);
    if (!query) {
        renderizarTablaGruposModal(gruposDisponibles);
        return;
    }
    const filtrados = gruposDisponibles.filter(g =>
        normalizarTexto(g.nombreGrupo).includes(query)
    );
    renderizarTablaGruposModal(filtrados);
}

function renderizarTablaGruposModal(lista) {
    tbodyGruposModal.innerHTML = '';

    if (!lista || lista.length === 0) {
        tbodyGruposModal.innerHTML = `<tr><td colspan="2" style="text-align: center; color: #666;">No se encontraron grupos musculares con ese nombre.</td></tr>`;
        return;
    }

    lista.forEach(g => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${g.nombreGrupo}</strong></td>
            <td style="text-align: center;">
                <button type="button" class="admin-primary-action btn-elegir-item" style="min-height: 32px; padding: 0 14px; font-size: 0.75rem;">
                    Seleccionar
                </button>
            </td>
        `;
        tr.querySelector('.btn-elegir-item').addEventListener('click', () => {
            hiddenIdGrupoMusc.value = g.idGrupoMusc;
            inputGrupoSeleccionado.value = g.nombreGrupo;
            cerrarModalGrupos();
        });
        tbodyGruposModal.appendChild(tr);
    });
}

// --- TABLA PRINCIPAL DE RELACIONES ---
async function cargarRelaciones() {
    try {
        relacionesTotales = await apiRequest('/api/admin/musculos-asociados', { token: getToken() });
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
    const texto = normalizarTexto(inputBuscar.value);
    const filtrados = relacionesTotales.filter(rel =>
        normalizarTexto(rel.nombreEjercicio).includes(texto) ||
        normalizarTexto(rel.nombreGrupo).includes(texto) ||
        normalizarTexto(rel.prioridadMusc).includes(texto)
    );
    renderizarTabla(filtrados);
}

// --- POST / PUT ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusMsg = document.getElementById('formStatus');
    statusMsg.textContent = '';

    const id = document.getElementById('idMuscAsociados').value;
    const token = getToken();

    const idGrup = parseInt(hiddenIdGrupoMusc.value);
    const idEj = parseInt(hiddenIdEjercicio.value);

    if (!idEj || !idGrup) {
        statusMsg.textContent = "Debes seleccionar un ejercicio y un grupo muscular.";
        return;
    }

    if (!id) {
        const existeDuplicado = relacionesTotales.find(rel => rel.idGrupoMusc === idGrup && rel.idEjercicio === idEj);
        if (existeDuplicado) {
            errorDuplicadoDialog.showModal();
            return;
        }
    }

    const payload = {
        idGrupoMusc: idGrup,
        idEjercicio: idEj,
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

    hiddenIdGrupoMusc.value = rel.idGrupoMusc;
    hiddenIdEjercicio.value = rel.idEjercicio;
    inputGrupoSeleccionado.value = rel.nombreGrupo;
    inputEjercicioSeleccionado.value = rel.nombreEjercicio;

    // Bloqueamos los campos y botones para que no cambien el músculo/ejercicio en modo edición
    inputGrupoSeleccionado.disabled = true;
    inputEjercicioSeleccionado.disabled = true;
    btnAbrirModalGrupos.disabled = true;
    btnAbrirModalEjercicios.disabled = true;

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
    hiddenIdEjercicio.value = '';
    hiddenIdGrupoMusc.value = '';

    inputGrupoSeleccionado.disabled = false;
    inputEjercicioSeleccionado.disabled = false;
    btnAbrirModalGrupos.disabled = false;
    btnAbrirModalEjercicios.disabled = false;

    document.getElementById('formStatus').textContent = '';
    document.getElementById('form-kicker').textContent = "Nueva Relación";
    document.getElementById('form-title').textContent = "Vincular Músculo a Ejercicio";
    document.getElementById('btnGuardar').textContent = "Guardar Vínculo";
    document.getElementById('btnCancelar').style.display = 'none';
};

// --- DELETE ---
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
        await cargarRelaciones();
    } catch (error) {
        mostrarToast("Error al eliminar: " + error.message);
    } finally {
        confirmDialog.close();
        idEliminarSeleccionado = null;
    }
}

function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.hidden = false;
    setTimeout(() => { toast.hidden = true; }, 3500);
}