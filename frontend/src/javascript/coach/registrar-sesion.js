import { apiRequest, getToken } from '../api.js';
import { renderCoachLayout } from '../layout-coach.js';

const selectAsignacion = document.getElementById('selectAsignacion');
const selectDia = document.getElementById('selectDia');
const btnCargarRutina = document.getElementById('btnCargarRutina');
const contenedorEjercicios = document.getElementById('contenedorEjercicios');
const formSesion = document.getElementById('formSesion');
const toast = document.getElementById('toast');

// Guardaremos la asignación y la rutina actual en memoria
let asignacionesCache = [];
let rutinaPlanificadaActual = null;

document.addEventListener('DOMContentLoaded', async () => {
    renderCoachLayout('registrar-sesion');
    if (!getToken()) { window.location.href = '/inicio-sesion.html'; return; }

    // Setear fecha actual por defecto
    document.getElementById('fechaSesion').value = new Date().toISOString().split('T')[0];

    await cargarAsignaciones();

    selectAsignacion.addEventListener('change', generarVistaEjercicios);
    selectDia.addEventListener('change', generarVistaEjercicios);

    /*btnCargarRutina.addEventListener('click', generarVistaEjercicios);*/
});

// 1. Obtener los clientes asignados al coach
async function cargarAsignaciones() {
    try {
        // Usamos el endpoint que ya tenías para listar asignaciones
        const asignaciones = await apiRequest('/api/coach/rutina/asignaciones', { token: getToken() });
        asignacionesCache = asignaciones;

        selectAsignacion.innerHTML = '<option value="">Seleccione asignación...</option>';

        asignaciones.forEach(a => {
            selectAsignacion.innerHTML += `<option value="${a.idCliCou}" data-rutina="${a.idRutina}">
                ${a.clienteNombre} (DNI: ${a.clienteDni}) — Plan: ${a.rutinaNombre}
            </option>`;
        });
    } catch (error) {
        console.error("Error al cargar asignaciones", error);
    }
}

// 2. Al dar clic en "Cargar", traemos la rutina y armamos los inputs
async function generarVistaEjercicios() {
    const idAsignacion = selectAsignacion.value;
    const dia = selectDia.value;

    if (!idAsignacion || !dia) {
        /*alert("Selecciona un cliente y un día.");*/
        formSesion.style.display = 'none';
        contenedorEjercicios.innerHTML = '';
        return;
    }

    // Buscar qué ID de rutina tiene esta asignación
    const opcionSeleccionada = selectAsignacion.options[selectAsignacion.selectedIndex];
    const idRutina = opcionSeleccionada.dataset.rutina;

    try {
        // Usamos el endpoint de detalle de rutina que ya existe
        const rutina = await apiRequest(`/api/coach/rutina/${idRutina}`, { token: getToken() });
        rutinaPlanificadaActual = rutina;

        // Filtrar solo los ejercicios de ese día
        const ejerciciosDelDia = rutina.detalles.filter(d => d.diaSemana === dia);

        if (ejerciciosDelDia.length === 0) {
            contenedorEjercicios.innerHTML = `<p style="color: #ef4444;">No hay ejercicios planificados para el día ${dia}.</p>`;
            formSesion.style.display = 'block';
            document.querySelector('#formSesion button[type="submit"]').style.display = 'none';
            return;
        }

        renderizarTarjetas(ejerciciosDelDia);

    } catch (error) {
        alert("Error al obtener la rutina planificada.");
        console.error(error);
    }
}

