import { apiRequest, getToken } from '../api.js';
import { renderCoachLayout } from '../layout-coach.js';

const selectAsignacion = document.getElementById('selectAsignacionHistorial');
const tablaSesiones = document.getElementById('tablaSesiones');
const formEditarSesion = document.getElementById('formEditarSesion');
const contenedorEjercicios = document.getElementById('contenedorEjerciciosHistorial');
const toast = document.getElementById('toast');

document.addEventListener('DOMContentLoaded', async () => {
    renderCoachLayout('historial-cliente');
    if (!getToken()) { window.location.href = '/inicio-sesion.html'; return; }

    await cargarAsignaciones();
    selectAsignacion.addEventListener('change', cargarHistorialCliente);

    document.getElementById('btnCancelarEdicion').addEventListener('click', () => {
        formEditarSesion.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

async function cargarAsignaciones() {
    try {
        const asignaciones = await apiRequest('/api/coach/rutina/asignaciones', { token: getToken() });
        selectAsignacion.innerHTML = '<option value="">Seleccione asignación...</option>';
        asignaciones.forEach(a => {
            selectAsignacion.innerHTML += `<option value="${a.idCliCou}">
                ${a.clienteNombre} (DNI: ${a.clienteDni}) — Plan: ${a.rutinaNombre}
            </option>`;
        });
    } catch (error) {
        console.error("Error al cargar asignaciones", error);
    }
}

// 1. Mostrar la tabla de fechas
async function cargarHistorialCliente() {
    const idAsignacion = selectAsignacion.value;
    formEditarSesion.style.display = 'none'; // Ocultar form si cambia de cliente

    if (!idAsignacion) {
        tablaSesiones.innerHTML = '<tr><td colspan="3">Seleccione un cliente para ver su historial.</td></tr>';
        return;
    }

    try {
        const resumen = await apiRequest(`/api/coach/historial/asignacion/${idAsignacion}`, { token: getToken() });
        tablaSesiones.innerHTML = '';

        if (resumen.length === 0) {
            tablaSesiones.innerHTML = '<tr><td colspan="3">Este cliente aún no tiene sesiones registradas.</td></tr>';
            return;
        }

        const estiloBoton = "background: transparent; border: 1px solid #a3e635; color: #a3e635; padding: 6px 12px; font-size: 0.75rem; font-weight: 600; cursor: pointer; border-radius: 4px; transition: all 0.2s;";

        resumen.forEach(r => {
            tablaSesiones.innerHTML += `
                <tr>
                    <td><strong>${r.fechaRegistro}</strong></td>
                    <td>${r.rutinaNombre}</td>
                    <td>
                        <button type="button" class="btn-modificar-sesion" data-id="${r.idHistRut}" style="${estiloBoton}" onmouseover="this.style.background='#1a2e05'" onmouseout="this.style.background='transparent'">VER / EDITAR</button>
                    </td>
                </tr>
            `;
        });

        // Eventos a los botones "VER / EDITAR"
        document.querySelectorAll('.btn-modificar-sesion').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                await abrirEdicionSesion(e.target.dataset.id);
            });
        });

    } catch (error) {
        tablaSesiones.innerHTML = '<tr><td colspan="3">Error al cargar el historial.</td></tr>';
    }
}

