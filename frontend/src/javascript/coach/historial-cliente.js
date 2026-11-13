import {apiRequest, getToken, verificarAccesoRuta} from '../api.js';
import { renderCoachLayout } from '../layout-coach.js';

// Elementos principales
const inputClienteSeleccionado = document.getElementById('inputClienteSeleccionado');
const btnAbrirModalClientes = document.getElementById('btnAbrirModalClientes');
const selectAsignacion = document.getElementById('selectAsignacionHistorial');
const checkMostrarInactivas = document.getElementById('checkMostrarInactivas');
const fechaDesde = document.getElementById('fechaDesde');
const fechaHasta = document.getElementById('fechaHasta');
const btnLimpiarFechas = document.getElementById('btnLimpiarFechas');
const tablaSesiones = document.getElementById('tablaSesiones');
const formEditarSesion = document.getElementById('formEditarSesion');
const contenedorEjercicios = document.getElementById('contenedorEjerciciosHistorial');
const toast = document.getElementById('toast');
const modalConfirmarEliminar = document.getElementById('modalConfirmarEliminarSesion');

// Elementos del Modal de Clientes
const modalClientes = document.getElementById('modalClientes');
const btnCerrarModalClientes = document.getElementById('btnCerrarModalClientes');
const inputBuscarCliente = document.getElementById('inputBuscarCliente');
const tbodyClientesModal = document.getElementById('tbodyClientesModal');

// Caché en memoria
let clientesAgrupados = [];
let clienteActualSeleccionado = null;
let sesionesCache = [];
let idSesionAEliminar = null;

