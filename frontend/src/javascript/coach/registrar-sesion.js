import {apiRequest, getToken, verificarAccesoRuta} from '../api.js';
import { renderCoachLayout } from '../layout-coach.js';

// Elementos principales
const inputClienteSeleccionado = document.getElementById('inputClienteSeleccionado');
const btnAbrirModalClientes = document.getElementById('btnAbrirModalClientes');
const selectRutinaCliente = document.getElementById('selectRutinaCliente');
const selectDia = document.getElementById('selectDia');
const fechaSesion = document.getElementById('fechaSesion');
const contenedorEjercicios = document.getElementById('contenedorEjercicios');
const formSesion = document.getElementById('formSesion');
const toast = document.getElementById('toast');

// Elementos del Modal
const modalClientes = document.getElementById('modalClientes');
const btnCerrarModalClientes = document.getElementById('btnCerrarModalClientes');
const inputBuscarCliente = document.getElementById('inputBuscarCliente');
const tbodyClientesModal = document.getElementById('tbodyClientesModal');

// Caché en memoria
let clientesAgrupados = [];
let rutinaPlanificadaActual = null;
const cacheHistorialAsignacion = new Map();

document.addEventListener('DOMContentLoaded', async () => {
    const tieneAcceso = await verificarAccesoRuta("/api/coach/validar", "/");
    if (!tieneAcceso) return;
    renderCoachLayout('registrar-sesion');
    if (!getToken()) { window.location.href = '/login'; return; }

    // Setear fecha local actual por defecto
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
    fechaSesion.value = localISOTime;

    autoseleccionarDiaActual();
    await cargarAsignaciones();

    // Eventos del Modal
    btnAbrirModalClientes.addEventListener('click', abrirModalClientes);
    inputClienteSeleccionado.addEventListener('click', abrirModalClientes);
    btnCerrarModalClientes.addEventListener('click', cerrarModalClientes);

    modalClientes.addEventListener('click', (e) => {
        if (e.target === modalClientes) cerrarModalClientes();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalClientes.classList.contains('active')) {
            cerrarModalClientes();
        }
    });

    inputBuscarCliente.addEventListener('input', (e) => {
        filtrarClientesModal(e.target.value);
    });

    // Eventos de selección de rutina, día y fecha
    selectRutinaCliente.addEventListener('change', alSeleccionarRutina);
    selectDia.addEventListener('change', generarVistaEjercicios);
    fechaSesion.addEventListener('change', generarVistaEjercicios);
});

function autoseleccionarDiaActual() {
    if (!selectDia) return;

    const diasSemana = [
        "Domingo",   // 0
        "Lunes",     // 1
        "Martes",    // 2
        "Miércoles", // 3
        "Jueves",    // 4
        "Viernes",   // 5
        "Sábado"     // 6
    ];

    const numeroDiaHoy = new Date().getDay();
    selectDia.value = diasSemana[numeroDiaHoy];
}

// 1. Obtener asignaciones del coach y agruparlas por cliente (DNI)
async function cargarAsignaciones() {
    try {
        const asignaciones = await apiRequest('/api/coach/rutina/asignaciones', { token: getToken() });

        const mapaClientes = new Map();

        asignaciones.forEach(a => {
            const clave = a.clienteDni ?? a.clienteNombre;
            if (!mapaClientes.has(clave)) {
                mapaClientes.set(clave, {
                    nombre: a.clienteNombre,
                    dni: a.clienteDni,
                    asignaciones: []
                });
            }
            mapaClientes.get(clave).asignaciones.push({
                idCliCou: a.idCliCou,
                idRutina: a.idRutina,
                rutinaNombre: a.rutinaNombre,
                fechaPlan: a.fechaPlan,
                duracionPlan: a.duracionPlan
            });
        });

        clientesAgrupados = Array.from(mapaClientes.values());
        renderizarTablaClientesModal(clientesAgrupados);
    } catch (error) {
        console.error("Error al cargar asignaciones", error);
        tbodyClientesModal.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #ef4444;">Error al cargar clientes asignados.</td></tr>`;
    }
}

// --- LÓGICA DEL MODAL DE CLIENTES ---
//Permite seleccionar un cliente mediante filtros
function abrirModalClientes() {
    inputBuscarCliente.value = '';
    renderizarTablaClientesModal(clientesAgrupados);
    modalClientes.classList.add('active');
    setTimeout(() => inputBuscarCliente.focus(), 50);
}

function cerrarModalClientes() {
    modalClientes.classList.remove('active');
}

