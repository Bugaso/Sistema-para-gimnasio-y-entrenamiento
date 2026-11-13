import { apiRequest, getToken, clearToken } from '../api.js';
import {cargarHistorialPagosCliente} from "./historial-pagos.js";

// Elementos DOM
const tabs = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');
const tabRutina = document.getElementById('tabRutina');
const formPerfil = document.getElementById('formPerfilCliente');
const fechaCalendario = document.getElementById('fechaCalendario');
const selectDiaSemanaManual = document.getElementById('selectDiaSemanaManual');
const contenedorEjerciciosCliente = document.getElementById('contenedorEjerciciosCliente');
const formSesionCliente = document.getElementById('formSesionCliente');
const botonGuardarSesionContainer = document.getElementById('botonGuardarSesionContainer');

const selectorRutinaDia = document.getElementById('selectorRutinaDia');
const infoRutinaSeleccionada = document.getElementById('infoRutinaSeleccionada');

let idClienteActual = null;
let asignacionesActivas = [];

const diasArray = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

document.addEventListener('DOMContentLoaded', async () => {
    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // Fecha del dispositivo local ajustada
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
    fechaCalendario.value = localISOTime;

    // Autoseleccionar el dia de la semana que es hoy
    const numeroDia = new Date(localISOTime + 'T12:00:00').getDay();
    selectDiaSemanaManual.value = diasArray[numeroDia];

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
        });
    });

    formPerfil.addEventListener('submit', actualizarPerfil);

    // El cambio de fecha fuerza a actualizar el select del dia (por comodidad) pero se puede cambiar manualmente
    fechaCalendario.addEventListener('change', (e) => {
        const d = new Date(e.target.value + 'T12:00:00').getDay();
        selectDiaSemanaManual.value = diasArray[d];
        cargarEntrenamiento();
    });

    selectDiaSemanaManual.addEventListener('change', cargarEntrenamiento);

    document.getElementById('btnCerrarSesion').addEventListener('click', () => {
        clearToken();
        window.location.href = '/login';
    });

    formSesionCliente.addEventListener('submit', guardarSesionCliente);

    await cargarDatosPerfil();
    await verificarRutinaAsignada();
    await cargarHistorialPagosCliente();
});

// --- PERFIL ---
async function cargarDatosPerfil() {
    try {
        const perfil = await apiRequest('/api/cliente/perfil', { token: getToken() });
        idClienteActual = perfil.idUsuario;

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
        await apiRequest('/api/cliente/perfil', { method: 'PUT', body: JSON.stringify(payload), token: getToken() });
        status.textContent = '¡Datos actualizados con éxito!';
        status.style.color = 'var(--lime)';
        setTimeout(() => status.textContent = '', 3000);
    } catch (error) {
        status.textContent = 'Error al actualizar.';
        status.style.color = 'red';
    }
}

// Actualiza el método que pide las rutinas al backend
async function verificarRutinaAsignada() {
    try {
        asignacionesActivas = await apiRequest('/api/cliente/rutina-activa', { token: getToken() });

        // Verificamos que sea un array y tenga elementos
        if (asignacionesActivas && asignacionesActivas.length > 0) {
            tabRutina.style.display = 'inline-block';
            cargarEntrenamiento();
        }
    } catch (error) {
        console.warn('El cliente no tiene rutinas activas o hubo un error.');
    }
}