document.addEventListener('DOMContentLoaded', async () => {
    const tieneAcceso = await verificarAccesoRuta("/api/coach/validar", "/");
    if (!tieneAcceso) return;
    renderCoachLayout('historial-cliente');
    if (!getToken()) { window.location.href = '/login'; return; }

    await cargarAsignaciones();

    // Eventos del Modal de Clientes
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

    // Eventos de Rutina, Checkbox de bajas y Rango de fechas
    checkMostrarInactivas.addEventListener('change', () => {
        if (clienteActualSeleccionado) {
            actualizarSelectorRutinasCliente();
        }
    });

    selectAsignacion.addEventListener('change', cargarHistorialCliente);
    fechaDesde.addEventListener('change', renderizarTablaSesionesFiltradas);
    fechaHasta.addEventListener('change', renderizarTablaSesionesFiltradas);

    btnLimpiarFechas.addEventListener('click', () => {
        fechaDesde.value = '';
        fechaHasta.value = '';
        renderizarTablaSesionesFiltradas();
    });

    // Eventos de Edición y Eliminación de Sesión
    document.getElementById('btnCancelarEdicion').addEventListener('click', () => {
        formEditarSesion.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('btnCancelarEliminarSesion').addEventListener('click', () => {
        modalConfirmarEliminar.close();
    });

    document.getElementById('btnProcesarEliminarSesion').addEventListener('click', eliminarSesionBackend);
});

// 1. Obtener todas las asignaciones (activas + dadas de baja) y agruparlas por cliente
async function cargarAsignaciones() {
    try {
        const asignaciones = await apiRequest('/api/coach/rutina/asignaciones?incluirInactivas=true', { token: getToken() });

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
                duracionPlan: a.duracionPlan,
                estado: a.estado !== false
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
    clienteActualSeleccionado = cliente;
    inputClienteSeleccionado.value = `${cliente.nombre} (DNI: ${cliente.dni ?? 'N/A'})`;

    checkMostrarInactivas.disabled = false;
    actualizarSelectorRutinasCliente();
    cerrarModalClientes();
}

function actualizarSelectorRutinasCliente() {
    const incluirBajas = checkMostrarInactivas.checked;
    const asignacionPrevia = selectAsignacion.value;

    const asignacionesFiltradas = clienteActualSeleccionado.asignaciones.filter(a =>
        incluirBajas ? true : a.estado === true
    );

    selectAsignacion.innerHTML = '';
    formEditarSesion.style.display = 'none';

    if (asignacionesFiltradas.length === 0) {
        selectAsignacion.innerHTML = '<option value="">Sin asignaciones activas (marque "Mostrar dadas de baja")</option>';
        selectAsignacion.disabled = true;
        habilitarFiltroFechas(false);
        sesionesCache = [];
        tablaSesiones.innerHTML = '<tr><td colspan="3">No hay rutinas disponibles con el filtro actual.</td></tr>';
        return;
    }

    selectAsignacion.innerHTML = '<option value="">Seleccione una rutina...</option>';
    asignacionesFiltradas.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.idCliCou;
        opt.textContent = a.estado ? a.rutinaNombre : `${a.rutinaNombre} (Dada de baja)`;
        selectAsignacion.appendChild(opt);
    });

    selectAsignacion.disabled = false;

    // Si la rutina que estaba seleccionada sigue visible, mantenerla seleccionada
    if (asignacionPrevia && asignacionesFiltradas.some(a => String(a.idCliCou) === String(asignacionPrevia))) {
        selectAsignacion.value = asignacionPrevia;
    } else {
        sesionesCache = [];
        habilitarFiltroFechas(false);
        tablaSesiones.innerHTML = '<tr><td colspan="3">Seleccione una rutina para ver su historial.</td></tr>';
    }
}

function habilitarFiltroFechas(habilitar) {
    fechaDesde.disabled = !habilitar;
    fechaHasta.disabled = !habilitar;
    btnLimpiarFechas.disabled = !habilitar;
    if (!habilitar) {
        fechaDesde.value = '';
        fechaHasta.value = '';
    }
}

// 2. Consultar sesiones registradas de la asignación seleccionada
async function cargarHistorialCliente() {
    const idAsignacion = selectAsignacion.value;
    formEditarSesion.style.display = 'none';

    if (!idAsignacion) {
        sesionesCache = [];
        habilitarFiltroFechas(false);
        tablaSesiones.innerHTML = '<tr><td colspan="3">Seleccione una rutina para ver su historial.</td></tr>';
        return;
    }

    habilitarFiltroFechas(true);

    try {
        const resumen = await apiRequest(`/api/coach/historial/asignacion/${idAsignacion}`, { token: getToken() });
        sesionesCache = resumen || [];
        renderizarTablaSesionesFiltradas();
    } catch (error) {
        sesionesCache = [];
        tablaSesiones.innerHTML = '<tr><td colspan="3">Error al cargar el historial.</td></tr>';
    }
}

function renderizarTablaSesionesFiltradas() {
    tablaSesiones.innerHTML = '';

    if (sesionesCache.length === 0) {
        tablaSesiones.innerHTML = '<tr><td colspan="3">Este cliente aún no tiene sesiones registradas en esta rutina.</td></tr>';
        return;
    }

    const desde = fechaDesde.value;
    const hasta = fechaHasta.value;

    const sesionesFiltradas = sesionesCache.filter(r => {
        if (desde && r.fechaRegistro < desde) return false;
        if (hasta && r.fechaRegistro > hasta) return false;
        return true;
    });

    if (sesionesFiltradas.length === 0) {
        tablaSesiones.innerHTML = '<tr><td colspan="3">No se encontraron sesiones en el rango de fechas seleccionado.</td></tr>';
        return;
    }

    const estiloBotonVer = "background: transparent; border: 1px solid #a3e635; color: #a3e635; padding: 6px 12px; font-size: 0.75rem; font-weight: 600; cursor: pointer; border-radius: 4px; transition: all 0.2s;";
    const estiloBotonEliminar = "background: transparent; border: 1px solid #333; color: #a1a1aa; padding: 6px 12px; font-size: 0.75rem; font-weight: 600; cursor: pointer; border-radius: 4px; transition: all 0.2s; margin-left: 8px;";
    const hoverEliminar = "onmouseover=\"this.style.borderColor='#ef4444'; this.style.color='#ef4444'\" onmouseout=\"this.style.borderColor='#333'; this.style.color='#a1a1aa'\"";

    sesionesFiltradas.forEach(r => {
        tablaSesiones.innerHTML += `
            <tr>
                <td><strong>${r.fechaRegistro}</strong></td>
                <td>${r.rutinaNombre}</td>
                <td style="display: flex;">
                    <button type="button" class="btn-modificar-sesion" data-id="${r.idHistRut}" style="${estiloBotonVer}" onmouseover="this.style.background='#1a2e05'" onmouseout="this.style.background='transparent'">VER / EDITAR</button>
                    <button type="button" class="btn-eliminar-sesion" data-id="${r.idHistRut}" data-nombre="${r.rutinaNombre}" data-fecha="${r.fechaRegistro}" style="${estiloBotonEliminar}" ${hoverEliminar}>ELIMINAR</button>
                </td>
            </tr>
        `;
    });

    document.querySelectorAll('.btn-modificar-sesion').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            await abrirEdicionSesion(e.target.dataset.id);
        });
    });

    document.querySelectorAll('.btn-eliminar-sesion').forEach(btn => {
        btn.addEventListener('click', (e) => {
            abrirModalEliminarSesion(e.target.dataset.id, e.target.dataset.nombre, e.target.dataset.fecha);
        });
    });
}

