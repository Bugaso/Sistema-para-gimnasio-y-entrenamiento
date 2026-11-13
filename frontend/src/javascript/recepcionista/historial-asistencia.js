import {apiRequest, getToken, verificarAccesoRuta} from '../api.js';
import { renderRecepcionLayout } from './layout-recepcionista.js'; // Ajusta la ruta a tu layout

// Elementos del DOM
const filtroFecha = document.getElementById('filtroFecha');
const filtroHoraMin = document.getElementById('filtroHoraMin');
const filtroHoraMax = document.getElementById('filtroHoraMax');
const filtroAdentro = document.getElementById('filtroAdentro');
const buscadorHistorial = document.getElementById('buscadorHistorial');
const tablaBody = document.getElementById('tablaHistorialAsistencia');
const contadorVisibles = document.getElementById('contadorVisibles');
const colSalida = document.getElementById('colSalida');
const filtroSelect = document.getElementById('selectorFiltro')

// Modal Elements
const modal = document.getElementById('modalDetalleAsistencia');
const contenedorAlertas = document.getElementById('contenedorAlertas');
const alertaMembresia = document.getElementById('alertaMembresia');
const alertaExtra = document.getElementById('alertaExtra');

let asistenciasDelDia = []; // Almacena los datos originales traídos del backend

document.addEventListener('DOMContentLoaded', async () => {
    const tieneAcceso = await verificarAccesoRuta("/api/recepcion/validar", "/");
    if (!tieneAcceso) return;
    renderRecepcionLayout('historial_asistencia');
    if (!getToken()) { window.location.href = '/login'; return; }

    // Setear la fecha de hoy por defecto
    const hoy = new Date();
    // Formato YYYY-MM-DD considerando la zona horaria local
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
    filtroFecha.value = localISOTime;

    // Cargar datos iniciales
    await obtenerDatosDelBackend();

    filtroSelect.addEventListener('change', filtroFechaDia)

    // Eventos que disparan una nueva llamada al backend (solo cambio de fecha)
    filtroFecha.addEventListener('change', obtenerDatosDelBackend);

    // Eventos que disparan filtros locales (instantáneos)
    buscadorHistorial.addEventListener('input', renderizarTabla);
    filtroHoraMin.addEventListener('change', renderizarTabla);
    filtroHoraMax.addEventListener('change', renderizarTabla);

    filtroFechaDia();
    filtroAdentro.addEventListener('change', () => {
        // Ocultar/Mostrar la columna "Salida" según el checkbox
        colSalida.style.display = filtroAdentro.checked ? 'none' : 'table-cell';
        renderizarTabla();
    });
});

async function filtroFechaDia(){
    if(filtroSelect.value === "dia"){
        document.getElementById("rangoHoras").style.display  = 'flex'
        document.getElementById("rangoFecha").style.display = 'none'
    }else{
        document.getElementById("rangoHoras").style.display = 'none'
        document.getElementById("rangoFecha").style.display  = 'flex'
    }
}

// Llama al backend con la fecha seleccionada
async function obtenerDatosDelBackend() {
    const fecha = filtroFecha.value;
    if (!fecha) return;

    tablaBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Cargando registros...</td></tr>';

    try {
        const data = await apiRequest(`/api/recepcion/asistencia/historial/dia?fecha=${fecha}`, { token: getToken() });
        asistenciasDelDia = Array.isArray(data) ? data : [];
        renderizarTabla();
    } catch (error) {
        tablaBody.innerHTML = `<tr><td colspan="5" style="color: #ef9d89; text-align: center;">Error: ${error.message}</td></tr>`;
    }
}

// Filtra la data en memoria y dibuja la tabla
function renderizarTabla() {
    const terminoBusqueda = buscadorHistorial.value.toLowerCase().trim();
    const minHora = filtroHoraMin.value; // ej: "08:00"
    const maxHora = filtroHoraMax.value;
    const soloAdentro = filtroAdentro.checked;

    let filtrados = asistenciasDelDia.filter(asistencia => {
        // 1. Filtro Texto (Nombre o DNI)
        const matchTexto = asistencia.nombreCompleto.toLowerCase().includes(terminoBusqueda) ||
            asistencia.dni.toString().includes(terminoBusqueda);
        if (!matchTexto) return false;

        // 2. Filtro Solo Adentro (No tiene fechaHoraSalida)
        if (soloAdentro && asistencia.fechaHoraSalida) return false;

        // Extraer solo la parte de la hora "HH:MM" de la fecha de entrada
        const horaEntrada = extraerHora(asistencia.fechaHoraEntrada);

        // 3. Filtro Hora Mínima
        if (minHora && horaEntrada < minHora) return false;

        // 4. Filtro Hora Máxima
        if (maxHora && horaEntrada > maxHora) return false;

        return true;
    });

    dibujarFilas(filtrados);
}

