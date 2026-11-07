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


// Evento para el botón de confirmar en el modal de múltiples membresías
//el evento del botón Confirma en el modal de múltiples membresías
document.getElementById('btnConfirmarMembresiaMultiple').addEventListener('click', async () => {
    const select = document.getElementById('selectMembresiaActiva');
    const idCliMemSeleccionado = select.value;

    if (!idCliMemSeleccionado) return;

    const btn = document.getElementById('btnConfirmarMembresiaMultiple');
    const textoOriginal = btn.textContent;
    btn.textContent = "Procesando...";
    btn.disabled = true;

    try {
        // Interceptamos aquí también
        await procesarIngresoConValidacion(idUsuarioExcepcion, parseInt(idCliMemSeleccionado));
    } catch (error) {
        console.error(error);
    } finally {
        btn.textContent = textoOriginal;
        btn.disabled = false;
        // No limpiamos variables globales aquí porque procesarIngresoConValidacion podría necesitarlas para el siguiente modal
    }
});

// En el evento 'btnAutorizarExcepcion' (modal membresia vencida), actualizamos la llamada:
// Evento para forzar el ingreso a pesar del límite excedido
document.getElementById('btnAutorizarLimite').addEventListener('click', async () => {
    const modal = document.getElementById('modalLimiteExcedido');
    const btn = document.getElementById('btnAutorizarLimite');

    const textoOriginal = btn.textContent;
    btn.textContent = "Autorizando...";
    btn.disabled = true;

    try {
        await ejecutarLlamadaAsistencia(idUsuarioExcepcion, idClienteMembresiaSeleccionado);
        modal.close();
    } catch (error) {
        console.error(error);
    } finally {
        btn.textContent = textoOriginal;
        btn.disabled = false;
        idUsuarioExcepcion = null;
        idClienteMembresiaSeleccionado = null;
    }
});


