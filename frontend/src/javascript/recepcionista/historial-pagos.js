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
        const esInactivo = (reg.estado === 'INACTIVO' || reg.estado === 'BAJA');

        if (!mostrarInactivos && esInactivo) return false;

        return coincideTexto;
    });

    renderizarTabla(filtrados);
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

        // --- AJUSTA ESTOS NOMBRES SEGÚN TU DTO DE RESPUESTA ---
        const nombreCliente = reg.usuario?.nomApe || reg.nombreCliente || 'Cliente Desconocido';
        const dniCliente = reg.usuario?.dniUs || reg.dniCliente || '-';
        const nombrePlan = reg.nombreMembresia || 'Plan Base';
        // Formateo de fecha
        const diasAsistencia = reg.diasAsistencia;
        const fecha = reg.fechaPago;
        let estado = reg.estado;



        const esInactivo = estado === "VENCIDO";

        // Estilos visuales para inactivos
        const estiloTexto = esInactivo ? 'color: var(--muted); text-decoration: line-through;' : '';
        const estiloEtiqueta = esInactivo ? 'background: #333; color: #aaa;' : '';

        // Botón de acción
        let botonHTML = '';
        if (!esInactivo) {

            // El ID principal de este registro (ClienteMembresia)
            const idRegistro = reg.idClienteMembresia || reg.id;
            botonHTML = `<button type="button" class="is-danger" onclick="window.abrirModalBaja(${idRegistro})">Dar de Baja</button>`;
        } else {
            botonHTML = `<span style="color: var(--muted); font-size: 0.8rem;">Baja registrada</span>`;
        }

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
            method: 'PUT',
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

function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.hidden = false;
    setTimeout(() => { toast.hidden = true; }, 3500);
}