function dibujarFilas(lista) {
    contadorVisibles.textContent = lista.length;
    tablaBody.innerHTML = '';

    if (lista.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--muted);">No hay accesos que coincidan con los filtros.</td></tr>';
        return;
    }

    lista.forEach((item, index) => {
        const horaIn = extraerHora(item.fechaHoraEntrada) || '--:--';
        const horaOut = extraerHora(item.fechaHoraSalida) || '--:--';

        const tr = document.createElement('tr');
        tr.className = 'row-clickable';
        // Guardamos el objeto completo en formato JSON dentro del atributo data para leerlo al hacer clic
        tr.dataset.info = JSON.stringify(item);

        tr.innerHTML = `
            <td><strong>${item.nombreCompleto}</strong></td>
            <td>${item.dni}</td>
            <td>
                ${item.modalidad || 'Sin Membresía'}
                ${item.ingresoSinMembresia ? '<span class="status-alert">Sin membresía vigente</span>' : ''}
                ${item.esAsistenciaExtra ? '<span class="status-alert" style="color:#eab308;">Día extra</span>' : ''}
            </td>
            <td><strong style="color: var(--lime);">${horaIn}</strong></td>
            <td style="display: ${filtroAdentro.checked ? 'none' : 'table-cell'};">
                <strong style="color: ${item.fechaHoraSalida ? '#a1a1aa' : 'var(--lime)'};">${item.fechaHoraSalida ? horaOut : 'EN GIMNASIO'}</strong>
            </td>
        `;

        tr.addEventListener('click', () => abrirModalDetalle(item));
        tablaBody.appendChild(tr);
    });
}

function abrirModalDetalle(item) {
    document.getElementById('detalleNombre').textContent = item.nombreCompleto + ' (' + item.modalidad + ')';

    const horaIn = extraerHora(item.fechaHoraEntrada);
    const horaOut = extraerHora(item.fechaHoraSalida);

    document.getElementById('detalleEntrada').textContent = horaIn;
    document.getElementById('detalleSalida').textContent = horaOut ? horaOut : 'Aún en el local';

    // Cálculo de Permanencia
    document.getElementById('detallePermanencia').textContent = calcularPermanencia(item.fechaHoraEntrada, item.fechaHoraSalida);

    // Alertas
    alertaMembresia.style.display = item.ingresoSinMembresia ? 'block' : 'none';
    alertaExtra.style.display = item.esAsistenciaExtra ? 'block' : 'none';
    contenedorAlertas.style.display = (item.ingresoSinMembresia || item.esAsistenciaExtra) ? 'block' : 'none';

    modal.showModal();
}

// Utilidad: Convierte "2024-03-25T14:30:00" en "14:30"
function extraerHora(fechaIso) {
    if (!fechaIso) return null;
    const dateObj = new Date(fechaIso);
    const horas = dateObj.getHours().toString().padStart(2, '0');
    const minutos = dateObj.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
}

// Utilidad: Calcula la diferencia entre dos fechas, si la salida es null, usa la hora actual
function calcularPermanencia(entradaIso, salidaIso) {
    if (!entradaIso) return '-';

    const inicio = new Date(entradaIso);
    const fin = salidaIso ? new Date(salidaIso) : new Date(); // Si no ha salido, calcula hasta "ahora"

    let diffMilisegundos = fin - inicio;

    if (diffMilisegundos < 0) return 'Error de reloj';

    const horas = Math.floor(diffMilisegundos / 1000 / 60 / 60);
    const minutos = Math.floor((diffMilisegundos / 1000 / 60) % 60);

    if (horas === 0) {
        return `${minutos} minutos`;
    }
    return `${horas} horas, ${minutos} minutos`;
}