import { apiRequest, getToken } from '../api.js';
import { renderAdminLayout } from '../layout-admin.js';

const form = document.getElementById('formMembresia');
const btnSiguiente = document.getElementById('btnSiguiente');
const btnGuardarTipo = document.getElementById('btnGuardarTipo');
const btnFinalizar = document.getElementById('btnFinalizar');
let membresiaActualId = null;
let todasLasMembresias = [];

let idEstadoMembresiaSeleccionada = null;
let accionEstadoMembresia = null; // 'alta' o 'baja'
let idBajaTipoSeleccionado = null;

document.addEventListener('DOMContentLoaded', () => {
    renderAdminLayout('membresias');
    cargarMembresias();

});

// Reemplaza el evento 'click' de btnProcesarBajaTipo con este:
document.getElementById('btnProcesarBajaTipo').addEventListener('click', async () => {
    if (!idBajaTipoSeleccionado) return;

    try {
        const respuesta = await apiRequest(`/membresia/baja/${idBajaTipoSeleccionado}`, {
            method: 'DELETE',
            token: getToken()
        });

        // 1. Cerramos los modales
        document.getElementById('modalConfirmarBajaTipo').close();
        document.getElementById('modalDetalles').close();

        // 2. Notificamos éxito y recargamos
        alert(respuesta.message || "Tipo de membresía eliminado correctamente.");
        await cargarMembresias();

    } catch (error) {
        alert("Error al eliminar el tipo de membresía: " + error.message);
    }
});

// --- LÓGICA DE INTERFAZ REACTIVA ---
const selectDuracion = document.getElementById('duracion');
const selectDias = document.getElementById('diasAsistencia');
const chkPlanificacion = document.getElementById('planificacion');

function actualizarRestriccionesDuracion() {
    if (selectDuracion.value === '1') {
        // Es DIARIO: Bloqueamos días (a 1) y planificación (a false)
        selectDias.value = '1';
        selectDias.disabled = true;

        chkPlanificacion.checked = false;
        chkPlanificacion.disabled = true;
    } else {
        // Es MENSUAL: Habilitamos campos
        selectDias.disabled = false;
        chkPlanificacion.disabled = false;
    }
}

// Escuchar cambios en la lista desplegable
selectDuracion.addEventListener('change', actualizarRestriccionesDuracion);




// PASO 1: Crear la Membresía Base
btnSiguiente.addEventListener('click', async () => {
    const desc = document.getElementById('descMembresia').value;
    if (!desc) return alert("Ingresa la descripción de la membresía.");

    try {
        // En tu backend esto crea la membresía y devuelve su ID

        const res = await apiRequest('/membresia/registrar', {
            method: 'POST',
            body: JSON.stringify({idMembresia : 0,descripMembresia: desc}),
            token: getToken()
        });
        document.getElementById('tipoId').value = null;

        membresiaActualId = res.idMembresia;

        document.getElementById('descMembresia').disabled = true;
        document.getElementById('nombreMembresiaSeleccionada').textContent = desc;

        // Cambiar vista al Paso 2
        document.getElementById('pasoTipos').style.display = 'block';
        btnSiguiente.style.display = 'none';
        btnGuardarTipo.style.display = 'inline-flex';
        btnGuardarTipo.textContent = 'Guardar Tipo de Membresía';
        btnFinalizar.style.display = 'inline-flex';

        cargarMembresias();
    } catch (error) {
        alert("Error: " + error.message);
    }
});