// 2. Traer el detalle de una sesión y armar los inputs
async function abrirEdicionSesion(idHistRut) {
    try {
        const detalle = await apiRequest(`/api/coach/historial/sesion/${idHistRut}`, { token: getToken() });

        document.getElementById('idHistRutEditar').value = detalle.idHistRut;
        document.getElementById('fechaSesionOculta').value = detalle.fechaRegistro;
        document.getElementById('fechaEdicionDisplay').textContent = detalle.fechaRegistro;

        contenedorEjercicios.innerHTML = '';

        // Agrupar las series por Ejercicio
        const seriesPorEjercicio = {};
        detalle.series.forEach(serie => {
            if(!seriesPorEjercicio[serie.idEjercicio]) {
                seriesPorEjercicio[serie.idEjercicio] = {
                    nombre: serie.nombreEjercicio,
                    series: []
                };
            }
            seriesPorEjercicio[serie.idEjercicio].series.push(serie);
        });

        // Dibujar las tarjetas por cada ejercicio
        Object.entries(seriesPorEjercicio).forEach(([idEjercicio, datosEj], index) => {
            const card = document.createElement('div');
            card.className = 'ejercicio-card';
            card.innerHTML = `
                <div class="ejercicio-titulo">
                    <h3 style="margin:0;">${datosEj.nombre}</h3>
                    <button type="button" class="admin-secondary-action btn-add-serie" data-index="${index}">+ Agregar Serie</button>
                </div>
                <div class="admin-table-wrap">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th style="width: 80px;">Serie</th>
                                <th>Reps Realizadas</th>
                                <th>Peso Real (kg)</th>
                                <th>Esfuerzo (RIR/RPE)</th>
                                <th>Cant. Esfuerzo</th>
                                <th>Tiempo (seg)</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-edit-${index}"></tbody>
                    </table>
                </div>
            `;
            contenedorEjercicios.appendChild(card);

            const tbody = document.getElementById(`tbody-edit-${index}`);

            const agregarFila = (nroSerie, s = {}) => {
                const tr = document.createElement('tr');
                tr.dataset.idejercicio = idEjercicio;
                tr.innerHTML = `
                    <td style="text-align:center;"><strong>${nroSerie}</strong></td>
                    <td><input type="number" class="table-input rep-val" value="${s.nroRepeticiones || ''}" required /></td>
                    <td><input type="number" step="0.5" class="table-input pes-val" value="${s.nroPeso || ''}" /></td>
                    <td>
                        <select class="table-input esf-tipo">
                            <option value="">N/A</option>
                            <option value="RIR" ${s.medidaEsfuerzo === 'RIR' ? 'selected' : ''}>RIR</option>
                            <option value="RPE" ${s.medidaEsfuerzo === 'RPE' ? 'selected' : ''}>RPE</option>
                        </select>
                    </td>
                    <td><input type="number" class="table-input esf-cant" value="${s.cantMedida || ''}" /></td>
                    <td><input type="number" class="table-input tiem-val" value="${s.tiempoSegundos || ''}" /></td>
                    <td><button type="button" class="is-danger remove-serie">X</button></td>
                `;
                tr.querySelector('.remove-serie').addEventListener('click', () => {
                    tr.remove();
                    actualizarNumerosSerie(tbody);
                });
                tbody.appendChild(tr);
            };

            // Dibujar las series existentes
            datosEj.series.forEach((s, idx) => agregarFila(idx + 1, s));

            // Botón para agregar una nueva serie extra
            card.querySelector('.btn-add-serie').addEventListener('click', () => {
                const numActuales = tbody.querySelectorAll('tr').length;
                agregarFila(numActuales + 1);
            });
        });

        formEditarSesion.style.display = 'block';
        // Scroll hasta el formulario
        formEditarSesion.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        alert("Error al cargar la sesión para modificar.");
        console.error(error);
    }
}

function actualizarNumerosSerie(tbody) {
    const filas = tbody.querySelectorAll('tr');
    filas.forEach((fila, i) => { fila.querySelector('td strong').textContent = i + 1; });
}

// 3. Enviar el PUT al backend
formEditarSesion.addEventListener('submit', async (e) => {
    e.preventDefault();
    const idHistRut = document.getElementById('idHistRutEditar').value;
    const fechaRegistro = document.getElementById('fechaSesionOculta').value;

    const seriesData = [];
    document.querySelectorAll('#contenedorEjerciciosHistorial tbody tr').forEach(fila => {
        const reps = fila.querySelector('.rep-val').value;
        const peso = fila.querySelector('.pes-val').value;
        const tiem = fila.querySelector('.tiem-val').value;

        if (reps || peso || tiem) {
            seriesData.push({
                idEjercicio: parseInt(fila.dataset.idejercicio),
                nroSerie: parseInt(fila.querySelector('td strong').textContent),
                nroRepeticiones: reps ? parseInt(reps) : null,
                nroPeso: peso ? parseFloat(peso) : null,
                medidaEsfuerzo: fila.querySelector('.esf-tipo').value || null,
                cantMedida: fila.querySelector('.esf-cant').value ? parseInt(fila.querySelector('.esf-cant').value) : null,
                tiempoSegundos: tiem ? parseInt(tiem) : null
            });
        }
    });

    if (seriesData.length === 0) {
        document.getElementById('formStatusHistorial').textContent = "Debes dejar al menos una serie registrada.";
        return;
    }

    try {
        await apiRequest(`/api/coach/historial/actualizar/${idHistRut}`, {
            method: 'PUT',
            body: JSON.stringify({
                fechaRegistro: fechaRegistro,
                series: seriesData
            }),
            token: getToken()
        });

        mostrarToast('Sesión actualizada correctamente');
        formEditarSesion.style.display = 'none';

    } catch (error) {
        document.getElementById('formStatusHistorial').textContent = error.message;
    }
});

function mostrarToast(m) { toast.textContent = m; toast.hidden = false; setTimeout(() => toast.hidden = true, 3500); }