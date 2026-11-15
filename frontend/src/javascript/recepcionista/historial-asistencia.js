import { apiRequest, getToken, verificarAccesoRuta } from '../api.js';
import { renderRecepcionLayout } from './layout-recepcionista.js';

// Elementos del DOM
const selectorFiltro = document.getElementById('selectorFiltro');
const filtroFecha = document.getElementById('filtroFecha');
const filtroFechaFin = document.getElementById('filtroFechaFin');
const filtroMes = document.getElementById('filtroMes');
const filtroHoraMin = document.getElementById('filtroHoraMin');
const filtroHoraMax = document.getElementById('filtroHoraMax');
const filtroAdentro = document.getElementById('filtroAdentro');
const buscadorHistorial = document.getElementById('buscadorHistorial');
const tablaBody = document.getElementById('tablaHistorialAsistencia');
const contadorVisibles = document.getElementById('contadorVisibles');
const colSalida = document.getElementById('colSalida');
const badgeHoraPico = document.getElementById('badgeHoraPico');

// Modal Elements
const modal = document.getElementById('modalDetalleAsistencia');
const contenedorAlertas = document.getElementById('contenedorAlertas');
const alertaMembresia = document.getElementById('alertaMembresia');
const alertaExtra = document.getElementById('alertaExtra');

let asistenciasCargadas = [];
let cantidadDiasConsultados = 1;
let chartHorariosInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    const tieneAcceso = await verificarAccesoRuta("/api/recepcion/validar", "/");
    if (!tieneAcceso) return;
    renderRecepcionLayout('historial_asistencia');
    if (!getToken()) { window.location.href = '/login'; return; }

    // Inicializar fechas locales por defecto
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    const localISOTime = new Date(Date.now() - tzOffset).toISOString().split('T')[0];

    filtroFecha.value = localISOTime;
    filtroFechaFin.value = localISOTime;
    filtroMes.value = localISOTime.substring(0, 7); // YYYY-MM

    actualizarVisibilidadFiltrosFecha();
    await obtenerDatosDelBackend();

    // Eventos que consultan al backend
    selectorFiltro.addEventListener('change', async () => {
        actualizarVisibilidadFiltrosFecha();
        await obtenerDatosDelBackend();
    });
    filtroFecha.addEventListener('change', obtenerDatosDelBackend);
    filtroFechaFin.addEventListener('change', obtenerDatosDelBackend);
    filtroMes.addEventListener('change', obtenerDatosDelBackend);

    // Eventos de filtrado instantáneo en memoria (actualizan tabla y gráfico)
    buscadorHistorial.addEventListener('input', aplicarFiltrosYRenderizar);
    filtroHoraMin.addEventListener('change', aplicarFiltrosYRenderizar);
    filtroHoraMax.addEventListener('change', aplicarFiltrosYRenderizar);
    filtroAdentro.addEventListener('change', () => {
        colSalida.style.display = filtroAdentro.checked ? 'none' : 'table-cell';
        aplicarFiltrosYRenderizar();
    });
});

function actualizarVisibilidadFiltrosFecha() {
    const modo = selectorFiltro.value;
    const grupoFechaInicio = document.getElementById('grupoFechaInicio');
    const rangoFecha = document.getElementById('rangoFecha');
    const rangoMes = document.getElementById('rangoMes');

    grupoFechaInicio.style.display = (modo === 'dia' || modo === 'fecha') ? 'block' : 'none';
    rangoFecha.style.display = (modo === 'fecha') ? 'flex' : 'none';
    rangoMes.style.display = (modo === 'mes') ? 'block' : 'none';
}

// Genera el listado de fechas YYYY-MM-DD según el modo seleccionado
function obtenerFechasAConsultar() {
    const modo = selectorFiltro.value;

    if (modo === 'dia') {
        return filtroFecha.value ? [filtroFecha.value] : [];
    }

    let inicioStr = '';
    let finStr = '';

    if (modo === 'fecha') {
        inicioStr = filtroFecha.value;
        finStr = filtroFechaFin.value || filtroFecha.value;
    } else if (modo === 'mes' && filtroMes.value) {
        const [anio, mes] = filtroMes.value.split('-').map(Number);
        const ultimoDia = new Date(anio, mes, 0).getDate();
        inicioStr = `${filtroMes.value}-01`;
        finStr = `${filtroMes.value}-${String(ultimoDia).padStart(2, '0')}`;
    }

    if (!inicioStr || !finStr) return [];

    const [y1, m1, d1] = inicioStr.split('-').map(Number);
    const [y2, m2, d2] = finStr.split('-').map(Number);
    const inicio = new Date(y1, m1 - 1, d1);
    const fin = new Date(y2, m2 - 1, d2);

    if (fin < inicio) return [inicioStr];

    const fechas = [];
    const cursor = new Date(inicio);
    // Límite de seguridad de 62 días para evitar sobrecargar peticiones
    while (cursor <= fin && fechas.length < 62) {
        const yyyy = cursor.getFullYear();
        const mm = String(cursor.getMonth() + 1).padStart(2, '0');
        const dd = String(cursor.getDate()).padStart(2, '0');
        fechas.push(`${yyyy}-${mm}-${dd}`);
        cursor.setDate(cursor.getDate() + 1);
    }

    return fechas;
}