// PASO 2: Agregar Tipo a la Membresía actual
btnGuardarTipo.addEventListener('click', async () => {
    // Verificamos si existe el tipoId (Si existe, es MODIFICACIÓN. Si no, es CREACIÓN)
    const idTipo = document.getElementById('tipoId').value;

    // Armamos el cuerpo del mensaje asegurando los nombres de variables que espera tu DTO
    const payload = {
        duracionDiaMes: parseInt(document.getElementById('duracion').value),
        diasAsistencia: parseInt(document.getElementById('diasAsistencia').value),
        costoMembresia: parseFloat(document.getElementById('costo').value),
        planificacion: document.getElementById('planificacion').checked
    };

    try {
        if (idTipo) {
            // ----- LÓGICA DE MODIFICACIÓN -----
            payload.idTipoMem = idTipo;

            await apiRequest('/membresia/tipo-membresia/modificar', {
                method: 'POST',
                body: JSON.stringify(payload),
                token: getToken()
            });
            alert("Tipo actualizado exitosamente.");
        } else {
            // ----- LÓGICA DE CREACIÓN (la que ya tenías) -----
            payload.idMembresia = membresiaActualId;


            await apiRequest('/membresia/tipo-membresia', {
                method: 'POST',
                body: JSON.stringify(payload),
                token: getToken()
            });
            alert("Tipo añadido exitosamente.");
        }

        // Limpiar el formulario solo de los campos del Tipo
        document.getElementById('tipoId').value = '';
        document.getElementById('diasAsistencia').value = '';
        document.getElementById('duracion').value = '';
        document.getElementById('costo').value = '';
        document.getElementById('planificacion').checked = false;

        // Restaurar estado del botón y título
        btnGuardarTipo.textContent = 'Guardar Tipo de Membresía';

        // Refrescar la tabla
        await cargarMembresias();

    } catch (error) {
        alert("Error: " + error.message);
    }
    document.getElementById('tipoId').value = '';
    document.getElementById('duracion').value = '30';
    document.getElementById('diasAsistencia').value = '3';
    document.getElementById('costo').value = '';
    document.getElementById('planificacion').checked = false;
    actualizarRestriccionesDuracion();
});

window.resetFormularioMembresia = () => {
    form.reset();
    document.getElementById('tipoId').value = null
    membresiaActualId = null;
    document.getElementById('pasoMembresia').style.display = 'block';
    document.getElementById('descMembresia').disabled = false;
    document.getElementById('pasoTipos').style.display = 'none';
    btnSiguiente.style.display = 'inline-flex';
    btnGuardarTipo.style.display = 'none';
    btnFinalizar.style.display = 'none';
};

async function cargarMembresias() {
    try {
        todasLasMembresias = await apiRequest('/membresia/listar', { token: getToken() });
        // Una vez que llegan los datos, llamamos a la función que dibuja
        window.renderizarTablaMembresias();
    } catch (error) {
        console.error("Error al cargar la tabla de membresías:", error);
    }
}

