import { apiRequest, getToken } from '../api.js';
import {renderRecepcionLayout} from './layout-recepcionista.js'

let historialTotal = [];
let idBajaSeleccionada = null;

const tabla = document.getElementById('tablaHistorial');
const inputBuscar = document.getElementById('inputBuscar');
const chkInactivos = document.getElementById('chkInactivos');
const cantResultados = document.getElementById('cantResultados');
const modalConfirmarBaja = document.getElementById('modalConfirmarBaja');
const toast = document.getElementById('toast');

document.addEventListener('DOMContentLoaded', async () => {
    renderRecepcionLayout('historial_pago')
    // Eventos de filtrado
    inputBuscar?.addEventListener('input', aplicarFiltros);
    chkInactivos?.addEventListener('change', aplicarFiltros);

    // Eventos del modal
    document.getElementById('btnCancelarBaja')?.addEventListener('click', () => modalConfirmarBaja.close());
    document.getElementById('btnProcesarBaja')?.addEventListener('click', procesarBaja);



    await cargarHistorial();
});

async function cargarHistorial() {
    try {
        tabla.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Cargando historial...</td></tr>';

        // Llamada a tu endpoint general
        historialTotal = await apiRequest('/cliente-membresias/historial', { token: getToken() });
        aplicarFiltros();

        procesarVencimientos(historialTotal);

    } catch (error) {
        tabla.innerHTML = `<tr><td colspan="5" style="text-align:center; color: #ef9d89;">Error al cargar datos: ${error.message}</td></tr>`;
    }
}

function aplicarFiltros() {
    const texto = inputBuscar.value.toLowerCase().trim();
    const mostrarInactivos = chkInactivos ? chkInactivos.checked : false;

    const filtrados = historialTotal.filter(reg => {
        // --- AJUSTA ESTOS NOMBRES SEGÚN TU BACKEND ---
        // Asumiendo que el JSON trae { usuario: { nomApe: "...", dniUs: "..." } }
        const nom = (reg.usuario?.nomApe || reg.nombreCliente || '').toLowerCase();
        const dni = (reg.usuario?.dniUs || reg.dniCliente || '').toString();

        const coincideTexto = nom.includes(texto) || dni.includes(texto);

        // Asumiendo que el estado se guarda en reg.estado
        const esInactivo = (reg.estado === 'VENCIDO' || reg.estado === "BAJA");

        if (!mostrarInactivos && esInactivo) return false;

        return coincideTexto;
    });

    renderizarTabla(filtrados.sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago)));
}

function renderizarTabla(lista) {
    tabla.innerHTML = '';
    cantResultados.textContent = `${lista.length} registro(s)`;

    if (lista.length === 0) {
        tabla.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 28px; color: var(--muted);">No se encontraron pagos registrados.</td></tr>`;
        return;
    }

    lista.forEach(reg => {
        const tr = document.createElement('tr');

        const nombreCliente = reg.usuario?.nomApe || reg.nombreCliente || 'Cliente Desconocido';
        const dniCliente = reg.usuario?.dniUs || reg.dniCliente || '-';
        const nombrePlan = reg.nombreMembresia || 'Plan Base';
        // Formateo de fecha
        const diasAsistencia = reg.diasAsistencia || 0;
        const fecha = reg.fechaPago;
        const fechaVencimiento = reg.fechaVencimiento || '-';
        let estado = reg.estado;



        const esInactivo = estado === "VENCIDO" || estado ==="BAJA";

        // Estilos visuales para inactivos
        const estiloTexto = esInactivo ? 'color: var(--muted); text-decoration: line-through;' : '';
        const estiloEtiqueta = esInactivo ? 'background: #333; color: #aaa;' : '';
        const estiloVencimiento = esInactivo ? '' : 'color: var(--lime); font-weight: bold;';

        // Botón de acción
        let botonHTML = '';
        if (!esInactivo) {

            // El ID principal de este registro (ClienteMembresia)
            let idRegistro = reg.idCliMem;
            botonHTML = `<button type="button" class="is-danger" onclick="window.abrirModalBaja(${idRegistro})">Dar de Baja</button>`;
        }
        /*
        else {
            botonHTML = `<span style="color: var(--muted); font-size: 0.8rem;">${estado}</span>`;
        }
        */

        tr.innerHTML = `
            <td>
                <div>
                    <strong style="${estiloTexto}">${nombreCliente}</strong>
                    <small>DNI: ${dniCliente}</small>
                </div>
            </td>
            <td>
                <strong style="${estiloTexto}">${nombrePlan}</strong>
            </td>
            <td>
                <strong style="${estiloTexto}">${diasAsistencia} días/sem</strong>
            </td>
            <td style="${estiloTexto}">${fecha}</td>
            <td style="${estiloTexto} ${estiloVencimiento}">${fechaVencimiento}</td>
            <td>
                <span class="role-label" style="${estiloEtiqueta}">${estado}</span>
            </td>
            <td>
                <div class="table-actions" style="justify-content: flex-end;">
                    ${botonHTML}
                </div>
            </td>
        `;
        tabla.appendChild(tr);
    });
}

