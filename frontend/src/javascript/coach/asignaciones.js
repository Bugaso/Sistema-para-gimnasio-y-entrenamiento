import { apiRequest, getToken } from '../api.js';
import { renderCoachLayout } from '../layout-coach.js';

const formAsignacion = document.getElementById('formAsignacion');
const tablaAsignaciones = document.getElementById('tablaAsignaciones');
const toast = document.getElementById('toast');
let idCoachActual = null;

document.addEventListener('DOMContentLoaded', async () => {
    renderCoachLayout('asignaciones');
    const token = getToken();
    if (!token) { window.location.href = '/login'; return; }

    idCoachActual = decodificarIdCoach(token);

    await cargarClientes();
    await cargarPlantillas();
    await cargarTablaAsignaciones(); // Necesitaremos este endpoint en Spring Boot
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
        const plantillas = await apiRequest('/api/coach/rutina/plantillas', { token: getToken() });
        const select = document.getElementById('idRutinaAsignar');
        select.innerHTML = '<option value="">Seleccione plantilla...</option>';
        plantillas.forEach(p => select.innerHTML += `<option value="${p.idRutina}">${p.nombreRutina}</option>`);
    } catch (error) { console.warn(error); }
}

async function cargarTablaAsignaciones() {
    try {
        // Asegúrate de crear este endpoint GET en RutinaController
        const asignaciones = await apiRequest('/api/coach/rutina/asignaciones', { token: getToken() });
        tablaAsignaciones.innerHTML = '';
        if(asignaciones.length === 0) {
            tablaAsignaciones.innerHTML = '<tr><td colspan="6">No hay asignaciones registradas.</td></tr>';
            return;
        }
        asignaciones.forEach(asig => {
            tablaAsignaciones.innerHTML += `
                <tr>
                    <td>${asig.clienteNombre}</td>
                    <td>${asig.clienteDni}</td>
                    <td>${asig.rutinaNombre}</td>
                    <td>${asig.fechaPlan}</td>
                    <td>${asig.duracionPlan}</td>
                    <td>
                        <button class="admin-primary-action" style="padding: 4px 8px; font-size: 0.8rem;" onclick="eliminarAsignacion(${asig.idCliCou})">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tablaAsignaciones.innerHTML = '<tr><td colspan="6">Error al cargar datos.</td></tr>';
    }
}

window.eliminarAsignacion = async function(id) {
    if(!confirm('¿Estás seguro de eliminar esta asignación?')) return;
    try {
        await apiRequest(`/api/coach/rutina/asignacion/${id}`, { method: 'DELETE', token: getToken() });
        mostrarToast('Asignación eliminada');
        cargarTablaAsignaciones();
    } catch (error) { alert('Error: ' + error.message); }
}

formAsignacion.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        idUsuario: parseInt(document.getElementById('idClienteAsignar').value),
        idUsCoach: idCoachActual,
        idRutina: parseInt(document.getElementById('idRutinaAsignar').value),
        duracionPlan: document.getElementById('duracionPlan').value.trim()
    };
    try {
        await apiRequest('/api/coach/rutina/asignar', { method: 'POST', body: JSON.stringify(payload), token: getToken() });
        mostrarToast('Rutina asignada exitosamente');
        formAsignacion.reset();
        cargarTablaAsignaciones();
    } catch (error) {
        document.getElementById('formStatusAssign').textContent = error.message;
    }
});

function mostrarToast(m) { toast.textContent = m; toast.hidden = false; setTimeout(() => toast.hidden = true, 3000); }
function decodificarIdCoach(t) { try { return JSON.parse(window.atob(t.split('.')[1])).idUsuario || 1; } catch (e) { return 1; } }