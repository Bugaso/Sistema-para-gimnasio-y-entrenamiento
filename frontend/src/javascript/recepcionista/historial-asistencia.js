import { apiRequest, getToken } from '../api.js';
import { renderRecepcionLayout } from './layout-recepcionista.js'; // Ajusta la ruta a tu layout

// Elementos del DOM
const filtroFecha = document.getElementById('filtroFecha');
const filtroFechaMax = document.getElementById('filtroFechaFin');
const filtroHoraMin = document.getElementById('filtroHoraMin');
const filtroHoraMax = document.getElementById('filtroHoraMax');
const filtroAdentro = document.getElementById('filtroAdentro');

const buscadorHistorial = document.getElementById('buscadorHistorial');
const tablaBody = document.getElementById('tablaHistorialAsistencia');
const contadorVisibles = document.getElementById('contadorVisibles');
const filtroSelect = document.getElementById('selectorFiltro');

// Encabezados para el ordenamiento
const thNombre = document.getElementById('thNombre');
const thEntrada = document.getElementById('thEntrada');
const colSalida = document.getElementById('colSalida');

// Modal Elements
const modal = document.getElementById('modalDetalleAsistencia');
const contenedorAlertas = document.getElementById('contenedorAlertas');
const alertaMembresia = document.getElementById('alertaMembresia');
const alertaExtra = document.getElementById('alertaExtra');

let asistenciasDelDia = []; // Almacena los datos originales traídos del backend
let ordenActual = { columna: null, ascendente: true }; // Controla el estado del ordenamiento

