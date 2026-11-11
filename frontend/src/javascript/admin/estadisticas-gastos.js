import { apiRequest, getToken } from '../api.js';
import { renderAdminLayout } from '../layout-admin.js';

let comprobantesTotales = [];
let chartInstance = null;

// Formateador de moneda argentina
const formateadorMoneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

document.addEventListener('DOMContentLoaded', async () => {
    // Si tienes un ítem en el menú lateral para esto, pásalo. Si no, usa cat_gastos o comprobantes.
    renderAdminLayout('estadisticas_gastos');

    const token = getToken();
    if (!token) {
        window.location.href = '/inicio-sesion.html';
        return;
    }

    await cargarDatos();
});

async function cargarDatos() {
    try {
        // Reutilizamos el endpoint de comprobantes
        const token = getToken();
        comprobantesTotales = await apiRequest('/api/admin/comprobantes', { token });

        inicializarFiltros();
        actualizarGrafico();
    } catch (error) {
        console.error("Error al cargar comprobantes:", error);
    }
}

function inicializarFiltros() {
    const selectAnio = document.getElementById('filtroAnio');
    const selectMes = document.getElementById('filtroMes');

    // 1. Extraer los años únicos que existen en los comprobantes
    const aniosSet = new Set();
    comprobantesTotales.forEach(c => {
        if (c.fechaDelComprobante) {
            aniosSet.add(c.fechaDelComprobante.substring(0, 4)); // Extrae "YYYY"
        }
    });

    // Ordenar de mayor a menor
    const anios = [...aniosSet].sort((a, b) => b - a);

    anios.forEach(anio => {
        selectAnio.innerHTML += `<option value="${anio}">${anio}</option>`;
    });

    // 2. Por defecto, seleccionar el mes y año actuales
    const hoy = new Date();
    const anioActual = hoy.getFullYear().toString();
    const mesActual = (hoy.getMonth() + 1).toString().padStart(2, '0');

    if (anios.includes(anioActual)) {
        selectAnio.value = anioActual;
    }
    selectMes.value = mesActual;

    // 3. Escuchar cambios para re-dibujar la torta
    selectAnio.addEventListener('change', actualizarGrafico);
    selectMes.addEventListener('change', actualizarGrafico);
}

function actualizarGrafico() {
    const anioSel = document.getElementById('filtroAnio').value;
    const mesSel = document.getElementById('filtroMes').value;

    // 1. Filtrar los comprobantes (Solo Pagados + coincidencia de mes/año)
    const filtrados = comprobantesTotales.filter(c => {
        if (c.estado !== 'Pagado') return false; // Solo sumamos lo que ya se pagó
        if (!c.fechaDelComprobante) return false;

        const [anioComp, mesComp] = c.fechaDelComprobante.split('-');

        const coincideAnio = (anioSel === 'Todos' || anioComp === anioSel);
        const coincideMes = (mesSel === 'Todos' || mesComp === mesSel);

        return coincideAnio && coincideMes;
    });

    // 2. Agrupar por Categoría y Sumar Montos
    const agrupados = {};
    let totalMonto = 0;

    filtrados.forEach(c => {
        const nombreCat = c.nombreCatGasto || "Sin Categoría";
        if (!agrupados[nombreCat]) {
            agrupados[nombreCat] = 0;
        }
        agrupados[nombreCat] += c.monto;
        totalMonto += c.monto;
    });

    // 3. Mandar los datos agrupados a Chart.js
    renderizarPie(agrupados, totalMonto);
}

function generarColorVibrante() {
    // Genera colores vivos aleatorios usando HSL (Hue, Saturación, Luminosidad)
    // Saturación entre 70-100%, Luminosidad entre 50-65%
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 30) + 70;
    const l = Math.floor(Math.random() * 15) + 50;
    return `hsl(${h}, ${s}%, ${l}%)`;
}

function renderizarPie(agrupados, total) {
    // Mostrar total en pantalla
    document.getElementById('totalMonto').textContent = formateadorMoneda.format(total);

    const ctx = document.getElementById('chartGastos').getContext('2d');
    const canvasObj = document.getElementById('chartGastos');
    const emptyState = document.getElementById('emptyState');

    // Destruir el gráfico anterior si el usuario cambió el filtro
    if (chartInstance) {
        chartInstance.destroy();
    }

    const labels = Object.keys(agrupados);
    const data = Object.values(agrupados);

    // Si no hay datos, ocultar canvas y mostrar mensaje
    if (labels.length === 0) {
        canvasObj.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    // Si hay datos, dibujar la torta
    canvasObj.style.display = 'block';
    emptyState.style.display = 'none';

    // Generar un color aleatorio vibrante para cada categoría (pedazo de torta)
    const bgColors = labels.map(() => generarColorVibrante());

    chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: bgColors,
                borderWidth: 2,
                borderColor: '#ffffff', // Borde blanco entre porciones
                hoverOffset: 10 // Efecto al pasar el mouse
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: { size: 14, family: "'Inter', sans-serif" },
                        color: '#333',
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        // Formatear el globo de información (tooltip) a Pesos Argentinos
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += formateadorMoneda.format(context.parsed);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}