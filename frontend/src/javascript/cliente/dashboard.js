import { apiRequest, getToken, clearToken } from '../api.js';

// Elementos DOM
const tabs = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');
const tabRutina = document.getElementById('tabRutina');
const formPerfil = document.getElementById('formPerfilCliente');
const fechaCalendario = document.getElementById('fechaCalendario');

// Datos cacheados
let idClienteActual = null;
let asignacionActiva = null;

document.addEventListener('DOMContentLoaded', async () => {
    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // Configurar el calendario en el día de hoy
    const hoy = new Date().toISOString().split('T')[0];
    fechaCalendario.value = hoy;
    actualizarNombreDia(hoy);

    // Lógica de Pestañas (Tabs)
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
        });
    });

    // Eventos
    formPerfil.addEventListener('submit', actualizarPerfil);
    fechaCalendario.addEventListener('change', (e) => {
        actualizarNombreDia(e.target.value);
        cargarEntrenamientoDelDia(e.target.value);
    });
    document.getElementById('btnCerrarSesion').addEventListener('click', () => {
        clearToken();
        window.location.href = '/login';
    });

    // Cargas iniciales
    await cargarDatosPerfil();
    await verificarRutinaAsignada();
});

// --- PERFIL ---
async function cargarDatosPerfil() {
    try {
        // Asumiendo que hay un endpoint para traer los datos del usuario logueado
        const perfil = await apiRequest('/api/cliente/perfil', { token: getToken() });
        idClienteActual = perfil.idUsuario;

        // Llenar formulario según la estructura de la base de datos de la imagen
        document.getElementById('nomApe').value = perfil.nomApe || '';
        document.getElementById('dniUs').value = perfil.dniUs || '';
        document.getElementById('fechaNacimiento').value = perfil.fechaNacimiento || '';
        document.getElementById('telUs').value = perfil.telUs || '';
        document.getElementById('mailUs').value = perfil.mailUs || '';
        document.getElementById('contacoE').value = perfil.contacoE || '';

    } catch (error) {
        console.error('Error al cargar perfil:', error);
    }
}

async function actualizarPerfil(e) {
    e.preventDefault();
    const status = document.getElementById('perfilStatus');
    status.textContent = 'Guardando...';
    status.style.color = '#555';

    const payload = {
        nomApe: document.getElementById('nomApe').value,
        fechaNacimiento: document.getElementById('fechaNacimiento').value,
        telUs: document.getElementById('telUs').value,
        mailUs: document.getElementById('mailUs').value,
        contacoE: document.getElementById('contacoE').value
    };

    try {
        await apiRequest('/api/cliente/perfil', {
            method: 'PUT',
            body: JSON.stringify(payload),
            token: getToken()
        });
        status.textContent = '¡Datos actualizados con éxito!';
        status.style.color = 'var(--lime)';
        setTimeout(() => status.textContent = '', 3000);
    } catch (error) {
        status.textContent = 'Error al actualizar.';
        status.style.color = 'red';
    }
}

// --- RUTINA Y CALENDARIO ---
async function verificarRutinaAsignada() {
    try {
        // Endpoint que devuelve la asignación de rutina activa del cliente
        asignacionActiva = await apiRequest('/api/cliente/rutina-activa', { token: getToken() });

        if (asignacionActiva && asignacionActiva.rutina) {
            // Si tiene rutina, mostramos la pestaña
            tabRutina.style.display = 'inline-block';
            // Cargamos la rutina para el día seleccionado en el calendario
            cargarEntrenamientoDelDia(fechaCalendario.value);
        }
    } catch (error) {
        console.warn('El cliente no tiene rutinas activas o hubo un error.');
    }
}

function actualizarNombreDia(fechaStr) {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    // Ajuste de zona horaria para que no se desfase el día
    const fecha = new Date(fechaStr + 'T12:00:00');
    document.getElementById('diaSemanaLabel').textContent = dias[fecha.getDay()];
}

async function cargarEntrenamientoDelDia(fechaStr) {
    const tabla = document.getElementById('tablaEjerciciosCliente');
    const badge = document.getElementById('estadoSesionBadge');
    tabla.innerHTML = '<tr><td colspan="4" style="text-align: center;">Cargando...</td></tr>';

    try {
        // 1. Consultar si EXISTE un historial de sesión REALIZADO para esta fecha exacta
        // (Reutilizando la lógica que usa el Coach para ver el historial)
        const historial = await apiRequest(`/api/cliente/historial-sesion?fecha=${fechaStr}`, { token: getToken() });

        if (historial && historial.ejerciciosRealizados && historial.ejerciciosRealizados.length > 0) {
            // EL CLIENTE ENTRENÓ ESTE DÍA (Renderizar datos reales)
            badge.textContent = 'Sesión Completada';
            badge.className = 'badge-completado';

            tabla.innerHTML = '';
            historial.ejerciciosRealizados.forEach(ej => {
                tabla.innerHTML += `
                    <tr>
                        <td><strong style="color: #166534;">${ej.nombreEjercicio}</strong></td>
                        <td>${ej.seriesRealizadas}</td>
                        <td>${ej.repsRealizadas}</td>
                        <td>${ej.pesoRealizado || '-'} kg</td>
                    </tr>
                `;
            });

        } else {
            // EL CLIENTE NO ENTRENÓ ESTE DÍA (Renderizar lo planificado según el día de la semana)
            badge.textContent = 'Planificado';
            badge.className = 'badge-planificado';

            const fecha = new Date(fechaStr + 'T12:00:00');
            const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const nombreDia = dias[fecha.getDay()];

            // Filtrar los detalles de la rutina activa para este día específico
            const ejerciciosDelDia = asignacionActiva.detalles.filter(d => d.diaSemana === nombreDia);

            if (ejerciciosDelDia.length === 0) {
                tabla.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #666;">Día de descanso. No hay ejercicios planificados.</td></tr>`;
            } else {
                tabla.innerHTML = '';
                ejerciciosDelDia.forEach(ej => {
                    const esfuerzoOPeso = ej.rangoPeso +" / " +ej.medidaEsfuerzo +" "+ej.cantMedida;
                    tabla.innerHTML += `
                        <tr>
                            <td><strong>${ej.nombreEjercicio}</strong></td>
                            <td>${ej.rangoSeries}</td>
                            <td>${ej.rangoRep}</td>
                            <td>${esfuerzoOPeso}</td>
                        </tr>
                    `;
                });
            }
        }
    } catch (error) {
        tabla.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red;">Error al cargar los datos.</td></tr>`;
        console.error(error);
    }
}