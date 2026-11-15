import { apiRequest, getToken, verificarAccesoRuta } from '../api.js';
import { renderAdminLayout } from '../layout-admin.js';

let comprobantesTotales = [];
let pagosTotales = [];

let chartGastosInstance = null;
let chartIngresosInstance = null;
let chartBalanceInstance = null;

// Formateador de moneda argentina
const formateadorMoneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

document.addEventListener('DOMContentLoaded', async () => {
    renderAdminLayout('estadisticas_gastos');
    const tieneAcceso = await verificarAccesoRuta("/admin/validar", "/");
    if (!tieneAcceso) return;

    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }

    await cargarDatos();
});

async function cargarDatos() {
    const token = getToken();

    const [resComprobantes, resPagos] = await Promise.allSettled([
        apiRequest('/api/admin/comprobantes', { token }),
        apiRequest('/cliente-membresias/historial', { token })
    ]);

    comprobantesTotales = resComprobantes.status === 'fulfilled' && Array.isArray(resComprobantes.value)
        ? resComprobantes.value
        : [];

    pagosTotales = resPagos.status === 'fulfilled' && Array.isArray(resPagos.value)
        ? resPagos.value
        : [];

    inicializarFiltros();
    actualizarGraficos();
}

function inicializarFiltros() {
    const selectAnio = document.getElementById('filtroAnio');
    const selectMes = document.getElementById('filtroMes');

    // Extraer los años únicos tanto de egresos como de ingresos
    const aniosSet = new Set();

    comprobantesTotales.forEach(c => {
        if (c.fechaDelComprobante) {
            aniosSet.add(c.fechaDelComprobante.substring(0, 4));
        }
    });

    pagosTotales.forEach(p => {
        if (p.fechaPago) {
            aniosSet.add(p.fechaPago.substring(0, 4));
        }
    });

    const anios = [...aniosSet].sort((a, b) => b - a);
    anios.forEach(anio => {
        selectAnio.innerHTML += `<option value="${anio}">${anio}</option>`;
    });

    // Seleccionar mes y año actuales por defecto
    const hoy = new Date();
    const anioActual = hoy.getFullYear().toString();
    const mesActual = (hoy.getMonth() + 1).toString().padStart(2, '0');

    if (anios.includes(anioActual)) {
        selectAnio.value = anioActual;
    }
    selectMes.value = mesActual;

    selectAnio.addEventListener('change', actualizarGraficos);
    selectMes.addEventListener('change', actualizarGraficos);
}

function actualizarGraficos() {
    const anioSel = document.getElementById('filtroAnio').value;
    const mesSel = document.getElementById('filtroMes').value;

    // 1. FILTRAR Y AGRUPAR EGRESOS (Comprobantes Pagados)
    const egresosFiltrados = comprobantesTotales.filter(c => {
        if (c.estado !== 'Pagado' || !c.fechaDelComprobante) return false;
        const [anioComp, mesComp] = c.fechaDelComprobante.split('-');
        return (anioSel === 'Todos' || anioComp === anioSel) &&
            (mesSel === 'Todos' || mesComp === mesSel);
    });

    const agrupadosGastos = {};
    let totalGastos = 0;

    egresosFiltrados.forEach(c => {
        const nombreCat = c.nombreCatGasto || "Sin Categoría";
        const monto = Number(c.monto || 0);
        agrupadosGastos[nombreCat] = (agrupadosGastos[nombreCat] || 0) + monto;
        totalGastos += monto;
    });

    // 2. FILTRAR Y AGRUPAR INGRESOS (Membresías cobradas, excluyendo BAJA)
    const ingresosFiltrados = pagosTotales.filter(p => {
        if (p.estado === 'BAJA' || !p.fechaPago) return false;
        const [anioPago, mesPago] = p.fechaPago.substring(0, 10).split('-');
        return (anioSel === 'Todos' || anioPago === anioSel) &&
            (mesSel === 'Todos' || mesPago === mesSel);
    });

    const agrupadosIngresos = {};
    let totalIngresos = 0;

    ingresosFiltrados.forEach(p => {
        const nombrePlan = p.nombreMembresia || "Membresía";
        const monto = Number(p.costoTotal || 0);
        agrupadosIngresos[nombrePlan] = (agrupadosIngresos[nombrePlan] || 0) + monto;
        totalIngresos += monto;
    });

    // 3. RENDERIZAR LOS 3 GRÁFICOS
    chartGastosInstance = renderizarTorta({
        instance: chartGastosInstance,
        canvasId: 'chartGastos',
        emptyId: 'emptyGastos',
        totalId: 'totalGastos',
        agrupados: agrupadosGastos,
        total: totalGastos,
        paleta: 'calida'
    });

    chartIngresosInstance = renderizarTorta({
        instance: chartIngresosInstance,
        canvasId: 'chartIngresos',
        emptyId: 'emptyIngresos',
        totalId: 'totalIngresos',
        agrupados: agrupadosIngresos,
        total: totalIngresos,
        paleta: 'fria'
    });

    renderizarBalanceNeto(totalIngresos, totalGastos);
}