window.abrirModalBaja = (id) => {
    idBajaSeleccionada = id;
    modalConfirmarBaja.showModal();
};

async function procesarBaja() {
    if (!idBajaSeleccionada) return;

    try {
        // Petición al backend para hacer el soft delete (baja lógica)
        await apiRequest(`/cliente-membresias/${idBajaSeleccionada}/baja`, {
            method: 'DELETE',
            token: getToken()
        });

        mostrarToast("Membresía dada de baja correctamente.");
        modalConfirmarBaja.close();

        // Recargar datos
        await cargarHistorial();
    } catch (error) {
        mostrarToast("Error al procesar la baja: " + error.message);
    } finally {
        idBajaSeleccionada = null;
    }
}

// --- LÓGICA DE PRÓXIMOS VENCIMIENTOS ---
function procesarVencimientos(lista) {
    const panel = document.getElementById('panelVencimientos');
    const contenedor = document.getElementById('listaVencimientos');
    const btnVerMas = document.getElementById('btnVerMasVencimientos');

    contenedor.innerHTML = '';

    // Configurar 'hoy' a las 00:00:00 para calcular días exactos sin importar la hora
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let proximos = [];

    lista.forEach(reg => {
        // Solo verificamos clientes activos. Si no tiene fechaVencimiento, lo saltamos.
        if (reg.estado !== 'ACTIVO' || !reg.fechaVencimiento) return;

        // Parsear "YYYY-MM-DD" desde el DTO para evitar problemas de zona horaria
        const [year, month, day] = reg.fechaVencimiento.split('-');
        const fechaVenc = new Date(year, month - 1, day);
        fechaVenc.setHours(0, 0, 0, 0);

        // Diferencia en milisegundos convertida a días
        const diffTime = fechaVenc - hoy;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Filtramos solo los que vencen en 7 días o menos (incluso los que vencen hoy, diffDays == 0)
        if (diffDays >= 0 && diffDays <= 7) {
            proximos.push({ ...reg, diasRestantes: diffDays });
        }
    });

    // Si no hay ninguno por vencer, ocultamos todo el panel superior
    if (proximos.length === 0) {
        panel.style.display = 'none';
        return;
    }

    // Ordenar del más urgente (0) al menos urgente (7)
    proximos.sort((a, b) => a.diasRestantes - b.diasRestantes);

    panel.style.display = 'block';
    let hayModerados = false;

    proximos.forEach(p => {
        const esUrgente = p.diasRestantes <= 3; // Rojo
        if (!esUrgente) hayModerados = true;    // Naranja

        const nombre = p.usuario?.nomApe || p.nombreCliente || 'Cliente';
        const membresia = p.nombreMembresia || 'Plan';

        // Diseño de colores
        const colorFondo = esUrgente ? 'rgb(239 68 68 / 10%)' : 'rgb(249 115 22 / 10%)';
        const colorBorde = esUrgente ? '#ef4444' : '#f97316';
        const colorTexto = esUrgente ? '#ef4444' : '#ea580c';

        const div = document.createElement('div');
        div.className = esUrgente ? 'urgente' : 'moderado';
        div.style = `background: ${colorFondo}; border-left: 4px solid ${colorBorde}; padding: 12px 16px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 0.95rem;`;

        if (!esUrgente) {
            div.style.display = 'none'; // Los naranjas nacen ocultos
        }

        const fechaFormat = p.fechaVencimiento.split('-').reverse().join('/');
        let textoDias = p.diasRestantes === 0 ? '¡Vence HOY!' : `Vence en ${p.diasRestantes} día(s)`;

        div.innerHTML = `
            <div>
                <strong style="color: #333;">${nombre}</strong> <span style="color: #666; margin-left: 8px;">— ${membresia}</span>
            </div>
            <div style="color: ${colorTexto}; font-weight: bold; text-transform: uppercase; font-size: 0.85rem;">
                ${textoDias} <span style="color: #888; margin-left: 8px; font-weight: normal;">(${fechaFormat})</span>
            </div>
        `;
        contenedor.appendChild(div);
    });

    // Lógica del botón toggle "Ver más"
    if (hayModerados) {
        btnVerMas.style.display = 'inline-block';
        let mostrandoTodo = false;

        // Clonamos el botón para asegurar que no se dupliquen los eventos de clic al recargar
        const nuevoBtn = btnVerMas.cloneNode(true);
        btnVerMas.parentNode.replaceChild(nuevoBtn, btnVerMas);

        nuevoBtn.addEventListener('click', () => {
            mostrandoTodo = !mostrandoTodo;
            const moderados = contenedor.querySelectorAll('.moderado');
            moderados.forEach(el => el.style.display = mostrandoTodo ? 'flex' : 'none');
            nuevoBtn.textContent = mostrandoTodo ? 'Ocultar (mostrar solo urgentes)' : 'Ver más (hasta 7 días)';
        });
    } else {
        btnVerMas.style.display = 'none';
    }
}

function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.hidden = false;
    setTimeout(() => { toast.hidden = true; }, 3500);
}