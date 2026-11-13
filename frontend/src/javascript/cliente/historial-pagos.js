import { apiRequest, getToken, clearToken } from '../api.js';

const toast = document.getElementById('toast');
const formatoImporte = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const mostrarInactivos = document.getElementById("chkInactivos");

let ClienteRutinahistorial = []

mostrarInactivos.addEventListener('change',aplicarFiltro)

// --- HISTORIAL DE PAGOS (CLIENTE) ---
export async function cargarHistorialPagosCliente() {

    const tbody = document.getElementById('tbodyHistorialPagosCliente');

    try {
        ClienteRutinahistorial = await apiRequest('/api/cliente/historial-pagos', { token: getToken() });

        if (!Array.isArray(ClienteRutinahistorial) || ClienteRutinahistorial.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#666; padding: 20px;">Aún no tienes pagos registrados.</td></tr>';
            return;
        }

        aplicarFiltro()

    } catch (error) {
        console.error("Error al cargar historial de pagos:", error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #ef4444; padding: 20px;">Error al cargar el historial. Intenta nuevamente más tarde.</td></tr>';
    }
}

function formatearFecha(fecha) {
    if (!fecha) return '-';
    const [anio, mes, dia] = fecha.split('-').map(Number);
    if (!anio || !mes || !dia) return fecha;
    return new Intl.DateTimeFormat('es-AR').format(new Date(anio, mes - 1, dia, 12));
}

function mostrarToast(m) {
    toast.textContent = m; toast.hidden = false; setTimeout(() => toast.hidden = true, 3500);
}

function aplicarFiltro(){
    let filtro = ClienteRutinahistorial
    if(!mostrarInactivos.checked){
        filtro = ClienteRutinahistorial.filter( pago =>
            pago.estado === 'ACTIVO'
        );
        console.log(filtro)
    }
    renderizarHistorial(filtro.sort())
}

function renderizarHistorial(listaPagos){

    const tbody = document.getElementById('tbodyHistorialPagosCliente');
    tbody.innerHTML = '';



    listaPagos.forEach(pago => {
        const tr = document.createElement('tr');
        const estado = pago.estado || '-';
        const esInactivo = pago.estado === 'VENCIDO' || pago.estado === 'BAJA';
        const estiloTexto = esInactivo ? 'color: #9ca3af; text-decoration: line-through;' : 'color: #333;';

        const celdaPlan = document.createElement('td');
        const nombrePlan = document.createElement('strong');
        nombrePlan.textContent = pago.nombreMembresia || 'Plan Base';
        nombrePlan.style.cssText = estiloTexto;
        const diasAsistencia = document.createElement('small');
        diasAsistencia.textContent = `${pago.diasAsistencia || 0} días por semana`;
        diasAsistencia.style.color = '#888';
        celdaPlan.append(nombrePlan, document.createElement('br'), diasAsistencia);

        const celdaFechaPago = document.createElement('td');
        celdaFechaPago.textContent = formatearFecha(pago.fechaPago);
        celdaFechaPago.style.cssText = estiloTexto;

        const celdaVencimiento = document.createElement('td');
        const fechaVencimiento = document.createElement('strong');
        fechaVencimiento.textContent = formatearFecha(pago.fechaVencimiento);
        fechaVencimiento.style.cssText = `color: ${esInactivo ? '#9ca3af' : 'var(--lime)'}; ${esInactivo ? 'text-decoration: line-through;' : ''}`;
        celdaVencimiento.appendChild(fechaVencimiento);

        const celdaImporte = document.createElement('td');
        celdaImporte.textContent = pago.costoTotal == null
            ? '-'
            : formatoImporte.format(pago.costoTotal);

        const celdaEstado = document.createElement('td');
        const etiquetaEstado = document.createElement('span');
        etiquetaEstado.textContent = estado;
        etiquetaEstado.style.cssText = pago.estado === 'ACTIVO'
            ? 'background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 12px; font-weight: bold; border: 1px solid #bbf7d0; font-size: 0.75rem; text-transform: uppercase;'
            : esInactivo
                ? 'background: #f3f4f6; color: #4b5563; padding: 4px 12px; border-radius: 12px; font-weight: bold; border: 1px solid #d1d5db; font-size: 0.75rem; text-transform: uppercase;'
                : 'background: #fef08a; color: #854d0e; padding: 4px 12px; border-radius: 12px; font-weight: bold; border: 1px solid #fde047; font-size: 0.75rem; text-transform: uppercase;';
        celdaEstado.appendChild(etiquetaEstado);

        tr.append(celdaPlan, celdaFechaPago, celdaVencimiento, celdaImporte, celdaEstado);
        tbody.appendChild(tr);
    });
}