// 3. Crear las tablas dinámicas de registro
function renderizarTarjetas(ejercicios) {
    contenedorEjercicios.innerHTML = '';
    formSesion.style.display = 'block';
    document.querySelector('#formSesion button[type="submit"]').style.display = 'block';

    ejercicios.forEach((ej, index) => {
        // Intentar deducir cuántas series planificó (si puso "4" o "3-4", extraemos el primer número para dibujar filas vacías)
        let seriesSugeridas = 1;
        const match = ej.rangoSeries ? ej.rangoSeries.match(/\d+/) : null;
        if (match) seriesSugeridas = parseInt(match[0]);

        const card = document.createElement('div');
        card.className = 'ejercicio-card';
        card.innerHTML = `
            <div class="ejercicio-titulo">
                <h3 style="margin:0;">${ej.nombreEjercicio}</h3>
                <button type="button" class="admin-secondary-action btn-add-serie" data-index="${index}">+ Agregar Serie</button>
            </div>
            <div class="info-planificada">
                <strong>Planificado:</strong> ${ej.rangoSeries || '-'} Series | ${ej.rangoRep || '-'} Reps | Peso: ${ej.rangoPeso || '-'} | Esfuerzo: ${ej.medidaEsfuerzo || '-'}: ${ej.cantMedida || '-'}
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
                    <tbody id="tbody-ej-${index}">
                    </tbody>
                </table>
            </div>
        `;
        contenedorEjercicios.appendChild(card);

        const tbody = document.getElementById(`tbody-ej-${index}`);

        // Función para agregar una fila
        const agregarFila = (nroSerie) => {
            const tr = document.createElement('tr');
            tr.dataset.idejercicio = ej.idEjercicio; // Guardamos el ID real del ejercicio en la fila
            tr.innerHTML = `
                <td style="text-align:center;"><strong>${nroSerie}</strong></td>
                <td><input type="number" class="table-input rep-val" placeholder="Ej: 12" required /></td>
                <td><input type="number" step="0.5" class="table-input pes-val" placeholder="Ej: 20" /></td>
                <td>
                    <select class="table-input esf-tipo">
                        <option value="">N/A</option>
                        <option value="RIR" ${ej.medidaEsfuerzo === 'RIR' ? 'selected' : ''}>RIR</option>
                        <option value="RPE" ${ej.medidaEsfuerzo === 'RPE' ? 'selected' : ''}>RPE</option>
                    </select>
                </td>
                <td><input type="number" class="table-input esf-cant" placeholder="Ej: 2" /></td>
                <td><input type="number" class="table-input tiem-val" placeholder="Ej: 45" /></td>
                <td><button type="button" class="is-danger remove-serie">X</button></td>
            `;
            // Eliminar fila y recalcular números de serie
            tr.querySelector('.remove-serie').addEventListener('click', () => {
                tr.remove();
                actualizarNumerosSerie(tbody);
            });
            tbody.appendChild(tr);
        };

        // Generar filas sugeridas
        for (let i = 1; i <= seriesSugeridas; i++) {
            agregarFila(i);
        }

        // Botón "Agregar Serie" extra
        card.querySelector('.btn-add-serie').addEventListener('click', () => {
            const numActuales = tbody.querySelectorAll('tr').length;
            agregarFila(numActuales + 1);
        });
    });
}

// Función auxiliar para que si borras la Serie 2, la Serie 3 pase a ser la 2.
function actualizarNumerosSerie(tbody) {
    const filas = tbody.querySelectorAll('tr');
    filas.forEach((fila, i) => {
        fila.querySelector('td strong').textContent = i + 1;
    });
}

// 4. Guardar Sesión (Enviar el POST)
formSesion.addEventListener('submit', async (e) => {
    e.preventDefault();
    const idAsignacion = selectAsignacion.value;
    const fecha = document.getElementById('fechaSesion').value;
    const opcionSeleccionada = selectAsignacion.options[selectAsignacion.selectedIndex];
    const idRutina = opcionSeleccionada.dataset.rutina;

    const seriesData = [];
    const filasTotales = document.querySelectorAll('tbody tr');

    filasTotales.forEach(fila => {
        const idEj = fila.dataset.idejercicio;
        const nroSerie = parseInt(fila.querySelector('td strong').textContent);
        const reps = fila.querySelector('.rep-val').value;
        const peso = fila.querySelector('.pes-val').value;
        const esfTipo = fila.querySelector('.esf-tipo').value;
        const esfCant = fila.querySelector('.esf-cant').value;
        const tiem = fila.querySelector('.tiem-val').value;

        // Solo guardamos si anotó al menos repeticiones o peso o tiempo (no guardamos filas vacías)
        if (reps || peso || tiem) {
            seriesData.push({
                idEjercicio: parseInt(idEj),
                nroSerie: nroSerie,
                nroRepeticiones: reps ? parseInt(reps) : null,
                nroPeso: peso ? parseFloat(peso) : null,
                medidaEsfuerzo: esfTipo ? esfTipo : null,
                cantMedida: esfCant ? parseInt(esfCant) : null,
                tiempoSegundos: tiem ? parseInt(tiem) : null
            });
        }
    });

    if (seriesData.length === 0) {
        document.getElementById('formStatus').textContent = "Debes registrar datos en al menos una serie.";
        return;
    }

    const payload = {
        idCliCou: parseInt(idAsignacion),
        idRutina: parseInt(idRutina),
        fechaRegistro: fecha,
        series: seriesData
    };

    try {
        await apiRequest('/api/coach/historial/registrar', {
            method: 'POST',
            body: JSON.stringify(payload),
            token: getToken()
        });

        mostrarToast('¡Sesión registrada correctamente!');
        contenedorEjercicios.innerHTML = '';
        formSesion.style.display = 'none';

    } catch (error) {
        document.getElementById('formStatus').textContent = error.message;
    }
});

function mostrarToast(m) { toast.textContent = m; toast.hidden = false; setTimeout(() => toast.hidden = true, 3500); }