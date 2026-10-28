import { apiRequest, getToken } from '../api.js';
import {renderRecepcionLayout } from './layout-recepcionista.js'

document.addEventListener('DOMContentLoaded', () => {
    // Ilumina la opción de "Resumen/Overview" o lo deja sin iluminar si no hay ninguna coincidencia
    renderRecepcionLayout('registrar_pago');

    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }
});
// --- ESTADOS GLOBALES ---
let listadoMembresias = [];
let clientesTotales = [];
let clienteSeleccionado = null;
let membresiaSeleccionada = null;
let tipoMembresiaSeleccionado = null;

// --- ELEMENTOS DEL DOM ---
const modalClientes = document.getElementById('modalClientes');
const btnAbrirModalClientes = document.getElementById('btnAbrirModalClientes');
const inputBuscarCliente = document.getElementById('buscarCliente');
const tablaClientesBody = document.getElementById('tablaClientesBody');
const txtClienteSeleccionado = document.getElementById('txtClienteSeleccionado');

const selectMembresia = document.getElementById('selectMembresia');
const selectTipoMembresia = document.getElementById('selectTipoMembresia');
const selectCuotas = document.getElementById('selectCuotas');
const campoCuotas = document.getElementById('campoCuotas');

const fechaPago = document.getElementById('fechaPago');
const selectTipoPago = document.getElementById('selectTipoPago');
const campoMontoTransferencia = document.getElementById('campoMontoTransferencia');
const montoTransferencia = document.getElementById('montoTransferencia');
const lblTotal = document.getElementById('lblTotal');
const btnRegistrarPago = document.getElementById('btnRegistrarPago');

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
    // Configurar fecha actual por defecto
    const hoy = new Date().toISOString().split('T')[0];
    fechaPago.value = hoy;

    // Obtener catálogo de membresías
    try {
        listadoMembresias = await apiRequest('/membresia/listar', { token: getToken() });
        cargarSelectMembresias();
    } catch (error) {
        console.error("Error al cargar membresías", error);
    }
});

// --- PASO 1: CLIENTES ---
btnAbrirModalClientes.addEventListener('click', async () => {
    modalClientes.showModal();
    tablaClientesBody.innerHTML = '<tr><td colspan="2" style="text-align:center;">Cargando clientes...</td></tr>';

    try {
        clientesTotales = await apiRequest('/api/usuarios/clientes', { token: getToken() });
        renderizarClientes(clientesTotales);
    } catch (error) {
        tablaClientesBody.innerHTML = '<tr><td colspan="2" style="color:red;">Error al cargar clientes</td></tr>';
    }
});

inputBuscarCliente.addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase();
    const filtrados = clientesTotales.filter(c =>
        c.nomApe.toLowerCase().includes(texto) || c.dniUs.toString().includes(texto)
    );
    renderizarClientes(filtrados);
});

function renderizarClientes(lista) {
    if (lista.length === 0) {
        tablaClientesBody.innerHTML = '<tr><td colspan="2" style="text-align:center;">No se encontraron resultados</td></tr>';
        return;
    }
    tablaClientesBody.innerHTML = lista.map(c => `
        <tr style="cursor:pointer;" onclick="window.seleccionarCliente(${c.idUsuario}, '${c.nomApe}', ${c.dniUs})">
            <td>${c.dniUs}</td>
            <td><strong>${c.nomApe}</strong></td>
        </tr>
    `).join('');
}

window.seleccionarCliente = (id, nombre, dni) => {
    clienteSeleccionado = { id, nombre, dni };
    txtClienteSeleccionado.textContent = `${nombre} (DNI: ${dni})`;
    modalClientes.close();

    // Habilitar siguiente paso
    document.getElementById('seccionMembresia').style.opacity = '1';
    document.getElementById('seccionMembresia').style.pointerEvents = 'auto';
    selectMembresia.disabled = false;
};

// --- PASO 2 y 3: MEMBRESÍAS ---
function cargarSelectMembresias() {
    // Filtrar solo las activas
    const activas = listadoMembresias.filter(m => m.estado !== 'INACTIVO');
    selectMembresia.innerHTML = '<option value="">Seleccione una membresía...</option>' +
        activas.map(m => `<option value="${m.idMembresia}">${m.descripMembresia}</option>`).join('');
}

