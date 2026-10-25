import { apiRequest, getToken } from '../api.js';
import { renderAdminLayout } from '../layout-admin.js';

const form = document.getElementById('formMembresia');
const btnSiguiente = document.getElementById('btnSiguiente');
const btnGuardarTipo = document.getElementById('btnGuardarTipo');
const btnFinalizar = document.getElementById('btnFinalizar');
let membresiaActualId = null;

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
    document.getElementById('descMembresia').disabled = false;
    document.getElementById('pasoTipos').style.display = 'none';
    btnSiguiente.style.display = 'inline-flex';
    btnGuardarTipo.style.display = 'none';
    btnFinalizar.style.display = 'none';
};

async function cargarMembresias() {
    try {
        // Asegúrate de que la ruta coincida con tu @RequestMapping + @GetMapping
        // Si tu controlador tiene @RequestMapping("/api/admin/membresias"), la ruta será:
        const membresias = await apiRequest('/membresia/listar', { token: getToken() });

        const tbody = document.getElementById('tablaMembresias');

        tbody.innerHTML = membresias.map(m => `
            <tr>
                <!-- Usamos descripMembresia tal como está en la entidad Java -->
                <td><strong>${m.descripMembresia || 'Sin nombre'}</strong></td>
                
                <!-- Verificamos si la lista de tipos existe para contarla -->
                <td><span class="permission-count">${m.tipos ? m.tipos.length : 0} opciones</span></td>
                
                <td><span class="role-label">${m.estado || 'ACTIVO'}</span></td>
                
                <td>
                    <div class="table-actions">
                        <!-- Pasamos el idMembresia -->
                        <button type="button" onclick="verDetalles(${m.idMembresia})">Ver/Editar Tipos</button>
                        <button type="button" class="is-danger" onclick="bajaLogica(${m.idMembresia})">Eliminar</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("Error al cargar la tabla de membresías:", error);
    }
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