async function obtenerDatosDelBackend() {
    const fechas = obtenerFechasAConsultar();
    if (fechas.length === 0) return;

    cantidadDiasConsultados = fechas.length;
    tablaBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Cargando registros...</td></tr>';

    try {
        const token = getToken();
        const resultados = await Promise.all(
            fechas.map(f =>
                apiRequest(`/api/recepcion/asistencia/historial/dia?fecha=${f}`, { token })
                    .catch(() => [])
            )
        );

        asistenciasCargadas = resultados.flat().filter(Boolean);
        // Ordenar de más reciente a más antigua
        asistenciasCargadas.sort((a, b) => new Date(b.fechaHoraEntrada) - new Date(a.fechaHoraEntrada));

        aplicarFiltrosYRenderizar();
    } catch (error) {
        tablaBody.innerHTML = `<tr><td colspan="5" style="color: #ef9d89; text-align: center;">Error: ${error.message}</td></tr>`;
    }
}

// Filtra los datos en memoria y actualiza tanto el gráfico como la tabla
function aplicarFiltrosYRenderizar() {
    const terminoBusqueda = buscadorHistorial.value.toLowerCase().trim();
    const minHora = filtroHoraMin.value;
    const maxHora = filtroHoraMax.value;
    const soloAdentro = filtroAdentro.checked;

    const filtrados = asistenciasCargadas.filter(asistencia => {
        const matchTexto = asistencia.nombreCompleto.toLowerCase().includes(terminoBusqueda) ||
            asistencia.dni.toString().includes(terminoBusqueda);
        if (!matchTexto) return false;

        if (soloAdentro && asistencia.fechaHoraSalida) return false;

        const horaEntrada = extraerHora(asistencia.fechaHoraEntrada);
        if (minHora && horaEntrada < minHora) return false;
        if (maxHora && horaEntrada > maxHora) return false;

        return true;
    });

    dibujarFilas(filtrados);
    actualizarGraficoHorarios(filtrados);
}