// Evento para el botón de autorizar dentro del modal
document.getElementById('btnAutorizarExcepcion').addEventListener('click', async () => {
    const modal = document.getElementById('modalMembresiaVencida');

    // Cambiamos el texto para mostrar que está cargando
    const btn = document.getElementById('btnAutorizarExcepcion');
    const textoOriginal = btn.textContent;
    btn.textContent = "Autorizando...";
    btn.disabled = true;

    try {
        await ejecutarLlamadaAsistencia(idUsuarioExcepcion);
        modal.close();
    } catch (error) {
        // El error ya se maneja en ejecutarLlamadaAsistencia
    } finally {
        btn.textContent = textoOriginal;
        btn.disabled = false;
        idUsuarioExcepcion = null;
    }
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
        selectCliente.innerHTML = '<option value="" disabled style="padding: 12px 16px; color: var(--muted);">No se encontraron clientes...</option>';
        return;
    }

    lista.forEach(c => {
        selectCliente.innerHTML += `
            <option value="${c.idUsuario}" data-nombre="${c.nomApe}" data-dni="${c.dniUs}">
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
            estadoActualTxt.textContent = "Adentro del gimnasio";
            estadoActualTxt.style.color = "var(--lime)";
            btnAccionToggle.textContent = "REGISTRAR SALIDA";
            // Usamos la clase nativa roja del sistema
            btnAccionToggle.className = "admin-danger-action";
        } else {
            estadoActualTxt.textContent = "Fuera del gimnasio";
            estadoActualTxt.style.color = "var(--muted)";
            btnAccionToggle.textContent = "AUTORIZAR INGRESO";
            // Usamos la clase nativa principal (verde) del sistema
            btnAccionToggle.className = "admin-primary-action";
        }
    } catch (error) {
        console.error(error);
        mostrarToast("No se pudo verificar el estado del cliente.");
    }
}

// Variable global para almacenar el ID del cliente al que se le va a conceder acceso excepcional
let idUsuarioExcepcion = null;

// Variable global para almacenar el ID de ClienteMembresia seleccionado
let idClienteMembresiaSeleccionado = null;

// Funcion encargda de validar la asistencia del cliente
async function registrarAsistencia() {
    const idUsuario = selectCliente.value;
    if (!idUsuario) return;

    btnAccionToggle.disabled = true;

    try {
        // Si está adentro, registramos la salida directamente (no se valida límite para salir)
        if (clienteAdentro) {
            await ejecutarLlamadaAsistencia(idUsuario, null);
            return;
        }

        const historial = await apiRequest(`/cliente-membresias/historial/${idUsuario}`, { token: getToken() });
        const historialArray = Array.isArray(historial) ? historial : [];
        const membresiasActivas = historialArray.filter(mem => mem.estado === 'ACTIVO');

        if (membresiasActivas.length === 0) {
            mostrarModalExcepcion(idUsuario, historialArray);
        } else if (membresiasActivas.length === 1) {
            // En vez de registrar directo, validamos el límite primero
            await procesarIngresoConValidacion(idUsuario, membresiasActivas.at(0).idCliMem);
        } else {
            idUsuarioExcepcion = idUsuario;
            mostrarModalMultiplesMembresias(membresiasActivas);
        }
    } catch (error) {
        alert("Error al verificar acceso: " + error.message);
        btnAccionToggle.disabled = false;
    }
}

// Nueva función que intercepta y consulta el límite antes de registrar
async function procesarIngresoConValidacion(idUsuario, idCliMem) {
    try {
        const validacion = await apiRequest(`/api/recepcion/asistencia/validar-limite/${idCliMem}`, { token: getToken() });

        // 1. CERRAR EL MODAL MÚLTIPLE DE FORMA SEGURA (Solo si está abierto)
        const modalMultiple = document.getElementById('modalMultiplesMembresias');
        if (modalMultiple && modalMultiple.open) {
            modalMultiple.close();
        }

        if (validacion.limiteExcedido) {
            // 2. Verificar que el modal de límite realmente exista en el HTML
            const modalLimite = document.getElementById('modalLimiteExcedido');
            if (!modalLimite) {
                alert("Error: Falta el código HTML del modal 'modalLimiteExcedido'.");
                return;
            }

            // Rellenar datos del modal
            document.getElementById('limiteNombre').textContent = validacion.nombreMembresia;
            document.getElementById('limitePermitido').textContent = validacion.diasPermitidos + " días/sem";
            document.getElementById('limiteActuales').textContent = validacion.asistenciasActuales + " asistencias";
            document.getElementById('limiteExtra').textContent = validacion.asistenciasExtra + " extra";
            document.getElementById('limiteUltimo').textContent = validacion.ultimoIngreso || "Desconocido";

            // Guardar contexto global para el botón de autorización
            idUsuarioExcepcion = idUsuario;
            idClienteMembresiaSeleccionado = idCliMem;

            // Mostrar la advertencia
            modalLimite.showModal();
        } else {
            // El cliente está dentro de los límites, registrar normalmente
            await ejecutarLlamadaAsistencia(idUsuario, idCliMem);
        }
    } catch (error) {
        alert("Error al validar el límite: " + error.message);
    } finally {
        // Rehabilitamos el botón principal por si acaso
        const btnToggle = document.getElementById('btnAccionToggle');
        if (btnToggle) btnToggle.disabled = false;
    }
}

// Actualizada para aceptar idClienteMembresia
async function ejecutarLlamadaAsistencia(idUsuario, idCliMem = null) {
    try {
        // Armamos el payload añadiendo el idClienteMembresia si existe
        const payload = {
            idUsuario: parseInt(idUsuario),
            idClienteMembresia: idCliMem
        };

        const response = await apiRequest('/api/recepcion/asistencia/registrar', {
            method: 'POST',
            body: JSON.stringify(payload),
            token: getToken()
        });

        mostrarToast(response.message || "Operación exitosa");
        await revisarEstado(idUsuario);
        buscadorCliente.focus();
    } catch (error) {
        alert("Acceso Denegado: " + error.message);
    } finally {
        btnAccionToggle.disabled = false;
    }
}

// Nueva función para manejar el Modal de Múltiples Membresías
function mostrarModalMultiplesMembresias(membresiasActivas) {
    const modal = document.getElementById('modalMultiplesMembresias');
    const select = document.getElementById('selectMembresiaActiva');

    select.innerHTML = '';


    membresiasActivas.forEach(mem => {
        select.innerHTML += `<option value="${mem.idCliMem}">${mem.nombreMembresia} | ${mem.diasAsistencia} dias/sem | (Pagado: ${mem.fechaPago})</option>`;
    });

    modal.showModal();
    btnAccionToggle.disabled = false;
}


// Nueva función para manejar el Modal
function mostrarModalExcepcion(idUsuario, historial) {
    idUsuarioExcepcion = idUsuario;
    const modal = document.getElementById('modalMembresiaVencida');
    const spanNombre = document.getElementById('vencidaNombre');
    const spanFecha = document.getElementById('vencidaFecha');

    if (historial.length === 0) {
        spanNombre.textContent = "Sin registros previos";
        spanFecha.textContent = "Nunca";
    } else {
        // Obtener la última membresía (asumiendo que están ordenadas o tomando la primera de la lista inactiva)
        // Opcional: ordenar el historial por ID descendente para asegurar que es la última
        const ultima = historial.sort((a, b) => b.idCliMem - a.idCliMem)[0];

        spanNombre.textContent = ultima.nombreMembresia;

        // Calcular fecha de vencimiento: FechaPago + (dias * cantCuotas)
        // Nota: Asumiendo que diasAsistencia o un campo similar dicta la duración base.
        // Si el DTO no tiene un campo 'duracionDias' específico, aproximaremos a 30 días por cuota.
        const fechaPago = new Date(ultima.fechaPago);
        const diasBase = 30; // Aproximación si no hay campo de duración explícito en el DTO
        const cuotas = ultima.cantCuotas || 1;
        fechaPago.setDate(fechaPago.getDate() + (diasBase * cuotas));

        spanFecha.textContent = fechaPago.toLocaleDateString('es-AR');
    }

    modal.showModal();
    btnAccionToggle.disabled = false; // Rehabilitar el botón principal por si cancela
}


function mostrarToast(m) { toast.textContent = m; toast.hidden = false; setTimeout(() => toast.hidden = true, 4000); }