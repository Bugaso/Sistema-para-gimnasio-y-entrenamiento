import { apiRequest, getToken } from '../api.js';
import { renderCoachLayout } from '../layout-coach.js';

// Elementos DOM
const formRutina = document.getElementById('formRutina');
const formAsignacion = document.getElementById('formAsignacion');
const tablaDetalles = document.getElementById('tablaDetalles');
const btnAgregarEjercicio = document.getElementById('btnAgregarEjercicio');
const toast = document.getElementById('toast');

// Datos cacheados para las filas dinámicas
let opcionesEjercicios = '<option value="">Seleccione...</option>';
// Simulamos el ID del Coach autenticado. En un entorno real, lo decodificas del JWT.
let idCoachActual = null;

document.addEventListener('DOMContentLoaded', async () => {
    renderCoachLayout('rutinas');

    const token = getToken();
    if (!token) {
        window.location.href = '/inicio-sesion.html';
        return;
    }

    idCoachActual = decodificarIdCoach(token);

    // Cargar catálogos
    await cargarEjercicios();
    await cargarClientes();
    await cargarPlantillas();

    btnAgregarEjercicio.addEventListener('click', agregarFilaEjercicio);

    // Agregar una fila vacía por defecto
    agregarFilaEjercicio();
});

// --- LÓGICA DE CATÁLOGOS ---

async function cargarEjercicios() {
    try {
        // Asegúrate de tener este endpoint expuesto en tu backend (puede ser el de admin)
        const ejercicios = await apiRequest('/api/v1/public/ejercicios', { token: getToken() });
        ejercicios.forEach(ej => {
            opcionesEjercicios += `<option value="${ej.idEjercicio}">${ej.nombreEjercicio}</option>`;
        });
    } catch (error) {
        console.warn("No se pudieron cargar los ejercicios. Verifica la URL de la API.");
    }
}

async function cargarClientes() {
    try {
        const clientes = await apiRequest('/api/usuarios/clientes', { token: getToken() });
        const select = document.getElementById('idClienteAsignar');
        select.innerHTML = '<option value="">Seleccione cliente...</option>';
        clientes.forEach(c => {
            select.innerHTML += `<option value="${c.idUsuario}">${c.nomApe} (DNI: ${c.dniUs})</option>`;
        });
    } catch (error) { console.error(error); }
}

async function cargarPlantillas() {
    try {
        // Si no tienes este endpoint aún en el controlador, te recomiendo agregarlo: GET /api/coach/rutinas/plantillas
        const plantillas = await apiRequest('/api/coach/rutinas/plantillas', { token: getToken() });
        const select = document.getElementById('idRutinaAsignar');
        select.innerHTML = '<option value="">Seleccione plantilla...</option>';
        plantillas.forEach(p => {
            select.innerHTML += `<option value="${p.idRutina}">${p.nombreRutina}</option>`;
        });
    } catch (error) { console.warn("Aún no hay plantillas o falta el endpoint."); }
}

// --- LÓGICA DE TABLA DINÁMICA ---

function agregarFilaEjercicio() {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>
            <select class="table-input dia-sel" required>
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miércoles">Miércoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
            </select>
        </td>
        <td>
            <select class="table-input ej-sel" required>
                ${opcionesEjercicios}
            </select>
        </td>
        <td><input type="text" class="table-input ser-inp" placeholder="Ej: 4" required /></td>
        <td><input type="text" class="table-input rep-inp" placeholder="Ej: 8-12" required /></td>
        <td><input type="text" class="table-input pes-inp" placeholder="Ej: 20kg" /></td>
        <td>
            <button type="button" class="is-danger remove-btn">X</button>
        </td>
    `;

    tr.querySelector('.remove-btn').addEventListener('click', () => {
        tr.remove();
    });

    tablaDetalles.appendChild(tr);
}

// --- ENVÍO DE FORMULARIOS ---

formRutina.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('formStatusCreate');
    status.textContent = '';

    const detalles = [];
    const filas = tablaDetalles.querySelectorAll('tr');

    if (filas.length === 0) {
        status.textContent = 'Debe agregar al menos un ejercicio.';
        return;
    }

    filas.forEach(fila => {
        detalles.push({
            idEjercicio: parseInt(fila.querySelector('.ej-sel').value),
            diaSemana: fila.querySelector('.dia-sel').value,
            rangoSeries: fila.querySelector('.ser-inp').value,
            rangoRep: fila.querySelector('.rep-inp').value,
            rangoPeso: fila.querySelector('.pes-inp').value,
            // idMedidaEsfuerzo y tiempoEstimado se pueden agregar luego al HTML si los necesitas
        });
    });

    const payload = {
        nombreRutina: document.getElementById('nombreRutina').value.trim(),
        descripcion: document.getElementById('descripcionRutina').value.trim(),
        esPlantilla: document.getElementById('esPlantilla').checked,
        idUsCoach: idCoachActual,
        detalles: detalles
    };

    try {
        await apiRequest('/api/coach/rutinas/crear', {
            method: 'POST',
            body: JSON.stringify(payload),
            token: getToken()
        });
        mostrarToast('Rutina guardada con éxito');
        formRutina.reset();
        tablaDetalles.innerHTML = '';
        agregarFilaEjercicio();
        await cargarPlantillas(); // Refrescar la lista de plantillas abajo
    } catch (error) {
        status.textContent = error.message;
    }
});

formAsignacion.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('formStatusAssign');
    status.textContent = '';

    const payload = {
        idUsuario: parseInt(document.getElementById('idClienteAsignar').value),
        idUsCoach: idCoachActual,
        idRutina: parseInt(document.getElementById('idRutinaAsignar').value),
        duracionPlan: document.getElementById('duracionPlan').value.trim()
    };

    try {
        await apiRequest('/api/coach/rutinas/asignar', {
            method: 'POST',
            body: JSON.stringify(payload),
            token: getToken()
        });
        mostrarToast('Rutina asignada exitosamente');
        formAsignacion.reset();
    } catch (error) {
        status.textContent = error.message;
    }
});

function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.hidden = false;
    setTimeout(() => { toast.hidden = true; }, 3500);
}

// Utilidad simple para extraer el ID del Token JWT (Depende de cómo armaste tu payload en Spring Boot)
function decodificarIdCoach(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        // Ajusta 'idUsuario' por la clave real que uses en tu JWT (ej: 'id', 'sub', 'userId')
        return payload.idUsuario || 1;
    } catch (e) {
        return 1; // Fallback temporal
    }
}