function normalizarTexto(texto) {
    return String(texto || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

function filtrarClientesModal(termino) {
    const query = normalizarTexto(termino);

    if (!query) {
        renderizarTablaClientesModal(clientesAgrupados);
        return;
    }

    const filtrados = clientesAgrupados.filter(cliente => {
        const nombreNorm = normalizarTexto(cliente.nombre);
        const dniStr = String(cliente.dni || '');
        return nombreNorm.includes(query) || dniStr.includes(query);
    });

    renderizarTablaClientesModal(filtrados);
}

function renderizarTablaClientesModal(listaClientes) {
    tbodyClientesModal.innerHTML = '';

    if (!listaClientes || listaClientes.length === 0) {
        tbodyClientesModal.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #666;">No se encontraron clientes con ese criterio.</td></tr>`;
        return;
    }

    listaClientes.forEach(cliente => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${cliente.nombre}</strong></td>
            <td>${cliente.dni ?? '-'}</td>
            <td style="text-align: center;">
                <button type="button" class="admin-primary-action btn-elegir-cliente" style="min-height: 32px; padding: 0 14px; font-size: 0.75rem;">
                    Seleccionar
                </button>
            </td>
        `;

        tr.querySelector('.btn-elegir-cliente').addEventListener('click', () => {
            seleccionarCliente(cliente);
        });

        tbodyClientesModal.appendChild(tr);
    });
}

function seleccionarCliente(cliente) {
    inputClienteSeleccionado.value = `${cliente.nombre} (DNI: ${cliente.dni ?? 'N/A'})`;

    // Poblar selector de rutinas del cliente
    selectRutinaCliente.innerHTML = '<option value="">Seleccione una rutina...</option>';
    cliente.asignaciones.forEach(asig => {
        const opt = document.createElement('option');
        opt.value = asig.idCliCou;
        opt.dataset.rutina = asig.idRutina;
        opt.textContent = asig.rutinaNombre;
        selectRutinaCliente.appendChild(opt);
    });

    selectRutinaCliente.disabled = false;

    // Mantener fecha y día deshabilitados hasta que elija una rutina
    selectDia.disabled = true;
    fechaSesion.disabled = true;
    formSesion.style.display = 'none';
    contenedorEjercicios.innerHTML = '';

    cerrarModalClientes();
}

function alSeleccionarRutina() {
    const idAsignacion = selectRutinaCliente.value;

    if (!idAsignacion) {
        selectDia.disabled = true;
        fechaSesion.disabled = true;
        formSesion.style.display = 'none';
        contenedorEjercicios.innerHTML = '';
        return;
    }

    // Habilitar día de la semana y fecha al elegir la rutina
    selectDia.disabled = false;
    fechaSesion.disabled = false;

    generarVistaEjercicios();
}

// Verificar si la sesión ya fue registrada en esa fecha
async function verificarSesionRegistrada(idAsignacion, fecha, ejerciciosDelDia) {
    if (!fecha) return false;

    try {
        let historial = cacheHistorialAsignacion.get(String(idAsignacion));

        if (!historial) {
            historial = await apiRequest(`/api/coach/historial/asignacion/${idAsignacion}`, { token: getToken() });
            cacheHistorialAsignacion.set(String(idAsignacion), Array.isArray(historial) ? historial : []);
        }

        const sesionesEnFecha = historial.filter(s => s.fechaRegistro === fecha);
        if (sesionesEnFecha.length === 0) return false;

        // Si el endpoint incluye el detalle de ejercicios/series, comprobamos si coincide con el día elegido;
        // si solo devuelve la cabecera de la sesión por fecha, se considera ya registrada.
        return sesionesEnFecha.some(sesion => {
            const detallesSesion = sesion.ejercicios || sesion.detalles || sesion.series;
            if (!Array.isArray(detallesSesion) || detallesSesion.length === 0) {
                return true;
            }
            const idsRegistrados = new Set(detallesSesion.map(d => Number(d.idEjercicio)));
            return ejerciciosDelDia.some(ej => idsRegistrados.has(Number(ej.idEjercicio)));
        });
    } catch (error) {
        console.warn("No se pudo verificar el historial previo de la sesión:", error);
        return false;
    }
}

function formatearFechaLocal(fechaISO) {
    if (!fechaISO) return '';
    const [anio, mes, dia] = fechaISO.split('-');
    return `${dia}/${mes}/${anio}`;
}

// 2. Traer la rutina, validar si ya está completada y armar los inputs
async function generarVistaEjercicios() {
    const idAsignacion = selectRutinaCliente.value;
    const dia = selectDia.value;
    const fecha = fechaSesion.value;
    const btnSubmit = document.querySelector('#formSesion button[type="submit"]');

    if (!idAsignacion || !dia || !fecha) {
        formSesion.style.display = 'none';
        contenedorEjercicios.innerHTML = '';
        return;
    }

    const opcionSeleccionada = selectRutinaCliente.options[selectRutinaCliente.selectedIndex];
    const idRutina = opcionSeleccionada.dataset.rutina;

    try {
        const rutina = await apiRequest(`/api/coach/rutina/${idRutina}`, { token: getToken() });
        rutinaPlanificadaActual = rutina;

        const ejerciciosDelDia = rutina.detalles.filter(d => d.diaSemana === dia);

        if (ejerciciosDelDia.length === 0) {
            contenedorEjercicios.innerHTML = `<p style="color: #ef4444; font-weight: 600;">No hay ejercicios planificados para el día ${dia} en esta rutina.</p>`;
            formSesion.style.display = 'block';
            btnSubmit.style.display = 'none';
            return;
        }

        const yaRegistrada = await verificarSesionRegistrada(idAsignacion, fecha, ejerciciosDelDia);

        if (yaRegistrada) {
            contenedorEjercicios.innerHTML = `
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid var(--lime); border-radius: 8px; padding: 20px 24px; color: #7f1d1d;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                        <span style="background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase;">
                            Sesión Completada
                        </span>
                        
                    </div>
                    <strong style="font-size: 1.05rem; color: #333;">Registro existente el ${formatearFechaLocal(fecha)}</strong>
                    
                    <p style="margin: 0; color: #555; font-size: 0.95rem;">
                        Esta sesión de entrenamiento ya fue registrada para la fecha seleccionada. Por favor, selecciona <strong>otra rutina</strong>, <strong>otro día</strong> de la misma o cambia la fecha para realizar un nuevo registro.
                    </p>
                </div>
            `;
            formSesion.style.display = 'block';
            btnSubmit.style.display = 'none';
            document.getElementById('formStatus').textContent = '';
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
    document.getElementById('formStatus').textContent = '';

    ejercicios.forEach((ej, index) => {
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

        const agregarFila = (nroSerie) => {
            const tr = document.createElement('tr');
            tr.dataset.idejercicio = ej.idEjercicio;
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
            tr.querySelector('.remove-serie').addEventListener('click', () => {
                tr.remove();
                actualizarNumerosSerie(tbody);
            });
            tbody.appendChild(tr);
        };

        for (let i = 1; i <= seriesSugeridas; i++) {
            agregarFila(i);
        }

        card.querySelector('.btn-add-serie').addEventListener('click', () => {
            const numActuales = tbody.querySelectorAll('tr').length;
            agregarFila(numActuales + 1);
        });
    });
}

function actualizarNumerosSerie(tbody) {
    const filas = tbody.querySelectorAll('tr');
    filas.forEach((fila, i) => {
        fila.querySelector('td strong').textContent = i + 1;
    });
}

// 4. Guardar Sesión (Enviar el POST)
formSesion.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formStatus = document.getElementById('formStatus');
    formStatus.textContent = '';

    const idAsignacion = selectRutinaCliente.value;
    const fecha = fechaSesion.value;
    const opcionSeleccionada = selectRutinaCliente.options[selectRutinaCliente.selectedIndex];
    const idRutina = opcionSeleccionada?.dataset?.rutina;

    if (!idAsignacion || !idRutina) {
        formStatus.textContent = "Debes seleccionar un cliente y una rutina válida.";
        return;
    }

    const seriesData = [];
    const filasTotales = document.querySelectorAll('#contenedorEjercicios tbody tr[data-idejercicio]');

    filasTotales.forEach(fila => {
        const idEj = fila.dataset.idejercicio;
        const nroSerie = parseInt(fila.querySelector('td strong').textContent);
        const reps = fila.querySelector('.rep-val')?.value;
        const peso = fila.querySelector('.pes-val')?.value;
        const esfTipo = fila.querySelector('.esf-tipo')?.value;
        const esfCant = fila.querySelector('.esf-cant')?.value;
        const tiem = fila.querySelector('.tiem-val')?.value;

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
        formStatus.textContent = "Debes registrar datos en al menos una serie.";
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

        // Invalidar caché de esa asignación para reflejar el nuevo registro al instante
        cacheHistorialAsignacion.delete(String(idAsignacion));

        mostrarToast('¡Sesión registrada correctamente!');
        contenedorEjercicios.innerHTML = '';
        formSesion.style.display = 'none';

    } catch (error) {
        formStatus.textContent = error.message;
    }
});

function mostrarToast(m) {
    toast.textContent = m;
    toast.hidden = false;
    setTimeout(() => toast.hidden = true, 3500);
}