window.renderizarTablaMembresias = () => {
    const tbody = document.getElementById('tablaMembresias');
    const chkInactivos = document.getElementById('chkInactivos');
    const mostrarInactivos = chkInactivos ? chkInactivos.checked : false;

    // Filtramos la lista según el estado del checkbox
    const membresiasFiltradas = todasLasMembresias.filter(m => {
        if (mostrarInactivos) return true; // Si está marcado, mostramos todas
        return m.estado !== 'INACTIVO';    // Si no, ocultamos las inactivas
    });

    tbody.innerHTML = membresiasFiltradas.map(m => {
        const esInactiva = m.estado === 'INACTIVO';

        // Lógica para cambiar los botones si está INACTIVA
        let botonesAccion = '';
        if (esInactiva) {
            botonesAccion = `
                <button type="button" onclick="window.darAlta(${m.idMembresia})" style="padding: 4px 12px;">Dar Alta</button>
                <button type="button" onclick="window.verDetalles(${m.idMembresia})">Ver Tipos</button>
            `;
        } else {
            botonesAccion = `
                <button type="button" onclick="window.añadirTipo(${m.idMembresia}, '${m.descripMembresia}')">Añadir Tipo</button>
                <button type="button" onclick="window.verDetalles(${m.idMembresia})">Ver/Editar Tipos</button>
                
                <button type="button" class="is-danger" onclick="window.bajaLogica(${m.idMembresia})">Eliminar</button>
            `;
        }

        return `
            <tr>
                <td><strong style="${esInactiva ? 'color: var(--muted); text-decoration: line-through;' : ''}">${m.descripMembresia || 'Sin nombre'}</strong></td>
                <td><span class="permission-count">${m.tipos ? m.tipos.length : 0} opciones</span></td>
                <td>
                    <span class="role-label" style="${esInactiva ? 'background: #333; color: #aaa;' : ''}">
                        ${m.estado || 'ACTIVO'}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        ${botonesAccion}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

window.darAlta = (id) => {
    idEstadoMembresiaSeleccionada = id;
    accionEstadoMembresia = 'alta';
    document.getElementById('tituloEstadoMembresia').textContent = "Reactivar Membresía";
    document.getElementById('mensajeEstadoMembresia').textContent = "¿Deseas reactivar esta membresía para que vuelva a estar disponible en el sistema?";
    const btn = document.getElementById('btnProcesarEstadoMembresia');
    btn.textContent = "Reactivar";
    btn.className = "admin-primary-action"; // Botón verde
    document.getElementById('iconoEstadoMembresia').textContent = "✓";
    document.getElementById('iconoEstadoMembresia').style.color = "var(--lime)";
    document.getElementById('modalConfirmarEstadoMembresia').showModal();
};

window.modificarTipo = async ({tipoMem}) =>{

    document.getElementById('tipoId').value = tipoMem.value
    document.getElementById('diasAsistencia').value = tipoMem.diasAsistencia;
    document.getElementById('duracion').value = tipoMem.duracionDiaMes;
    document.getElementById('costo').value = tipoMem.costoMembresia;
    document.getElementById('planificacion').checked = tipoMem.planificacion;

    const payload = {
        idTipoMem : document.getElementById('tipoId').value,
        duracionDiaMes: document.getElementById('duracion').value,
        diasAsistencia: document.getElementById('diasAsistencia').value,
        planificacion: document.getElementById('planificacion').checked,
        costoMembresia: document.getElementById('costo').value

    };

    document.getElementById('nombreMembresiaSeleccionada').textContent = "";
    document.getElementById('descMembresia').disabled = true;
    document.getElementById('form-title').textContent = "Modificacion de plan"
    document.getElementById('pasoMembresia').style.display = 'none';
    // Cambiar vista al Paso 2
    document.getElementById('pasoTipos').style.display = 'block';
    btnSiguiente.style.display = 'none';
    btnGuardarTipo.style.display = 'inline-flex';
    btnFinalizar.style.display = 'inline-flex';

    await apiRequest('/membresia/tipo-membresia/modificar', {
        method: 'POST',
        body: JSON.stringify(payload),
        token: getToken()
    });

    cargarMembresias();


}

window.añadirTipo = async (idMembresia , descMembresia) =>{
    form.reset()
    membresiaActualId = idMembresia
    document.getElementById('tipoId').value = null;
    document.getElementById('nombreMembresiaSeleccionada').textContent = descMembresia;
    document.getElementById('descMembresia').disabled = true;
    document.getElementById('form-title').textContent = "Nuevo tipo de membresia"
    document.getElementById('pasoMembresia').style.display = 'none';
    // Cambiar vista al Paso 2
    document.getElementById('pasoTipos').style.display = 'block';
    btnSiguiente.style.display = 'none';
    btnGuardarTipo.style.display = 'inline-flex';
    btnGuardarTipo.textContent = 'Guardar Tipo de Membresía'
    btnFinalizar.style.display = 'inline-flex';

    cargarMembresias();
}

window.bajaLogica = (id) => {
    idEstadoMembresiaSeleccionada = id;
    accionEstadoMembresia = 'baja';
    document.getElementById('tituloEstadoMembresia').textContent = "Dar de baja Membresía";
    document.getElementById('mensajeEstadoMembresia').textContent = "¿Estás seguro de dar de baja esta membresía? Pasará a estado INACTIVO.";
    const btn = document.getElementById('btnProcesarEstadoMembresia');
    btn.textContent = "Dar de baja";
    btn.className = "admin-danger-action"; // Botón rojo
    document.getElementById('iconoEstadoMembresia').textContent = "!";
    document.getElementById('iconoEstadoMembresia').style.color = "#ef9d89";
    document.getElementById('modalConfirmarEstadoMembresia').showModal();
};

window.verDetalles = async (id) => {
    const modal = document.getElementById('modalDetalles');
    const tbody = document.getElementById('tablaTiposDetalle');

    const membresiaBase = todasLasMembresias.find(m => m.idMembresia === id);
    const descMembresiaBase = membresiaBase ? membresiaBase.descripMembresia : 'Membresía';

    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--muted);">Cargando detalles...</td></tr>';
    modal.showModal();

    try {
        const tipos = await apiRequest(`/membresia/tipo-membresia/${id}`, {
            method: 'GET',
            token: getToken()
        });

        if (!tipos || tipos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--muted);">No hay tipos registrados para esta membresía.</td></tr>';
            return;
        }

        tbody.innerHTML = tipos.map((tipo) => {
            const textoDuracion = tipo.duracionMembresia === 1 ? 'Diario' : 'Mensual';

            // Verificamos si el estado es inactivo (0 o false dependiendo de cómo serialice Java)
            const esInactivo = tipo.estado === 0 || tipo.estado === false;
            const estiloTexto = esInactivo ? 'color: var(--muted); text-decoration: line-through;' : '';

            // Renderizado condicional de los botones
            let botonesAccion = '';
            if (esInactivo) {
                botonesAccion = `<button type="button" class="admin-primary-action" onclick="window.altaTipo(${tipo.idTipoMem})" style="padding: 4px 12px;">Dar de Alta</button>`;
            } else {
                botonesAccion = `
                    <button type="button" onclick="prepararModificacionTipo('${descMembresiaBase}', ${tipo.idTipoMem}, ${tipo.diasAsistencia}, ${tipo.duracionMembresia}, ${tipo.costoMembresia}, ${tipo.planificacion})">Modificar</button>
                    <button type="button" class="is-danger" onclick="window.confirmarEliminarTipo('${descMembresiaBase}', ${tipo.idTipoMem}, ${tipo.duracionMembresia}, ${tipo.diasAsistencia}, ${tipo.planificacion}, ${tipo.costoMembresia})">Borrar</button>
                `;
            }

            return `
            <tr>
                <td><strong style="${estiloTexto}">${tipo.diasAsistencia} días</strong>/sem</td>
                <td style="${estiloTexto}">${textoDuracion}</td>
                <td style="${estiloTexto}">
                    <span style="color: ${tipo.planificacion ? 'var(--lime)' : 'inherit'};">
                        ${tipo.planificacion ? 'Incluida' : 'No'}
                    </span>
                </td>
                <td style="${estiloTexto}"><strong>$${tipo.costoMembresia}</strong></td>
                <td>
                    <div class="table-actions">
                        ${botonesAccion}
                    </div>
                </td>
            </tr>
            `;
        }).join('');
    } catch (error) {
        console.error("Error al cargar los tipos de membresía:", error);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: #ef9d89;">Error al obtener los datos: ${error.message}</td></tr>`;
    }
};

// Nueva función para abrir el modal genérico configurado para el Tipo de Membresía
window.altaTipo = (idTipo) => {
    idEstadoMembresiaSeleccionada = idTipo;
    accionEstadoMembresia = 'altaTipo'; // Identificador especial para diferenciar la URL

    document.getElementById('tituloEstadoMembresia').textContent = "Reactivar Plan";
    document.getElementById('mensajeEstadoMembresia').textContent = "¿Deseas reactivar este plan para que vuelva a estar disponible al registrar pagos?";

    const btn = document.getElementById('btnProcesarEstadoMembresia');
    btn.textContent = "Reactivar";
    btn.className = "admin-primary-action";

    document.getElementById('iconoEstadoMembresia').textContent = "✓";
    document.getElementById('iconoEstadoMembresia').style.color = "var(--lime)";

    document.getElementById('modalConfirmarEstadoMembresia').showModal();
};

// Reemplazo del evento genérico para que soporte tanto Membresías Base como Tipos de Membresía
document.getElementById('btnProcesarEstadoMembresia').addEventListener('click', async () => {
    if (!idEstadoMembresiaSeleccionada) return;

    try {
        let endpointUrl = '';
        let httpMethod = 'PUT';

        // Redirigimos la URL dependiendo de si es la base o el tipo
        if (accionEstadoMembresia === 'alta' || accionEstadoMembresia === 'baja') {
            endpointUrl = `/membresia/${idEstadoMembresiaSeleccionada}/${accionEstadoMembresia}`;
        } else if (accionEstadoMembresia === 'altaTipo') {
            endpointUrl = `/membresia/tipo-membresia/alta/${idEstadoMembresiaSeleccionada}`;
            httpMethod = 'PATCH'; // Usamos PATCH según tu controlador
        }

        const respuesta = await apiRequest(endpointUrl, {
            method: httpMethod,
            token: getToken()
        });

        document.getElementById('modalConfirmarEstadoMembresia').close();

        // Si fue una reactivación de un Tipo, cerramos la tabla de detalles para ver el refresco general
        if (accionEstadoMembresia === 'altaTipo') {
            document.getElementById('modalDetalles').close();
            alert(respuesta.message || "Tipo de membresía reactivado con éxito.");
        }

        await cargarMembresias();
    } catch (error) {
        alert("Error al procesar: " + error.message);
    }
});

// Función base (opcional) por si agregas el endpoint para borrar un tipo específico
window.confirmarEliminarTipo = (nombreMem, idTipo, duracion, dias, planificacion, costo) => {
    idBajaTipoSeleccionado = idTipo;

    // Rellenamos el modal con los detalles amigables
    document.getElementById('bajaTipoNombre').textContent = nombreMem;
    document.getElementById('bajaTipoDuracion').textContent = duracion === 1 ? 'Diario (1 día)' : 'Mensual (30 días)';
    document.getElementById('bajaTipoAsistencia').textContent = dias + ' días/sem';
    document.getElementById('bajaTipoPlanificacion').textContent = planificacion ? 'Sí' : 'No';
    document.getElementById('bajaTipoCosto').textContent = '$' + costo;

    // Abrimos el modal
    document.getElementById('modalConfirmarBajaTipo').showModal();
};



window.prepararModificacionTipo = (descMembresia, idTipoMem, diasAsistencia, duracionMembresia, costoMembresia, planificacion) => {
    document.getElementById('modalDetalles').close();

    // 1. Seteamos el nombre correcto recibido como parámetro
    document.getElementById('nombreMembresiaSeleccionada').textContent = descMembresia;

    document.getElementById('tipoId').value = idTipoMem;
    document.getElementById('duracion').value = duracionMembresia;
    document.getElementById('diasAsistencia').value = diasAsistencia;
    document.getElementById('costo').value = costoMembresia;
    document.getElementById('planificacion').checked = planificacion;

    actualizarRestriccionesDuracion();

    document.getElementById('pasoMembresia').style.display = 'none';
    document.getElementById('pasoTipos').style.display = 'block';

    // 2. Modificamos títulos y botones
    document.getElementById('form-title').textContent = "Modificación de plan";
    // (Línea eliminada aquí: ya no borramos nombreMembresiaSeleccionada)

    if (btnSiguiente) btnSiguiente.style.display = 'none';
    if (btnGuardarTipo) {
        btnGuardarTipo.style.display = 'inline-flex';
        btnGuardarTipo.textContent = 'Actualizar Tipo';
    }
    if (btnFinalizar) btnFinalizar.style.display = 'inline-flex';

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

document.getElementById('btnProcesarEstadoMembresia').addEventListener('click', async () => {
    if (!idEstadoMembresiaSeleccionada) return;
    try {
        await apiRequest(`/membresia/${idEstadoMembresiaSeleccionada}/${accionEstadoMembresia}`, {
            method: 'PUT',
            token: getToken()
        });
        document.getElementById('modalConfirmarEstadoMembresia').close();
        await cargarMembresias();
    } catch (error) {
        alert("Error al procesar: " + error.message);
    }
});


window.altaTipo = (idTipo) => {
    idEstadoMembresiaSeleccionada = idTipo;
    accionEstadoMembresia = 'altaTipo'; // Identificador especial para diferenciar la URL

    document.getElementById('tituloEstadoMembresia').textContent = "Reactivar Plan";
    document.getElementById('mensajeEstadoMembresia').textContent = "¿Deseas reactivar este plan para que vuelva a estar disponible al registrar pagos?";

    const btn = document.getElementById('btnProcesarEstadoMembresia');
    btn.textContent = "Reactivar";
    btn.className = "admin-primary-action";

    document.getElementById('iconoEstadoMembresia').textContent = "✓";
    document.getElementById('iconoEstadoMembresia').style.color = "var(--lime)";

    document.getElementById('modalConfirmarEstadoMembresia').showModal();
};

// Reemplazo del evento genérico para que soporte tanto Membresías Base como Tipos de Membresía
document.getElementById('btnProcesarEstadoMembresia').addEventListener('click', async () => {
    if (!idEstadoMembresiaSeleccionada) return;

    try {
        let endpointUrl = '';
        let httpMethod = 'PUT';

        // Redirigimos la URL dependiendo de si es la base o el tipo
        if (accionEstadoMembresia === 'alta' || accionEstadoMembresia === 'baja') {
            endpointUrl = `/membresia/${idEstadoMembresiaSeleccionada}/${accionEstadoMembresia}`;
        } else if (accionEstadoMembresia === 'altaTipo') {
            endpointUrl = `/membresia/tipo-membresia/alta/${idEstadoMembresiaSeleccionada}`;
            httpMethod = 'PATCH'; // Usamos PATCH según tu controlador
        }

        const respuesta = await apiRequest(endpointUrl, {
            method: httpMethod,
            token: getToken()
        });

        document.getElementById('modalConfirmarEstadoMembresia').close();

        // Si fue una reactivación de un Tipo, cerramos la tabla de detalles para ver el refresco general
        if (accionEstadoMembresia === 'altaTipo') {
            document.getElementById('modalDetalles').close();
            alert(respuesta.message || "Tipo de membresía reactivado con éxito.");
        }

        await cargarMembresias();
    } catch (error) {
        alert("Error al procesar: " + error.message);
    }
});