async function cargarEntrenamiento() {
    const fechaStr = fechaCalendario.value;
    const diaPlanificado = selectDiaSemanaManual.value;

    contenedorEjerciciosCliente.innerHTML = '<p style="text-align:center; margin-top:20px;">Cargando...</p>';
    botonGuardarSesionContainer.style.display = 'none';
    const badge = document.getElementById('estadoSesionBadge');

    selectorRutinaDia.innerHTML = '';
    infoRutinaSeleccionada.style.display = 'none';

    try {
        const respuestaHistorial = await apiRequest(`/api/cliente/historial-sesion?fecha=${fechaStr}`, { token: getToken() });
        //console.log(respuestaHistorial);
        let opcionesDisponibles = [];

        // Creamos un Set para almacenar los IDs de las rutinas que YA fueron completadas hoy
        const rutinasCompletadasIds = new Set();

        // 1. Agregar Rutinas Completadas
        if (respuestaHistorial && respuestaHistorial.length > 0) {
            respuestaHistorial.forEach((sesion) => {
                // Guardamos el ID para usarlo como filtro después
                rutinasCompletadasIds.add(sesion.idCliCou);
                //console.log(sesion.idCliCou);
                opcionesDisponibles.push({
                    idCliCou : sesion.idCliCou,
                    tipo: 'completada',
                    titulo: `${sesion.nomRutina} (Completada)`,
                    fechaRegistro: sesion.fechaRegistro,
                    coach: sesion.nomCoach,
                    ejercicios: sesion.ejercicios || [],
                    idRutina: sesion.idRutina
                });
                //console.log(opcionesDisponibles);
            });
        }

        // 2. Agregar TODAS las Planificadas del Día seleccionado (Filtrando las ya completadas)
        if (asignacionesActivas && asignacionesActivas.length > 0) {
            asignacionesActivas.forEach((asignacion) => {


                // NUEVO FILTRO: Si la rutina ya está en el Set de completadas, no la mostramos como planificada
                if (rutinasCompletadasIds.has(asignacion.idCliCou)) {

                    return; // Saltamos a la siguiente iteración
                }

                const ejerciciosDelDia = asignacion.detalles.filter(d => d.diaSemana === diaPlanificado);

                if (ejerciciosDelDia.length > 0) {
                    opcionesDisponibles.push({
                        idCliCou: asignacion.idCliCou,
                        tipo: 'planificada',
                        titulo: `${asignacion.rutina.nombreRutina} (Planificada - ${diaPlanificado})`,
                        diaSemana: diaPlanificado,
                        ejercicios: ejerciciosDelDia,
                        idRutina: asignacion.rutina.idRutina
                    });
                }
            });
        }

        // Si no hay nada planificado ni completado
        if (opcionesDisponibles.length === 0) {
            selectorRutinaDia.innerHTML = '<option value="">Sin Rutinas</option>';
            badge.textContent = 'Libre';
            badge.className = 'badge-planificado';
            contenedorEjerciciosCliente.innerHTML = `<p style="text-align:center; color:#666; margin-top:20px;">Día de descanso. No hay ejercicios planificados ni completados para este día.</p>`;
            return;
        }

        // Volcar las opciones al selector HTML

        let i = 0;
        let opt;
        while(i < opcionesDisponibles.length){
            opt = opcionesDisponibles[i];
            const option = document.createElement('option');
            option.value = opt.idCliCou;
            option.textContent = opt.titulo;
            selectorRutinaDia.appendChild(option);
            //console.log(opt.idCliCou)
            i++;
        }



        infoRutinaSeleccionada.style.display = 'inline-block';

        const actualizarVistaHistorial = (index) => {
            //console.log("Supuesto id clicou pasado por selector"+index)

            let sesion = opcionesDisponibles.filter(value =>
                value.idCliCou == index
            ).at(0);


            //console.log(sesion);

            if (sesion.tipo === 'completada') {
                badge.textContent = 'Sesión Completada';
                badge.className = 'badge-completado';
                infoRutinaSeleccionada.textContent = `Día de Registro: ${sesion.fechaRegistro} | Coach Asignado: ${sesion.coach || 'N/A'}`;

                renderizarTarjetas(sesion.ejercicios, true);
            } else {
                badge.textContent = 'Planificado';
                badge.className = 'badge-planificado';
                infoRutinaSeleccionada.textContent = `Rutina del día: ${sesion.diaSemana}`;
                renderizarTarjetas(sesion.ejercicios, false);
            }
        };
        //Obtiene el valor de la opcion seleccionada en la lista de rutinas
        selectorRutinaDia.onchange = (e) => actualizarVistaHistorial(e.target.valueOf().value);
        actualizarVistaHistorial(opcionesDisponibles[0].idCliCou);

    } catch (error) {
        contenedorEjerciciosCliente.innerHTML = `<p style="text-align: center; color: red;">Error al cargar los datos.</p>`;
        console.error(error);
    }
}