function generarColores(cantidad, paleta) {
    const colores = [];
    for (let i = 0; i < cantidad; i++) {
        // Distribuye los tonos uniformemente según si es paleta cálida (gastos) o fría (ingresos)
        const baseHue = paleta === 'calida' ? 0 : 120;
        const rango = 140;
        const hue = (baseHue + Math.round((i * rango) / Math.max(cantidad, 1))) % 360;
        colores.push(`hsl(${hue}, 75%, 52%)`);
    }
    return colores;
}

function renderizarTorta({ instance, canvasId, emptyId, totalId, agrupados, total, paleta }) {
    document.getElementById(totalId).textContent = formateadorMoneda.format(total);

    const canvasObj = document.getElementById(canvasId);
    const emptyState = document.getElementById(emptyId);

    if (instance) {
        instance.destroy();
    }

    const labels = Object.keys(agrupados);
    const data = Object.values(agrupados);

    if (labels.length === 0) {
        canvasObj.style.display = 'none';
        emptyState.style.display = 'block';
        return null;
    }

    canvasObj.style.display = 'block';
    emptyState.style.display = 'none';

    return new Chart(canvasObj.getContext('2d'), {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: generarColores(labels.length, paleta),
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 13, family: "'Inter', sans-serif" },
                        color: '#333',
                        padding: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label ? `${context.label}: ` : '';
                            return label + formateadorMoneda.format(context.parsed || 0);
                        }
                    }
                }
            }
        }
    });
}

function renderizarBalanceNeto(ingresos, egresos) {
    const gananciaNeta = ingresos - egresos;
    const esPositiva = gananciaNeta >= 0;
    const colorNeta = esPositiva ? '#16a34a' : '#ef4444';

    // Actualizar total principal y barra de ecuación
    const totalEl = document.getElementById('totalGananciaNeta');
    totalEl.textContent = formateadorMoneda.format(gananciaNeta);
    totalEl.style.color = colorNeta;

    document.getElementById('detalleEcuacionBalance').innerHTML = `
        <span>Ingresos: <strong style="color: #65a30d;">${formateadorMoneda.format(ingresos)}</strong></span>
        <span>−</span>
        <span>Egresos: <strong style="color: #ef4444;">${formateadorMoneda.format(egresos)}</strong></span>
        <span>=</span>
        <span>Ganancia Neta: <strong style="color: ${colorNeta};">${formateadorMoneda.format(gananciaNeta)}</strong></span>
    `;

    const canvasObj = document.getElementById('chartBalance');
    const emptyState = document.getElementById('emptyBalance');

    if (chartBalanceInstance) {
        chartBalanceInstance.destroy();
    }

    if (ingresos === 0 && egresos === 0) {
        canvasObj.style.display = 'none';
        emptyState.style.display = 'block';
        chartBalanceInstance = null;
        return;
    }

    canvasObj.style.display = 'block';
    emptyState.style.display = 'none';

    chartBalanceInstance = new Chart(canvasObj.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Ingresos', 'Egresos', 'Ganancia Neta'],
            datasets: [{
                label: 'Monto (ARS)',
                data: [ingresos, egresos, gananciaNeta],
                backgroundColor: [
                    'rgba(132, 204, 22, 0.85)', // Verde lima para Ingresos
                    'rgba(239, 68, 68, 0.85)',  // Rojo para Egresos
                    esPositiva ? 'rgba(22, 163, 74, 0.9)' : 'rgba(185, 28, 28, 0.9)' // Dinámico según resultado
                ],
                borderColor: [
                    '#65a30d',
                    '#dc2626',
                    esPositiva ? '#15803d' : '#991b1b'
                ],
                borderWidth: 2,
                borderRadius: 6,
                maxBarThickness: 90
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => ` ${formateadorMoneda.format(context.parsed.y || 0)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => formateadorMoneda.format(value)
                    },
                    grid: {
                        color: (ctx) => ctx.tick.value === 0 ? '#666' : '#e5e7eb',
                        lineWidth: (ctx) => ctx.tick.value === 0 ? 2 : 1
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 14, weight: 'bold', family: "'Inter', sans-serif" },
                        color: '#222'
                    }
                }
            }
        }
    });
}