document.addEventListener('DOMContentLoaded', async () => {
    renderRecepcionLayout('historial_asistencia');
    if (!getToken()) { window.location.href = '/login'; return; }

    // Setear la fecha de hoy por defecto
    const hoy = new Date();
    // Formato YYYY-MM-DD considerando la zona horaria local
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
    filtroFecha.value = localISOTime;
    filtroFechaMax.value = localISOTime;

    // Cargar datos iniciales
    await obtenerDatosDelBackend();

    filtroSelect.addEventListener('change', filtroFechaDia)

    // Eventos que disparan una nueva llamada al backend
    filtroFecha.addEventListener('change', obtenerDatosDelBackend);
    filtroFechaMax.addEventListener('change', obtenerDatosDelBackend);

    // Eventos que disparan filtros locales (instantáneos)
    buscadorHistorial.addEventListener('input', renderizarTabla);
    filtroHoraMin.addEventListener('change', renderizarTabla);
    filtroHoraMax.addEventListener('change', renderizarTabla);

    // Eventos de ordenamiento al hacer clic en los encabezados
    if (thNombre) thNombre.addEventListener('click', () => cambiarOrden('nombre'));
    if (thEntrada) thEntrada.addEventListener('click', () => cambiarOrden('entrada'));
    if (colSalida) colSalida.addEventListener('click', () => cambiarOrden('salida'));

    filtroFechaDia();
    filtroAdentro.addEventListener('change', () => {
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
    const fechaFin = filtroFechaMax.value;
    if (!fecha || !fechaFin) return;

    tablaBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Cargando registros...</td></tr>';

    try {
        let data;
        if(filtroSelect.value === "dia"){
            data = await apiRequest(`/api/recepcion/asistencia/historial/dia?fecha=${fecha}`, { token: getToken() });
        }else{
            data = await apiRequest(`/api/recepcion/asistencia/historial/fecha?fechaInicio=${fecha}&fechaFin=${fechaFin}`, { token: getToken() });
        }

        asistenciasDelDia = Array.isArray(data) ? data : [];
        renderizarTabla();
    } catch (error) {
        tablaBody.innerHTML = `<tr><td colspan="5" style="color: #ef9d89; text-align: center;">Error: ${error.message}</td></tr>`;
    }
}

// Función para actualizar el estado del ordenamiento y los íconos visuales
function cambiarOrden(columna) {
    if (ordenActual.columna === columna) {
        ordenActual.ascendente = !ordenActual.ascendente; // Invierte el orden si es la misma columna
    } else {
        ordenActual.columna = columna;
        ordenActual.ascendente = true; // Por defecto arranca de menor a mayor al cambiar de columna
    }

    // Limpiar íconos
    document.querySelectorAll('.sort-icon').forEach(icon => icon.textContent = '');

    // Dibujar la flechita correspondiente
    const icono = ordenActual.ascendente ? ' ▲' : ' ▼';
    if (ordenActual.columna === 'nombre' && thNombre) thNombre.querySelector('.sort-icon').textContent = icono;
    if (ordenActual.columna === 'entrada' && thEntrada) thEntrada.querySelector('.sort-icon').textContent = icono;
    if (ordenActual.columna === 'salida' && colSalida) colSalida.querySelector('.sort-icon').textContent = icono;

    renderizarTabla();
}

// Filtra, ordena y dibuja la tabla
function renderizarTabla() {
    const terminoBusqueda = buscadorHistorial.value.toLowerCase().trim();
    const minHora = filtroHoraMin.value;
    const maxHora = filtroHoraMax.value;
    const soloAdentro = filtroAdentro.checked;

    // 1. Aplicar Filtros
    let filtrados = asistenciasDelDia.filter(asistencia => {
        const matchTexto = asistencia.nombreCompleto.toLowerCase().includes(terminoBusqueda) ||
            asistencia.dni.toString().includes(terminoBusqueda);
        if (!matchTexto) return false;
        if (soloAdentro && asistencia.fechaHoraSalida) return false;

        const horaEntrada = extraerHora(asistencia.fechaHoraEntrada);
        if (minHora && horaEntrada < minHora) return false;
        if (maxHora && horaEntrada > maxHora) return false;

        return true;
    });

    // 2. Aplicar Ordenamiento
    if (ordenActual.columna) {
        filtrados.sort((a, b) => {
            let valorA, valorB;

            if (ordenActual.columna === 'nombre') {
                valorA = a.nombreCompleto.toLowerCase();
                valorB = b.nombreCompleto.toLowerCase();
            } else if (ordenActual.columna === 'entrada') {
                valorA = new Date(a.fechaHoraEntrada).getTime();
                valorB = new Date(b.fechaHoraEntrada).getTime();
            } else if (ordenActual.columna === 'salida') {
                // Si la salida es nula (aún en el gym), se manda al final de la lista
                valorA = a.fechaHoraSalida ? new Date(a.fechaHoraSalida).getTime() : (ordenActual.ascendente ? Infinity : -Infinity);
                valorB = b.fechaHoraSalida ? new Date(b.fechaHoraSalida).getTime() : (ordenActual.ascendente ? Infinity : -Infinity);
            }

            if (valorA < valorB) return ordenActual.ascendente ? -1 : 1;
            if (valorA > valorB) return ordenActual.ascendente ? 1 : -1;
            return 0;
        });
    }

    dibujarFilas(filtrados);
}

function dibujarFilas(lista) {
    contadorVisibles.textContent = lista.length;
    tablaBody.innerHTML = '';

    if (lista.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--muted);">No hay accesos que coincidan con los filtros.</td></tr>';
        return;
    }

    lista.forEach((item) => {
        let horaIn;
        let horaOut;
        if(filtroSelect.value === "dia"){
            horaIn = extraerHora(item.fechaHoraEntrada) || '--:--';
            horaOut = extraerHora(item.fechaHoraSalida) || '--:--';
        }else{
            horaIn = extraerFecha(item.fechaHoraEntrada) + " " + extraerHora(item.fechaHoraEntrada);
            horaOut = extraerFecha(item.fechaHoraSalida) + " " + extraerHora(item.fechaHoraSalida);
        }

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

function extraerFecha(fechaIso){
    if(!fechaIso) return null;
    const dateObj = new Date(fechaIso);
    return dateObj.toLocaleDateString();
}

function calcularPermanencia(entradaIso, salidaIso) {
    if (!entradaIso) return '-';

    const inicio = new Date(entradaIso);
    const fin = salidaIso ? new Date(salidaIso) : new Date();

    let diffMilisegundos = fin - inicio;
    if (diffMilisegundos < 0) return 'Error de reloj';

    const horas = Math.floor(diffMilisegundos / 1000 / 60 / 60);
    const minutos = Math.floor((diffMilisegundos / 1000 / 60) % 60);

    if (horas === 0) {
        return `${minutos} minutos`;
    }
    return `${horas} horas, ${minutos} minutos`;
}