// 3. Crear las tablas dinámicas de registro (Estilo Coach)
function renderizarTarjetas(ejercicios, esCompletado) {
    contenedorEjerciciosCliente.innerHTML = '';

    if (!esCompletado) {
        botonGuardarSesionContainer.style.display = 'block';
    } else {
        botonGuardarSesionContainer.style.display = 'none';
    }

    ejercicios.forEach((ej, index) => {
        let seriesSugeridas = 1;

        if (!esCompletado) {
            const match = ej.rangoSeries ? ej.rangoSeries.match(/\d+/) : null;
            if (match) seriesSugeridas = parseInt(match[0]);
        }

        const card = document.createElement('div');
        card.className = 'ejercicio-card';

        card.innerHTML = `
            <div class="ejercicio-titulo">
                <h3 style="margin:0;">${ej.nombreEjercicio}</h3>
                <button type="button" class="btn-ver-video" data-id="${ej.idEjercicio}" data-nombre="${ej.nombreEjercicio}">Ver Video</button>
                ${!esCompletado ? `<button type="button" class="admin-primary-action btn-add-serie" data-index="${index}" style="min-height:36px; font-size:0.7rem; padding: 0 14px;">+ Añadir Serie</button>` : ''}
            </div>
            
            <div class="video-container" id="video-container-${index}"></div>
            
            <div class="info-planificada">
                <strong>Planificado:</strong> ${ej.rangoSeries || '-'} Series | ${ej.rangoRep || '-'} Reps | Peso: ${ej.rangoPeso || '-'} | Esfuerzo: ${ej.medidaEsfuerzo || '-'}: ${ej.cantMedida || '-'}
            </div>
            
            <div class="admin-table-wrap">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th style="width: 80px;">Serie</th>
                            <th>Reps</th>
                            <th>Peso (kg)</th>
                            <th>Esfuerzo</th>
                            <th>Cant.</th>
                            <th>Tiempo (seg)</th>
                            ${!esCompletado ? '<th>Acción</th>' : ''}
                        </tr>
                    </thead>
                    <tbody id="tbody-cli-ej-${index}">
                    </tbody>
                </table>
            </div>
        `;
        contenedorEjerciciosCliente.appendChild(card);

        // Lógica del Video
        const btnVideo = card.querySelector('.btn-ver-video');
        const videoContainer = card.querySelector(`#video-container-${index}`);

        btnVideo.addEventListener('click', async () => {
            if (videoContainer.classList.contains('active')) {
                videoContainer.classList.remove('active');
                videoContainer.innerHTML = '';
                btnVideo.textContent = 'Ver Video';
                btnVideo.style.background = 'transparent';
                btnVideo.style.color = '#6b7270';
            } else {
                try {
                    const data = await apiRequest(`/api/cliente/ejercicio/${ej.nombreEjercicio}`, { token: getToken() });
                    if (data && data.dirImgEjercicio && data.dirImgEjercicio.includes("youtube.com")) {
                        const videoId = new URL(data.dirImgEjercicio).searchParams.get("v");
                        videoContainer.innerHTML = `
                            <iframe src="https://www.youtube.com/embed/${videoId}" 
                                    title="Tutorial ${ej.nombreEjercicio}" frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen>
                            </iframe>`;
                    } else {
                        videoContainer.innerHTML = `<p style="padding: 20px; text-align: center; color: #666; background: #e5e7eb; border-radius: 8px;">No hay video tutorial válido.</p>`;
                    }
                } catch (err) {
                    videoContainer.innerHTML = `<p style="padding: 20px; text-align: center; color: #666; background: #e5e7eb; border-radius: 8px;">Error al cargar video.</p>`;
                }

                videoContainer.classList.add('active');
                btnVideo.textContent = 'Cerrar Video';
                btnVideo.style.background = '#6b7270';
                btnVideo.style.color = 'white';
            }
        });

        const tbody = document.getElementById(`tbody-cli-ej-${index}`);

        if (!esCompletado) {
            // MODO REGISTRO
            const agregarFila = (nroSerie) => {
                const tr = document.createElement('tr');
                tr.dataset.idejercicio = ej.idEjercicio;
                tr.innerHTML = `
                    <td style="text-align:center;"><strong>${nroSerie}</strong></td>
                    <td><input type="number" class="table-input rep-val" placeholder="Ej: 12" required /></td>
                    <td><input type="number" step="0.5" class="table-input pes-val" placeholder="Ej: 20" /></td>
                    <td>
                        <select class="table-input esf-tipo">
                            <option value="">N/A</option>
                            <option value="RIR" ${ej.medidaEsfuerzo === 'RIR' ? 'selected' : ''}>RIR</option>
                            <option value="RPE" ${ej.medidaEsfuerzo === 'RPE' ? 'selected' : ''}>RPE</option>
                        </select>
                    </td>
                    <td><input type="number" class="table-input esf-cant" placeholder="Ej: 2" /></td>
                    <td><input type="number" class="table-input tiem-val" placeholder="Ej: 45" /></td>
                    <td><button type="button" class="is-danger remove-serie">X</button></td>
                `;
                tr.querySelector('.remove-serie').addEventListener('click', () => {
                    tr.remove();
                    actualizarNumerosSerie(tbody);
                });
                tbody.appendChild(tr);
            };

            for (let i = 1; i <= seriesSugeridas; i++) {
                agregarFila(i);
            }

            card.querySelector('.btn-add-serie').addEventListener('click', () => {
                const numActuales = tbody.querySelectorAll('tr').length;
                agregarFila(numActuales + 1);
            });

        } else {
            // MODO LECTURA
            if (ej.seriesRealizadas && ej.seriesRealizadas.length > 0) {
                ej.seriesRealizadas.forEach((serie, i) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                            <td style="text-align:center;"><strong>${serie.nroSerie || (i + 1)}</strong></td>
                            <td><strong style="color:var(--lime);">${serie.nroRepeticiones || '-'}</strong></td>
                            <td><strong>${serie.nroPeso || '-'}</strong></td>
                            <td>${serie.medidaEsfuerzo || '-'}</td>
                            <td>${serie.cantMedida || '-'}</td>
                            <td>${serie.tiempoSegundos || '-'}</td>
                        `;
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#666;">No hay series registradas</td></tr>`;
            }
        }
    });
}

function actualizarNumerosSerie(tbody) {
    const filas = tbody.querySelectorAll('tr');
    filas.forEach((fila, i) => {
        fila.querySelector('td strong').textContent = i + 1;
    });
}

// 4. Guardar Sesión Cliente (POST)
async function guardarSesionCliente(e) {
    e.preventDefault();
    const status = document.getElementById('registroStatus');
    const fecha = document.getElementById('fechaCalendario').value;

    const seriesData = [];
    const filasTotales = document.querySelectorAll('tbody tr');

    filasTotales.forEach(fila => {
        const idEj = fila.dataset.idejercicio;
        const nroSerie = parseInt(fila.querySelector('td strong').textContent);
        const reps = fila.querySelector('.rep-val').value;
        const peso = fila.querySelector('.pes-val').value;
        const esfTipo = fila.querySelector('.esf-tipo').value;
        const esfCant = fila.querySelector('.esf-cant').value;
        const tiem = fila.querySelector('.tiem-val').value;

        if (reps || peso || tiem) {
            seriesData.push({
                idEjercicio: parseInt(idEj),
                nroSerie: nroSerie,
                nroRepeticiones: reps ? parseInt(reps) : null,
                nroPeso: peso ? parseFloat(peso) : null,
                medidaEsfuerzo: esfTipo ? esfTipo : null,
                cantMedida: esfCant ? parseInt(esfCant) : null,
                tiempoSegundos: tiem ? parseInt(tiem) : null
            });
        }
    });

    if (seriesData.length === 0) {
        status.textContent = "Debes registrar datos en al menos una serie.";
        return;
    }

    status.textContent = 'Guardando...';

    // Recuperamos el índice de la opción seleccionada en el select visual
    const selectorIndice = document.getElementById('selectorRutinaDia').value;

    // De tu array global de 'opcionesDisponibles' que creaste en 'cargarEntrenamiento()',
    // pero como 'opcionesDisponibles' era local, necesitas recuperar la asignación seleccionada.
    // Una forma sencilla es leer un data-attribute que le pongas al <select>, o buscarlo en el DOM,
    // o hacer la variable 'opcionesDisponibles' global let opcionesDelDia = [];

    // Para no reestructurar todo tu archivo, el idCliCou ya está dentro de 'asignacionesActivas'
    // Como tu select value es el 'index', debes asegurarte de enviarle el idCliCou correcto.
    // ASUMO QUE LA RUTINA A GUARDAR ES LA ÚNICA O LA SELECCIONADA EN ESE MOMENTO:
    const idAsignacion = selectorIndice; // <- AJUSTAR según cómo manejes la selección de rutina

    const payload = {
        idCliCou: idAsignacion,
        fechaRegistro: fecha,
        series: seriesData
    };

    try {
        await apiRequest('/api/cliente/historial/registrar', {
            method: 'POST',
            body: JSON.stringify(payload),
            token: getToken()
        });

        mostrarToast('¡Sesión registrada correctamente!');
        status.textContent = '';
        setTimeout(() => cargarEntrenamiento(), 1500);

    } catch (error) {
        status.textContent = error.message;
    }
}

