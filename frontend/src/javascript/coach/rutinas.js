import { apiRequest, getToken } from '../api.js';
import { renderCoachLayout } from '../layout-coach.js';

// Elementos DOM
const formRutina = document.getElementById('formRutina');
const tablaDetalles = document.getElementById('tablaDetalles');
const tablaListadoRutinas = document.getElementById('tablaListadoRutinas');
const btnAgregarEjercicio = document.getElementById('btnAgregarEjercicio');
const toast = document.getElementById('toast');

// Datos cacheados
let opcionesEjercicios = '<option value="">Seleccione...</option>';
let idCoachActual = null;
let rutinaDetalleActual = null; // Para el modal de ver detalle

document.addEventListener('DOMContentLoaded', async () => {
    renderCoachLayout('rutinas');

    const token = getToken();
    if (!token) {
        window.location.href = '/inicio-sesion.html';
        return;
    }

    idCoachActual = decodificarIdCoach(token);

    await cargarEjercicios();
    await cargarTablaRutinas();

    btnAgregarEjercicio.addEventListener('click', agregarFilaEjercicio);
    agregarFilaEjercicio();

    // --- DELEGACIÓN DE EVENTOS PARA LOS BOTONES DE LA TABLA ---
    tablaListadoRutinas.addEventListener('click', async (e) => {
        const btnVer = e.target.closest('.btn-ver');
        const btnEliminar = e.target.closest('.btn-eliminar');

        if (btnVer) {
            const id = btnVer.dataset.id;
            await verDetalleRutina(id);
        }

        if (btnEliminar) {
            const id = btnEliminar.dataset.id;
            await eliminarRutina(id);
        }
    });

    // Cerrar modal
    document.getElementById('CerrarModal').addEventListener('click', () => {
        document.getElementById('modalDetalle').style.display = 'none';
    });

    // Cambiar día en el selector del modal
    document.getElementById('selectDiaFiltro').addEventListener('change', (e) => {
        renderizarEjerciciosPorDia(e.target.value);
    });
});


// --- CARGAR CATÁLOGOS Y TABLA ---

async function cargarTablaRutinas() {
    try {
        const rutinas = await apiRequest('/api/coach/rutina/listado', { token: getToken() });
        tablaListadoRutinas.innerHTML = '';

        if(rutinas.length === 0) {
            tablaListadoRutinas.innerHTML = '<tr><td colspan="5">No hay rutinas registradas.</td></tr>';
            return;
        }

        rutinas.forEach(r => {
            const tipoRutina = r.esPlantilla ?
                '<span style="color: #a3e635; font-weight: bold;">Plantilla General</span>' :
                '<span style="color: #9ca3af;">Personalizada</span>';

            tablaListadoRutinas.innerHTML += `
                <tr>
                    <td><strong>${r.nombreRutina}</strong></td>
                    <td>${r.descripcion || '-'}</td>
                    <td>${tipoRutina}</td>
                    <td>${r.fechaCreacion || '-'}</td>
                    <td>
                        <button type="button" class="admin-primary-action btn-ver" data-id="${r.idRutina}" style="padding: 4px 8px; font-size: 0.8rem; margin-right: 4px;">Ver</button>
                        <button type="button" class="is-danger btn-eliminar" data-id="${r.idRutina}" style="padding: 4px 8px; font-size: 0.8rem;">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tablaListadoRutinas.innerHTML = '<tr><td colspan="5">Error al cargar las rutinas.</td></tr>';
        console.error(error);
    }
}

async function cargarEjercicios() {
    try {
        const ejercicios = await apiRequest('/api/admin/ejercicios', { token: getToken() });
        ejercicios.forEach(ej => {
            opcionesEjercicios += `<option value="${ej.idEjercicio}">${ej.nomEjercicio || ej.nombre}</option>`;
        });
    } catch (error) {
        console.warn("No se pudieron cargar los ejercicios.", error);
    }
}


// --- LÓGICA DEL MODAL "VER" ---

async function verDetalleRutina(id) {
    try {
        const rutina = await apiRequest(`/api/coach/rutina/${id}`, { token: getToken() });
        rutinaDetalleActual = rutina;

        document.getElementById('modalTituloRutina').textContent = rutina.nombreRutina;
        document.getElementById('modalDescRutina').textContent = rutina.descripcion || 'Sin descripción';
        document.getElementById('modalTipoRutina').innerHTML = rutina.esPlantilla ?
            'Tipo: <span style="color: #a3e635;">Plantilla General</span>' :
            'Tipo: <span style="color: #9ca3af;">Personalizada</span>';

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
                <td>${d.nombreMedidaEsfuerzo || '-'}</td>
            </tr>
        `;
    });
}


// --- ELIMINAR RUTINA ---

async function eliminarRutina(id) {
    if(!confirm('¿Estás seguro de eliminar esta rutina? Se perderán sus configuraciones.')) return;
    try {
        await apiRequest(`/api/coach/rutina/${id}`, { method: 'DELETE', token: getToken() });
        mostrarToast('Rutina eliminada con éxito');
        await cargarTablaRutinas();
    } catch (error) {
        alert('No se pudo eliminar la rutina: ' + error.message);
    }
}


// --- TABLA DINÁMICA DE CREACIÓN ---

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
            <button type="button" class="is-danger remove-btn" style="padding: 4px 10px;">X</button>
        </td>
    `;

    tr.querySelector('.remove-btn').addEventListener('click', () => tr.remove());
    tablaDetalles.appendChild(tr);
}


// --- ENVÍO DE FORMULARIO ---

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
            rangoPeso: fila.querySelector('.pes-inp').value
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
        await apiRequest('/api/coach/rutina/crear', {
            method: 'POST',
            body: JSON.stringify(payload),
            token: getToken()
        });

        mostrarToast('Rutina guardada con éxito');
        formRutina.reset();
        tablaDetalles.innerHTML = '';
        agregarFilaEjercicio();
        await cargarTablaRutinas();
    } catch (error) {
        status.textContent = error.message;
    }
});


// --- UTILIDADES ---

function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.hidden = false;
    setTimeout(() => { toast.hidden = true; }, 3500);
}

function decodificarIdCoach(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        return payload.idUsuario || 1;
    } catch (e) {
        return 1;
    }
}