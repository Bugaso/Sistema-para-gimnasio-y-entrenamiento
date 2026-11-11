import { apiRequest, getToken } from '../api.js';
import { renderCoachLayout } from '../layout-coach.js';

const formAsignacion = document.getElementById('formAsignacion');
const tablaAsignaciones = document.getElementById('tablaAsignaciones');
const toast = document.getElementById('toast');

// Modal Eliminar DOM
const modalEliminar = document.getElementById('confirmDialogEliminar');
const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');

// Datos cacheados
let asignacionesTotales = [];
let rutinaDetalleActual = null;
let idAsignacionAEliminar = null;

document.addEventListener('DOMContentLoaded', async () => {
    renderCoachLayout('asignaciones');
    const token = getToken();
    if (!token) { window.location.href = '/login'; return; }

    await cargarClientes();
    await cargarPlantillas();
    await cargarTablaAsignaciones();

    // DELEGACIÓN DE EVENTOS PARA BOTONES DE LA TABLA
    tablaAsignaciones.addEventListener('click', async (e) => {
        const btnVer = e.target.closest('.btn-ver');
        const btnEliminar = e.target.closest('.btn-eliminar');

        if (btnVer) {
            await verDetalleRutina(btnVer.dataset.idRutina);
        }

        if (btnEliminar) {
            abrirModalEliminar(btnEliminar.dataset.id);
        }
    });

    // EVENTOS DEL MODAL DE DETALLE
    document.getElementById('CerrarModal')?.addEventListener('click', () => {
        document.getElementById('modalDetalle').style.display = 'none';
    });

    document.getElementById('selectDiaFiltro')?.addEventListener('change', (e) => {
        renderizarEjerciciosPorDia(e.target.value);
    });

    // EVENTOS DEL MODAL DE ELIMINACIÓN
    btnCancelarEliminar?.addEventListener('click', () => {
        modalEliminar.close();
        idAsignacionAEliminar = null;
    });

    btnConfirmarEliminar?.addEventListener('click', procesarEliminacion);
});

async function cargarClientes() {
    try {
        const clientes = await apiRequest('/api/usuarios/clientes', { token: getToken() });
        const select = document.getElementById('idClienteAsignar');
        select.innerHTML = '<option value="">Seleccione cliente...</option>';
        clientes.forEach(c => select.innerHTML += `<option value="${c.idUsuario}">${c.nomApe} (DNI: ${c.dniUs})</option>`);
    } catch (error) { console.error(error); }
}

async function cargarPlantillas() {
    try {
        const rutinas = await apiRequest('/api/coach/rutina/listado', { token: getToken() });
        const select = document.getElementById('idRutinaAsignar');
        select.innerHTML = '<option value="">Seleccione rutina...</option>';

        const plantillasGenerales = rutinas.filter(r => r.esPlantilla === true);
        const rutinasPersonalizadas = rutinas.filter(r => r.esPlantilla === false);

        if (plantillasGenerales.length > 0) {
            let grupoPlantillas = '<optgroup label="Plantillas Generales">';
            plantillasGenerales.forEach(p => {
                grupoPlantillas += `<option value="${p.idRutina}">${p.nombreRutina}</option>`;
            });
            grupoPlantillas += '</optgroup>';
            select.innerHTML += grupoPlantillas;
        }

        if (rutinasPersonalizadas.length > 0) {
            let grupoPersonalizadas = '<optgroup label="Rutinas Personalizadas">';
            rutinasPersonalizadas.forEach(p => {
                grupoPersonalizadas += `<option value="${p.idRutina}">${p.nombreRutina}</option>`;
            });
            grupoPersonalizadas += '</optgroup>';
            select.innerHTML += grupoPersonalizadas;
        }
    } catch (error) { console.warn("Error al cargar las rutinas para asignar.", error); }
}

