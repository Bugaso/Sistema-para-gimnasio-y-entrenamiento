import { apiRequest, getToken } from '../api.js';
import { renderRecepcionLayout } from './layout-recepcionista.js';

const buscadorCliente = document.getElementById('buscadorCliente');
const selectCliente = document.getElementById('selectCliente');
const panelAsistencia = document.getElementById('panelAsistencia');
const btnAccionToggle = document.getElementById('btnAccionToggle');
const estadoActualTxt = document.getElementById('estadoActualTxt');
const toast = document.getElementById('toast');

let clienteAdentro = false;
let clientesCache = []; // Caché para la búsqueda incremental

document.addEventListener('DOMContentLoaded', async () => {
    renderRecepcionLayout('asistencia');

    if (!getToken()) { window.location.href = '/login'; return; }

    await cargarClientes();

    // 1. EVENTO DE BÚSQUEDA INCREMENTAL
    buscadorCliente.addEventListener('input', (e) => {
        const termino = e.target.value.toLowerCase().trim();

        // Filtramos por DNI (como string) o por Nombre
        const filtrados = clientesCache.filter(c =>
            c.dniUs.toString().includes(termino) ||
            c.nomApe.toLowerCase().includes(termino)
        );

        renderizarSelect(filtrados);
    });

    // 2. EVENTO AL SELECCIONAR UN CLIENTE DE LA LISTA
    selectCliente.addEventListener('change', async (e) => {
        const idUsuario = e.target.value;
        if (!idUsuario) {
            panelAsistencia.style.display = 'none';
            return;
        }

        // Mostrar datos completos en pantalla grande
        const option = e.target.options[e.target.selectedIndex];
        document.getElementById('nombreClienteDisplay').textContent = option.dataset.nombre;
        document.getElementById('dniClienteDisplay').textContent = `Documento: ${option.dataset.dni}`;

        await revisarEstado(idUsuario);
        panelAsistencia.style.display = 'block';
    });

    btnAccionToggle.addEventListener('click', registrarAsistencia);
});

// Cargar datos una sola vez al inicio
async function cargarClientes() {
    try {
        clientesCache = await apiRequest('/api/usuarios/clientes', { token: getToken() });
        renderizarSelect(clientesCache); // Mostrar todos por defecto

        // Colocar el foco en el buscador para que el recepcionista empiece a tipear directo
        buscadorCliente.focus();
    } catch (error) {
        console.error("Error al cargar clientes", error);
        selectCliente.innerHTML = '<option value="" disabled>Error al cargar.</option>';
    }
}

// Dibuja las opciones (DNI - Nombre) en el cuadro
function renderizarSelect(lista) {
    selectCliente.innerHTML = '';

    if (lista.length === 0) {
        selectCliente.innerHTML = '<option value="" disabled>No se encontraron clientes...</option>';
        return;
    }

    lista.forEach(c => {
        selectCliente.innerHTML += `
            <option value="${c.idUsuario}" data-nombre="${c.nomApe}" data-dni="${c.dniUs}" style="padding: 8px; border-bottom: 1px solid #333;">
                DNI: ${c.dniUs} — ${c.nomApe}
            </option>
        `;
    });
}

// Comprobar si está adentro o afuera
async function revisarEstado(idUsuario) {
    try {
        const estado = await apiRequest(`/api/recepcion/asistencia/estado/${idUsuario}`, { token: getToken() });
        clienteAdentro = estado.adentro;

        if (clienteAdentro) {
            estadoActualTxt.textContent = "🟢 Adentro del gimnasio";
            estadoActualTxt.style.color = "#a3e635";
            btnAccionToggle.textContent = "REGISTRAR SALIDA";
            btnAccionToggle.className = "btn-toggle btn-salida";
        } else {
            estadoActualTxt.textContent = "🔴 Fuera del gimnasio";
            estadoActualTxt.style.color = "#9ca3af";
            btnAccionToggle.textContent = "AUTORIZAR INGRESO";
            btnAccionToggle.className = "btn-toggle btn-entrada";
        }
    } catch (error) {
        console.error(error);
        mostrarToast("No se pudo verificar el estado del cliente.");
    }
}


// Disparar Entrada/Salida
async function registrarAsistencia() {
    const idUsuario = selectCliente.value;
    if (!idUsuario) return;

    btnAccionToggle.disabled = true;

    try {
        const payload = { idUsuario: parseInt(idUsuario) };
        const response = await apiRequest('/api/recepcion/asistencia/registrar', {
            method: 'POST',
            body: JSON.stringify(payload),
            token: getToken()
        });

        mostrarToast(response.message || "Operación exitosa");

        // Actualizar visualmente al instante (cambia el botón a rojo o verde)
        await revisarEstado(idUsuario);

        // El foco vuelve al buscador automáticamente por si quiere buscar a otro rápido,
        // pero SIN borrar al cliente actual de la lista.
        buscadorCliente.focus();

    } catch (error) {
        alert("Acceso Denegado: " + error.message);
    } finally {
        btnAccionToggle.disabled = false;
    }
}

function mostrarToast(m) { toast.textContent = m; toast.hidden = false; setTimeout(() => toast.hidden = true, 4000); }