selectMembresia.addEventListener('change', (e) => {
    const id = parseInt(e.target.value);
    membresiaSeleccionada = listadoMembresias.find(m => m.idMembresia === id);

    if (membresiaSeleccionada && membresiaSeleccionada.tipos) {
        selectTipoMembresia.disabled = false;
        selectTipoMembresia.innerHTML = '<option value="">Seleccione un plan...</option>' +
            membresiaSeleccionada.tipos.map(t =>
                `<option value="${t.idTipoMem}">${t.diasAsistencia} días/sem - ${t.duracionMembresia} días ($${t.costoMembresia})</option>`
            ).join('');
    } else {
        selectTipoMembresia.innerHTML = '<option value="">Sin planes disponibles</option>';
        selectTipoMembresia.disabled = true;
    }

    tipoMembresiaSeleccionado = null;
    actualizarTotalesUI();
});

selectTipoMembresia.addEventListener('change', (e) => {
    const idTipo = parseInt(e.target.value);
    tipoMembresiaSeleccionado = membresiaSeleccionada.tipos.find(t => t.idTipoMem === idTipo);

    if (tipoMembresiaSeleccionado) {
        document.getElementById('seccionPago').style.opacity = '1';
        document.getElementById('seccionPago').style.pointerEvents = 'auto';
        btnRegistrarPago.disabled = false;

        // Mostrar cuotas si la duración es de aprox 1 mes (>= 28 días y <= 31 días)
        if (tipoMembresiaSeleccionado.duracionMembresia >= 28 && tipoMembresiaSeleccionado.duracionMembresia <= 31) {
            campoCuotas.style.display = 'block';
        } else {
            campoCuotas.style.display = 'none';
            selectCuotas.value = "1"; // Reset a 1
        }

        actualizarTotalesUI();
    }
});

// --- PASO 4: CÁLCULOS Y PAGOS ---
selectCuotas.addEventListener('change', actualizarTotalesUI);

selectTipoPago.addEventListener('change', (e) => {
    campoMontoTransferencia.style.display = e.target.value === 'Ambos' ? 'block' : 'none';
    if(e.target.value !== 'Ambos') montoTransferencia.value = '';
});

function actualizarTotalesUI() {
    if (!tipoMembresiaSeleccionado) {
        lblTotal.textContent = "$0.00";
        return;
    }
    const cuotas = campoCuotas.style.display === 'block' ? parseInt(selectCuotas.value) : 1;
    const total = tipoMembresiaSeleccionado.costoMembresia * cuotas;
    lblTotal.textContent = `$${total.toLocaleString('es-AR')}`;
}

// --- SUBMIT: REGISTRAR PAGO ---
document.getElementById('formPago').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!clienteSeleccionado || !membresiaSeleccionada || !tipoMembresiaSeleccionado) return;

    const cuotas = campoCuotas.style.display === 'block' ? parseInt(selectCuotas.value) : 1;
    const costoTotal = tipoMembresiaSeleccionado.costoMembresia * cuotas;

    // Formatear LocalDateTime: Agrega T00:00:00 si es necesario
    const fecha = fechaPago.value ? `${fechaPago.value}T00:00:00` : new Date().toISOString().split('.')[0];

    const payload = {
        idClienteMembresia: null,
        idUsuario: clienteSeleccionado.id,
        idMembresia: membresiaSeleccionada.idMembresia, // Se usa idMembresia según la clase record solicitada
        cantCuotas : selectCuotas.value,
        costoTotal: costoTotal,
        tipoPago: selectTipoPago.value,
        fechaPago: fecha
    };

    try {
        await apiRequest('/cliente-membresias/registrar-pago', {
            method: 'POST',
            body: JSON.stringify(payload),
            token: getToken()
        });

        mostrarModalExito(cuotas);
    } catch (error) {
        alert("Error al registrar pago: " + error.message);
    }
});

function mostrarModalExito(cuotas) {
    // Rellenar datos visuales
    document.getElementById('exitoNombre').textContent = clienteSeleccionado.nombre;
    document.getElementById('exitoDni').textContent = clienteSeleccionado.dni;
    document.getElementById('exitoMembresia').textContent = membresiaSeleccionada.descripMembresia;
    document.getElementById('exitoAsistencia').textContent = `${tipoMembresiaSeleccionado.diasAsistencia} días por semana`;

    // Calcular Vencimiento
    const fechaBase = new Date(fechaPago.value);
    // Sumamos (duración del tipo * cuotas seleccionadas)
    fechaBase.setDate(fechaBase.getDate() + (tipoMembresiaSeleccionado.duracionMembresia * cuotas));

    document.getElementById('exitoVencimiento').textContent = fechaBase.toLocaleDateString('es-AR', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    document.getElementById('modalExito').showModal();
}