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
let rutinaDetalleActual = null; // Para el modal de ver detalle

document.addEventListener('DOMContentLoaded', async () => {
    renderCoachLayout('rutinas');

    const token = getToken();
    if (!token) {
        window.location.href = '/inicio-sesion.html';
        return;
    }

    await cargarEjercicios();
    await cargarTablaRutinas();

    btnAgregarEjercicio.addEventListener('click', () => agregarFilaEjercicio());
    agregarFilaEjercicio();

    // --- DELEGACIÓN DE EVENTOS PARA LOS BOTONES DE LA TABLA ---
    tablaListadoRutinas.addEventListener('click', async (e) => {
        const btnVer = e.target.closest('.btn-ver');
        const btnModificar = e.target.closest('.btn-modificar');
        const btnEliminar = e.target.closest('.btn-eliminar');

        if (btnVer) {
            await verDetalleRutina(btnVer.dataset.id);
        }

        if (btnModificar) {
            await cargarParaModificar(btnModificar.dataset.id);
        }

        if (btnEliminar) {
            await eliminarRutina(btnEliminar.dataset.id);
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
                '<span style="color: var(--lime); font-weight: bold;">Plantilla General</span>' :
                '<span style="color: #666;">Personalizada</span>';

            const estiloBotonBase = "background: transparent; border: 1px solid #d1d5d2; color: #555; padding: 6px 12px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.5px; cursor: pointer; border-radius: 4px; transition: all 0.2s;";
            const estiloVer = estiloBotonBase + " margin-right: 8px;";
            const estiloModificar = estiloBotonBase + " margin-right: 8px; border-color: var(--lime); color: var(--lime);";
            const estiloEliminarHover = "onmouseover=\"this.style.borderColor='#ef7e64'; this.style.color='#ef7e64'\" onmouseout=\"this.style.borderColor='#d1d5d2'; this.style.color='#555'\"";

            tablaListadoRutinas.innerHTML += `
                <tr>
                    <td><strong>${r.nombreRutina}</strong></td>
                    <td>${r.descripcion || '-'}</td>
                    <td>${tipoRutina}</td>
                    <td>${r.fechaCreacion || '-'}</td>
                    <td style="display: flex; gap: 8px;">
                        <button type="button" class="btn-ver" data-id="${r.idRutina}" style="${estiloVer}" onmouseover="this.style.background='#f7f9f9'" onmouseout="this.style.background='transparent'">VER</button>
                        <button type="button" class="btn-modificar" data-id="${r.idRutina}" style="${estiloModificar}" onmouseover="this.style.background='rgb(217 4 41 / 5%'" onmouseout="this.style.background='transparent'">MODIFICAR</button>
                        <button type="button" class="btn-eliminar" data-id="${r.idRutina}" style="${estiloBotonBase}" ${estiloEliminarHover}>ELIMINAR</button>
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
            'Tipo: <span style="color: var(--lime);">Plantilla General</span>' :
            'Tipo: <span style="color: #666;">Personalizada</span>';

        const diasDisponibles = [...new Set(rutina.detalles.map(d => d.diaSemana))];
        const selectDia = document.getElementById('selectDiaFiltro');
        selectDia.innerHTML = '';

        if (diasDisponibles.length === 0) {
            selectDia.innerHTML = '<option value="">Sin días registrados</option>';
            document.getElementById('tablaModalDetalles').innerHTML = '<tr><td colspan="7">No hay ejercicios asignados.</td></tr>';
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
        tbodyModal.innerHTML = `<tr><td colspan="7">No hay ejercicios para el día ${diaSeleccionado}.</td></tr>`;
        return;
    }

    ejerciciosFiltrados.forEach(d => {
        let minutosTexto = '-';
        if (d.tiempoEstimado) {
            const partes = d.tiempoEstimado.split(':');
            minutosTexto = ((parseInt(partes[0]) * 60) + parseInt(partes[1])) + ' min';
        }

        tbodyModal.innerHTML += `
            <tr>
                <td><strong>${d.nombreEjercicio}</strong></td>
                <td>${d.rangoSeries || '-'}</td>
                <td>${d.rangoRep || '-'}</td>
                <td>${d.rangoPeso || '-'}</td>
                <td>${d.medidaEsfuerzo || '-'}</td>
                <td>${d.cantMedida || '-'}</td>
                <td>${minutosTexto}</td>
            </tr>
        `;
    });
}



// --- LÓGICA PARA MODIFICAR RUTINA ---
async function cargarParaModificar(id) {
    try {
        const rutina = await apiRequest(`/api/coach/rutina/${id}`, { token: getToken() });

        document.getElementById('rutinaIdEdit').value = rutina.idRutina;
        document.getElementById('nombreRutina').value = rutina.nombreRutina;
        document.getElementById('descripcionRutina').value = rutina.descripcion || '';
        document.getElementById('esPlantilla').checked = rutina.esPlantilla;

        tablaDetalles.innerHTML = '';
        if (rutina.detalles && rutina.detalles.length > 0) {
            rutina.detalles.forEach(d => {
                const tr = document.createElement('tr');
                const esfuerzo = d.medidaEsfuerzo || "";

                let minutosTotales = '';
                if (d.tiempoEstimado) {
                    const partes = d.tiempoEstimado.split(':');
                    minutosTotales = (parseInt(partes[0]) * 60) + parseInt(partes[1]);
                }

                tr.innerHTML = `
                    <td>
                        <select class="table-input dia-sel" required>
                            <option value="Lunes" ${d.diaSemana === 'Lunes' ? 'selected' : ''}>Lunes</option>
                            <option value="Martes" ${d.diaSemana === 'Martes' ? 'selected' : ''}>Martes</option>
                            <option value="Miércoles" ${d.diaSemana === 'Miércoles' ? 'selected' : ''}>Miércoles</option>
                            <option value="Jueves" ${d.diaSemana === 'Jueves' ? 'selected' : ''}>Jueves</option>
                            <option value="Viernes" ${d.diaSemana === 'Viernes' ? 'selected' : ''}>Viernes</option>
                            <option value="Sábado" ${d.diaSemana === 'Sábado' ? 'selected' : ''}>Sábado</option>
                            <option value="Domingo" ${d.diaSemana === 'Domingo' ? 'selected' : ''}>Domingo</option>
                        </select>
                    </td>
                    <td>
                        <select class="table-input ej-sel" required>
                            ${opcionesEjercicios}
                        </select>
                    </td>
                    <td><input type="number" class="table-input ser-inp" value="${d.rangoSeries || ''}" min="1" max="20" placeholder="Ej: 4" required /></td>
                    <td><input type="text" class="table-input rep-inp" value="${d.rangoRep || ''}" placeholder="Ej: 8-12" required /></td>
                    <td><input type="number" class="table-input pes-inp" value="${d.rangoPeso || ''}" placeholder="Ej: 20" min="0" step="any" /></td>
                    <td>
                        <select class="table-input esf-sel">
                            <option value="">N/A</option>
                            <option value="RIR" ${esfuerzo === 'RIR' ? 'selected' : ''}>RIR</option>
                            <option value="RPE" ${esfuerzo === 'RPE' ? 'selected' : ''}>RPE</option>
                        </select>
                    </td>
                    <td><input type="number" class="table-input cant-esf-inp" value="${d.cantMedida || ''}" min="0" max="10" placeholder="Ej: 2" /></td>
                    <td><input type="number" class="table-input tiempo-inp" value="${minutosTotales}" min="1" max="180" placeholder="Ej: 15" /></td>
                    <td>
                        <button type="button" class="is-danger remove-btn" style="padding: 4px 10px;">X</button>
                    </td>
                `;

                const selectEj = tr.querySelector('.ej-sel');
                Array.from(selectEj.options).forEach(opt => {
                    if (opt.text === d.nombreEjercicio) opt.selected = true;
                });

                tr.querySelector('.remove-btn').addEventListener('click', () => tr.remove());
                tablaDetalles.appendChild(tr);
            });
        } else {
            agregarFilaEjercicio();
        }

        document.getElementById('btnGuardarRutina').textContent = 'Actualizar Rutina';
        document.getElementById('btnCancelarEdicion').style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        alert('Error al cargar la rutina para modificar.');
        console.error(error);
    }
}

// Evento para cancelar edición
document.getElementById('btnCancelarEdicion')?.addEventListener('click', () => {
    formRutina.reset();
    document.getElementById('rutinaIdEdit').value = '';
    tablaDetalles.innerHTML = '';
    agregarFilaEjercicio();
    document.getElementById('btnGuardarRutina').textContent = 'Guardar Rutina Completa';
    document.getElementById('btnCancelarEdicion').style.display = 'none';
});


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


// --- TABLA DINÁMICA DE CREACIÓN (CON INPUTS RESTRINGIDOS) ---
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
        <!-- Series: Solo número entero positivo -->
        <td><input type="number" class="table-input ser-inp" placeholder="Ej: 8-12" min="1" max="20" required /></td>
        <!-- Reps: Texto libre controlado pero estructurado (ej: 8-12) -->
        <td><input type="text" class="table-input rep-inp" placeholder="Ej: 8-12 o 10" required /></td>
        <!-- Peso -->
        <td><input type="number" class="table-input pes-inp" placeholder="Ej: 20kg o RIR" /></td>
        <td>
            <select class="table-input esf-sel">
                <option value="">N/A</option>
                <option value="RIR">RIR</option>
                <option value="RPE">RPE</option>
            </select>
        </td>
        <!-- Cantidad de Esfuerzo: Número entero -->
        <td><input type="number" class="table-input cant-esf-inp" placeholder="Ej: 2" min="0" max="10" /></td>
        <!-- Tiempo en minutos: Número entero -->
        <td><input type="number" class="table-input tiempo-inp" placeholder="Ej: 15" min="1" max="180" /></td>
        <td>
            <button type="button" class="is-danger remove-btn" style="padding: 4px 10px;">X</button>
        </td>
    `;

    tr.querySelector('.remove-btn').addEventListener('click', () => tr.remove());
    tablaDetalles.appendChild(tr);
}

// --- ENVÍO DE FORMULARIO CON VALIDACIONES ESTRICTAS DE REPETICIONES ---
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

    // Expresión regular para validar el formato exacto: número-número (ej. 8-12, 10-10)
    const regexReps = /^\d+-\d+$/;

    // Validación rigurosa por fila
    for (let i = 0; i < filas.length; i++) {
        const fila = filas[i];
        const series = fila.querySelector('.ser-inp').value.trim();
        const reps = fila.querySelector('.rep-inp').value.trim();
        const ejercicio = fila.querySelector('.ej-sel').value;

        if (!ejercicio) {
            status.textContent = `Fila ${i + 1}: Debe seleccionar un ejercicio válido.`;
            return;
        }

        if (!series || parseInt(series) <= 0) {
            status.textContent = `Fila ${i + 1}: El número de series debe ser mayor a 0.`;
            return;
        }

        if (!reps) {
            status.textContent = `Fila ${i + 1}: El campo de repeticiones no puede estar vacío.`;
            return;
        }

        // Validar el formato estricto xx-xx (solo números y un guion)
        if (!regexReps.test(reps)) {
            status.textContent = `Fila ${i + 1}: El formato de repeticiones debe ser estricto "xx-xx" (ej. 8-12 o 10-10).`;
            fila.querySelector('.rep-inp').focus();
            return;
        }
    }

    filas.forEach(fila => {
        const valorEsfuerzo = fila.querySelector('.esf-sel').value;
        const cantEsfuerzo = fila.querySelector('.cant-esf-inp').value;
        const tiempoMinutos = fila.querySelector('.tiempo-inp').value;

        let tiempoEstimadoFormat = null;
        if (tiempoMinutos && !isNaN(tiempoMinutos)) {
            const horas = Math.floor(tiempoMinutos / 60).toString().padStart(2, '0');
            const minutos = (tiempoMinutos % 60).toString().padStart(2, '0');
            tiempoEstimadoFormat = `${horas}:${minutos}:00`;
        }

        detalles.push({
            idEjercicio: parseInt(fila.querySelector('.ej-sel').value),
            diaSemana: fila.querySelector('.dia-sel').value,
            rangoSeries: fila.querySelector('.ser-inp').value.trim(),
            rangoRep: fila.querySelector('.rep-inp').value.trim(),
            rangoPeso: fila.querySelector('.pes-inp').value.trim() ? parseFloat(fila.querySelector('.pes-inp').value.trim()) : null, // Convertimos a número o null
            medidaEsfuerzo: valorEsfuerzo ? valorEsfuerzo : null,
            cantMedida: cantEsfuerzo ? parseInt(cantEsfuerzo) : null,
            tiempoEstimado: tiempoEstimadoFormat
        });
    });

    const payload = {
        nombreRutina: document.getElementById('nombreRutina').value.trim(),
        descripcion: document.getElementById('descripcionRutina').value.trim(),
        esPlantilla: document.getElementById('esPlantilla').checked,
        detalles: detalles
    };

    const idEdit = document.getElementById('rutinaIdEdit').value;
    const isUpdate = idEdit !== '';
    const url = isUpdate ? `/api/coach/rutina/actualizar/${idEdit}` : '/api/coach/rutina/crear';
    const method = isUpdate ? 'PUT' : 'POST';

    try {
        await apiRequest(url, {
            method: method,
            body: JSON.stringify(payload),
            token: getToken()
        });

        mostrarToast(isUpdate ? 'Rutina actualizada con éxito' : 'Rutina guardada con éxito');

        if (isUpdate) {
            document.getElementById('btnCancelarEdicion').click();
        } else {
            formRutina.reset();
            tablaDetalles.innerHTML = '';
            agregarFilaEjercicio();
        }

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