// 3. Traer el detalle de una sesión y armar los inputs
async function abrirEdicionSesion(idHistRut) {
    try {
        const detalle = await apiRequest(`/api/coach/historial/sesion/${idHistRut}`, { token: getToken() });

        document.getElementById('idHistRutEditar').value = detalle.idHistRut;
        document.getElementById('fechaSesionOculta').value = detalle.fechaRegistro;
        document.getElementById('fechaEdicionDisplay').textContent = detalle.fechaRegistro;

        contenedorEjercicios.innerHTML = '';

        const seriesPorEjercicio = {};
        detalle.series.forEach(serie => {
            if (!seriesPorEjercicio[serie.idEjercicio]) {
                seriesPorEjercicio[serie.idEjercicio] = {
                    nombre: serie.nombreEjercicio,
                    series: []
                };
            }
            seriesPorEjercicio[serie.idEjercicio].series.push(serie);
        });

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

            datosEj.series.forEach((s, idx) => agregarFila(idx + 1, s));

            card.querySelector('.btn-add-serie').addEventListener('click', () => {
                const numActuales = tbody.querySelectorAll('tr').length;
                agregarFila(numActuales + 1);
            });
        });

        formEditarSesion.style.display = 'block';
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

// 4. Enviar el PUT al backend
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
        await cargarHistorialCliente();

    } catch (error) {
        document.getElementById('formStatusHistorial').textContent = error.message;
    }
});

// --- LÓGICA PARA ELIMINAR SESIÓN ---
function abrirModalEliminarSesion(idHistRut, nombreRutina, fechaRegistro) {
    idSesionAEliminar = idHistRut;

    const fechaObj = new Date(fechaRegistro + 'T00:00:00');
    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const diaNombre = diasSemana[fechaObj.getDay()];

    document.getElementById('eliminarSesionNombreRutina').textContent = nombreRutina;
    document.getElementById('eliminarSesionFecha').textContent = `${diaNombre}, ${fechaRegistro}`;

    modalConfirmarEliminar.showModal();
}

async function eliminarSesionBackend() {
    if (!idSesionAEliminar) return;

    try {
        await apiRequest(`/api/coach/historial/eliminar/${idSesionAEliminar}`, {
            method: 'DELETE',
            token: getToken()
        });

        modalConfirmarEliminar.close();
        mostrarToast('Sesión eliminada correctamente');

        if (document.getElementById('idHistRutEditar').value === idSesionAEliminar) {
            formEditarSesion.style.display = 'none';
        }

        await cargarHistorialCliente();

    } catch (error) {
        alert("Error al eliminar la sesión: " + error.message);
    }
}

function mostrarToast(m) {
    toast.textContent = m;
    toast.hidden = false;
    setTimeout(() => toast.hidden = true, 3500);
}