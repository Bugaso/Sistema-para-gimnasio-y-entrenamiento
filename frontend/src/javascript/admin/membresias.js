import { apiRequest, getToken } from '../api.js';
import { renderAdminLayout } from '../layout-admin.js';

const form = document.getElementById('formMembresia');
const btnSiguiente = document.getElementById('btnSiguiente');
const btnGuardarTipo = document.getElementById('btnGuardarTipo');
const btnFinalizar = document.getElementById('btnFinalizar');
let membresiaActualId = null;
let todasLasMembresias = [];

document.addEventListener('DOMContentLoaded', () => {
    renderAdminLayout('membresias');
    cargarMembresias();
});



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

        membresiaActualId = res.idMembresia;
        document.getElementById('descMembresia').disabled = true;
        document.getElementById('nombreMembresiaSeleccionada').textContent = desc;

        // Cambiar vista al Paso 2
        document.getElementById('pasoTipos').style.display = 'block';
        btnSiguiente.style.display = 'none';
        btnGuardarTipo.style.display = 'inline-flex';
        btnFinalizar.style.display = 'inline-flex';

        cargarMembresias();
    } catch (error) {
        alert("Error: " + error.message);
    }
});

// PASO 2: Agregar Tipo a la Membresía actual
btnGuardarTipo.addEventListener('click', async () => {
    const payload = {
        idMembresia: membresiaActualId,
        duracionDiaMes: document.getElementById('duracion').value,
        diasAsistencia: document.getElementById('diasAsistencia').value,
        planificacion: document.getElementById('planificacion').checked,
        costoMembresia: document.getElementById('costo').value

    };

    try {
        await apiRequest('/membresia/tipo-membresia', {
            method: 'POST',
            body: JSON.stringify(payload),
            token: getToken()
        });
        alert("Tipo añadido exitosamente.");

        // Limpiar solo los campos del tipo
        document.getElementById('diasAsistencia').value = '';
        document.getElementById('duracion').value = '';
        document.getElementById('costo').value = '';
        document.getElementById('planificacion').checked = false;

        cargarMembresias();
    } catch (error) {
        alert("Error: " + error.message);
    }
});

window.resetFormularioMembresia = () => {
    form.reset();
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

window.darAlta = async (id) => {
    if(confirm("¿Deseas reactivar esta membresía?")) {
        try {
            // Asegúrate de crear este endpoint en tu controlador Java (similiar al de baja)
            await apiRequest(`/membresia/${id}/alta`, {
                method: 'PUT',
                token: getToken()
            });

            // Recargamos la lista actualizada desde el backend
            await cargarMembresias();
        } catch (error) {
            alert("Error al dar de alta: " + error.message);
        }
    }
};

window.añadirTipo = async (idMembresia , descMembresia) =>{
    membresiaActualId = idMembresia
    document.getElementById('nombreMembresiaSeleccionada').textContent = descMembresia;
    document.getElementById('descMembresia').disabled = true;
    document.getElementById('form-title').textContent = "Nuevo tipo de membresia"
    document.getElementById('pasoMembresia').style.display = 'none';
    // Cambiar vista al Paso 2
    document.getElementById('pasoTipos').style.display = 'block';
    btnSiguiente.style.display = 'none';
    btnGuardarTipo.style.display = 'inline-flex';
    btnFinalizar.style.display = 'inline-flex';

    cargarMembresias();
}

window.bajaLogica = async (id) => {
    if(confirm("¿Dar de baja esta membresía?")) {
        await apiRequest(`/membresia/${id}/baja`, { method: 'PUT', token: getToken() });
        cargarMembresias();
    }
};

window.verDetalles = async (id) => {
    const modal = document.getElementById('modalDetalles');
    const tbody = document.getElementById('tablaTiposDetalle');

    // 1. Mostrar estado de carga y abrir modal
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--muted);">Cargando detalles...</td></tr>';
    modal.showModal();

    try {
        // 2. Consumir el endpoint que trae los TipoMembresiaResponse
        const tipos = await apiRequest(`/membresia/tipo-membresia/${id}`, {
            method: 'GET',
            token: getToken()
        });

        // 3. Renderizar los resultados
        if (!tipos || tipos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--muted);">No hay tipos registrados para esta membresía.</td></tr>';
            return;
        }

        tbody.innerHTML = tipos.map(tipo => `
            <tr>
                <td><strong>${tipo.diasAsistencia} días</strong>/sem</td>
                <td>${tipo.duracionMembresia} días</td>
                <td>
                    <span style="color: ${tipo.planificacion ? 'var(--lime)' : 'inherit'};">
                        ${tipo.planificacion ? 'Incluida' : 'No'}
                    </span>
                </td>
                <td><strong>$${tipo.costoMembresia}</strong></td>
                <td>
                    <div class="table-actions">
                        <!-- Aquí puedes agregar a futuro la función para eliminar o editar un tipo específico -->
                        <button type="button" class="is-danger" onclick="eliminarTipo(${tipo.idTipoMem})">Borrar</button>
                    </div>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error("Error al cargar los tipos de membresía:", error);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: #ef9d89;">Error al obtener los datos: ${error.message}</td></tr>`;
    }
};

// Función base (opcional) por si agregas el endpoint para borrar un tipo específico
window.eliminarTipo = async (idTipo) => {
    if(confirm("¿Estás seguro de eliminar este tipo de membresía?")) {
        try {
            // Ejemplo de llamada (requerirá su propio endpoint DELETE en el backend)
            const mens = await apiRequest(`/membresia/baja/${idTipo}`, { method: 'DELETE', token: getToken() });

            if(mes == "Eliminacion exitosa"){
                const modal = document.getElementById('modalDetalles');
                modal.hidden
            }

            // Si el borrado es exitoso, debes cerrar el modal o recargar sus datos.
        } catch (error) {
            alert("Error al eliminar: " + error.message);
        }
    }
};