// --- GRÁFICO DE BARRAS POR FRANJA HORARIA ---
function actualizarGraficoHorarios(listaFiltrada) {
    const canvas = document.getElementById('chartHorarios');
    const emptyMsg = document.getElementById('emptyGraficoHorarios');

    if (chartHorariosInstance) {
        chartHorariosInstance.destroy();
        chartHorariosInstance = null;
    }

    if (listaFiltrada.length === 0) {
        canvas.style.display = 'none';
        emptyMsg.style.display = 'block';
        badgeHoraPico.textContent = 'Horario pico: —';
        return;
    }

    canvas.style.display = 'block';
    emptyMsg.style.display = 'none';

    // Determinar rango de horas a mostrar en el eje X
    let horaInicio = filtroHoraMin.value ? parseInt(filtroHoraMin.value.split(':')[0], 10) : 6;
    let horaFin = filtroHoraMax.value ? parseInt(filtroHoraMax.value.split(':')[0], 10) : 23;

    // Si no hay filtro horario manual, expandir si hubiera registros fuera de 06:00-23:00
    if (!filtroHoraMin.value || !filtroHoraMax.value) {
        listaFiltrada.forEach(item => {
            if (!item.fechaHoraEntrada) return;
            const h = new Date(item.fechaHoraEntrada).getHours();
            if (!filtroHoraMin.value && h < horaInicio) horaInicio = h;
            if (!filtroHoraMax.value && h > horaFin) horaFin = h;
        });
    }

    if (horaFin < horaInicio) horaFin = horaInicio;

    // Inicializar contadores por cada hora
    const conteoPorHora = {};
    for (let h = horaInicio; h <= horaFin; h++) {
        conteoPorHora[h] = 0;
    }

    listaFiltrada.forEach(item => {
        if (!item.fechaHoraEntrada) return;
        const h = new Date(item.fechaHoraEntrada).getHours();
        if (conteoPorHora[h] !== undefined) {
            conteoPorHora[h]++;
        }
    });

    const horasKeys = Object.keys(conteoPorHora).map(Number);
    const labels = horasKeys.map(h => `${String(h).padStart(2, '0')}:00`);
    const valores = horasKeys.map(h => conteoPorHora[h]);

    // Detectar horario(s) pico
    const maxIngresos = Math.max(...valores);
    if (maxIngresos > 0) {
        const horasPico = horasKeys
            .filter(h => conteoPorHora[h] === maxIngresos)
            .map(h => `${String(h).padStart(2, '0')}:00 hs`);
        badgeHoraPico.textContent = `Horario pico: ${horasPico.join(', ')} (${maxIngresos})`;
    } else {
        badgeHoraPico.textContent = 'Horario pico: —';
    }

    // Resaltar las barras pico en rojo intenso y las demás en rojo translúcido
    const coloresBarras = valores.map(v =>
        (v === maxIngresos && maxIngresos > 0) ? '#d90429' : 'rgba(217, 4, 41, 0.45)'
    );

    chartHorariosInstance = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Ingresos',
                data: valores,
                backgroundColor: coloresBarras,
                hoverBackgroundColor: '#ef233c',
                borderRadius: 5,
                maxBarThickness: 42
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (items) => {
                            const h = parseInt(items[0].label.split(':')[0], 10);
                            const siguiente = String((h + 1) % 24).padStart(2, '0');
                            return `Franja ${items[0].label} - ${siguiente}:00`;
                        },
                        label: (context) => {
                            const total = context.parsed.y || 0;
                            if (cantidadDiasConsultados > 1) {
                                const promedio = (total / cantidadDiasConsultados).toFixed(1);
                                return ` ${total} ingresos (prom. ${promedio}/día)`;
                            }
                            return ` ${total} ingreso(s)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        precision: 0,
                        color: '#6b7270'
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.06)' }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#1a1d1c',
                        font: { weight: '600', size: 12 }
                    }
                }
            }
        }
    });
}

function dibujarFilas(lista) {
    contadorVisibles.textContent = lista.length;
    tablaBody.innerHTML = '';

    if (lista.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--muted);">No hay accesos que coincidan con los filtros.</td></tr>';
        return;
    }

    const esMultiDia = selectorFiltro.value !== 'dia';

    lista.forEach((item) => {
        const horaIn = extraerHora(item.fechaHoraEntrada) || '--:--';
        const fechaCorta = esMultiDia ? `${extraerFechaCorta(item.fechaHoraEntrada)} ` : '';
        const horaOut = extraerHora(item.fechaHoraSalida) || '--:--';

        const tr = document.createElement('tr');
        tr.className = 'row-clickable';
        tr.dataset.info = JSON.stringify(item);

        tr.innerHTML = `
            <td><strong>${item.nombreCompleto}</strong></td>
            <td>${item.dni}</td>
            <td>
                ${item.modalidad || 'Sin Membresía'}
                ${item.ingresoSinMembresia ? '<span class="status-alert">Sin membresía vigente</span>' : ''}
                ${item.esAsistenciaExtra ? '<span class="status-alert" style="color:#eab308;">Día extra</span>' : ''}
            </td>
            <td><strong style="color: var(--lime);">${fechaCorta}${horaIn}</strong></td>
            <td style="display: ${filtroAdentro.checked ? 'none' : 'table-cell'};">
                <strong style="color: ${item.fechaHoraSalida ? '#6b7270' : 'var(--success, #16a34a)'};">${item.fechaHoraSalida ? horaOut : 'EN GIMNASIO'}</strong>
            </td>
        `;

        tr.addEventListener('click', () => abrirModalDetalle(item));
        tablaBody.appendChild(tr);
    });
}

function abrirModalDetalle(item) {
    document.getElementById('detalleNombre').textContent = item.nombreCompleto + ' (' + (item.modalidad || 'Sin Membresía') + ')';

    const horaIn = extraerHora(item.fechaHoraEntrada);
    const horaOut = extraerHora(item.fechaHoraSalida);

    document.getElementById('detalleEntrada').textContent = horaIn;
    document.getElementById('detalleSalida').textContent = horaOut ? horaOut : 'Aún en el local';
    document.getElementById('detallePermanencia').textContent = calcularPermanencia(item.fechaHoraEntrada, item.fechaHoraSalida);

    alertaMembresia.style.display = item.ingresoSinMembresia ? 'block' : 'none';
    alertaExtra.style.display = item.esAsistenciaExtra ? 'block' : 'none';
    contenedorAlertas.style.display = (item.ingresoSinMembresia || item.esAsistenciaExtra) ? 'block' : 'none';

    modal.showModal();
}

function extraerHora(fechaIso) {
    if (!fechaIso) return null;
    const dateObj = new Date(fechaIso);
    const horas = dateObj.getHours().toString().padStart(2, '0');
    const minutos = dateObj.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
}

function extraerFechaCorta(fechaIso) {
    if (!fechaIso) return '';
    const dateObj = new Date(fechaIso);
    const dia = String(dateObj.getDate()).padStart(2, '0');
    const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
    return `${dia}/${mes}`;
}

function calcularPermanencia(entradaIso, salidaIso) {
    if (!entradaIso) return '-';

    const inicio = new Date(entradaIso);
    const fin = salidaIso ? new Date(salidaIso) : new Date();
    const diffMilisegundos = fin - inicio;

    if (diffMilisegundos < 0) return 'Error de reloj';

    const horas = Math.floor(diffMilisegundos / 1000 / 60 / 60);
    const minutos = Math.floor((diffMilisegundos / 1000 / 60) % 60);

    return horas === 0 ? `${minutos} minutos` : `${horas} horas, ${minutos} minutos`;
}