async function cargarTablaAsignaciones() {
    try {
        const asignaciones = await apiRequest('/api/coach/rutina/asignaciones', { token: getToken() });
        asignacionesTotales = asignaciones;
        tablaAsignaciones.innerHTML = '';

        if(asignaciones.length === 0) {
            tablaAsignaciones.innerHTML = '<tr><td colspan="6">No hay asignaciones registradas.</td></tr>';
            return;
        }

        const estiloBotonBase = "background: transparent; border: 1px solid #d1d5d2; color: #555; padding: 6px 12px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.5px; cursor: pointer; border-radius: 4px; transition: all 0.2s;";
        const estiloVer = estiloBotonBase + " margin-right: 8px;";
        const estiloEliminarHover = "onmouseover=\"this.style.borderColor='#ef7e64'; this.style.color='#ef7e64'\" onmouseout=\"this.style.borderColor='#d1d5d2'; this.style.color='#555'\"";

        asignaciones.forEach(asig => {
            tablaAsignaciones.innerHTML += `
                <tr>
                    <td><strong>${asig.clienteNombre}</strong></td>
                    <td>${asig.clienteDni}</td>
                    <td>${asig.rutinaNombre}</td>
                    <td>${asig.fechaPlan}</td>
                    <td>${asig.duracionPlan}</td>
                    <td style="display: flex; gap: 8px;">
                        <button type="button" class="btn-ver" data-id-rutina="${asig.idRutina}" style="${estiloVer}" onmouseover="this.style.background='#f7f9f9'" onmouseout="this.style.background='transparent'">VER</button>
                        <button type="button" class="btn-eliminar" data-id="${asig.idCliCou}" style="${estiloBotonBase}" ${estiloEliminarHover}>ELIMINAR</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tablaAsignaciones.innerHTML = '<tr><td colspan="6">Error al cargar datos.</td></tr>';
    }
}

// --- LÓGICA DEL MODAL "VER DETALLE" ---
async function verDetalleRutina(idRutina) {
    try {
        const rutina = await apiRequest(`/api/coach/rutina/${idRutina}`, { token: getToken() });
        rutinaDetalleActual = rutina;

        document.getElementById('modalTituloRutina').textContent = rutina.nombreRutina;
        document.getElementById('modalDescRutina').textContent = rutina.descripcion || 'Sin descripción';
        document.getElementById('modalTipoRutina').innerHTML = rutina.esPlantilla ?
            'Tipo: <span style="color: var(--lime);">Plantilla General</span>' :
            'Tipo: <span style="color: #666;">Personalizada</span>';

        const diasDisponibles = [...new Set(rutina.detalles.map(d => d.diaSemana))];
        const selectDia = document.getElementById('selectDiaFiltro');
        selectDia.innerHTML = '';

        if (diasDisponibles.length === 0) {
            selectDia.innerHTML = '<option value="">Sin días registrados</option>';
            document.getElementById('tablaModalDetalles').innerHTML = '<tr><td colspan="5">No hay ejercicios asignados.</td></tr>';
        } else {
            diasDisponibles.forEach(dia => {
                selectDia.innerHTML += `<option value="${dia}">${dia}</option>`;
            });
            renderizarEjerciciosPorDia(diasDisponibles[0]);
        }

        document.getElementById('modalDetalle').style.display = 'flex';
    } catch (error) {
        alert('Error al cargar el detalle de la rutina.');
        console.error(error);
    }
}

function renderizarEjerciciosPorDia(diaSeleccionado) {
    const tbodyModal = document.getElementById('tablaModalDetalles');
    tbodyModal.innerHTML = '';

    const ejerciciosFiltrados = rutinaDetalleActual.detalles.filter(d => d.diaSemana === diaSeleccionado);

    if (ejerciciosFiltrados.length === 0) {
        tbodyModal.innerHTML = `<tr><td colspan="5">No hay ejercicios para el día ${diaSeleccionado}.</td></tr>`;
        return;
    }

    ejerciciosFiltrados.forEach(d => {
        tbodyModal.innerHTML += `
            <tr>
                <td><strong>${d.nombreEjercicio}</strong></td>
                <td>${d.rangoSeries || '-'}</td>
                <td>${d.rangoRep || '-'}</td>
                <td>${d.rangoPeso || '-'}</td>
                <td>${d.medidaEsfuerzo || '-'} - ${d.cantMedida || ''}</td>
            </tr>
        `;
    });
}

// --- LÓGICA DEL MODAL DE ELIMINACIÓN ---
function abrirModalEliminar(id) {
    idAsignacionAEliminar = id;
    const asig = asignacionesTotales.find(a => a.idCliCou == id);
    if (!asig) return;

    document.getElementById('modalEliminarCliente').textContent = asig.clienteNombre || '-';
    document.getElementById('modalEliminarRutina').textContent = asig.rutinaNombre || '-';
    document.getElementById('modalEliminarFecha').textContent = `${asig.fechaPlan || '-'} (${asig.duracionPlan || '-'})`;

    modalEliminar.showModal();
}

async function procesarEliminacion() {
    if (!idAsignacionAEliminar) return;

    btnConfirmarEliminar.textContent = 'Eliminando...';
    btnConfirmarEliminar.disabled = true;

    try {
        await apiRequest(`/api/coach/rutina/asignacion/${idAsignacionAEliminar}`, { method: 'DELETE', token: getToken() });
        mostrarToast('Asignación eliminada con éxito');
        modalEliminar.close();
        await cargarTablaAsignaciones();
    } catch (error) {
        alert('Error al eliminar: ' + error.message);
    } finally {
        btnConfirmarEliminar.textContent = 'ELIMINAR ASIGNACIÓN';
        btnConfirmarEliminar.disabled = false;
        idAsignacionAEliminar = null;
    }
}

// --- CREAR ASIGNACIÓN ---
formAsignacion.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        idUsuario: parseInt(document.getElementById('idClienteAsignar').value),
        idUsCoach: null,
        idRutina: parseInt(document.getElementById('idRutinaAsignar').value),
        duracionPlan: document.getElementById('duracionPlan').value.trim()
    };
    try {
        await apiRequest('/api/coach/rutina/asignar', { method: 'POST', body: JSON.stringify(payload), token: getToken() });
        mostrarToast('Rutina asignada exitosamente');
        formAsignacion.reset();
        await cargarTablaAsignaciones();
    } catch (error) {
        document.getElementById('formStatusAssign').textContent = error.message;
    }
});

function mostrarToast(m) { toast.textContent = m; toast.hidden = false; setTimeout(() => toast.hidden = true, 3000); }