import '../../css/index/index.css';
import '../../css/admin/admin.css';
import { apiRequest, getToken, clearToken } from '../api.js';

const form = document.getElementById('formRol');
const tabla = document.getElementById('tablaRoles');
const confirmDialog = document.getElementById('confirmDialog');
const inputBuscar = document.getElementById('inputBuscar');
const cantResultados = document.getElementById('cantResultados');
const toast = document.getElementById('toast');

let rolesTotales = [];
let idEliminarSeleccionado = null;

document.addEventListener('DOMContentLoaded', async () => {
    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // Logout
    document.querySelector('[data-logout]')?.addEventListener('click', () => {
        clearToken();
        window.location.href = '/login';
    });

    // Filtro de búsqueda
    inputBuscar?.addEventListener('input', aplicarFiltros);

    // Modal cancelar / confirmar
    document.getElementById('btnCancelarModal')?.addEventListener('click', () => confirmDialog.close());
    document.getElementById('btnConfirmarEliminar')?.addEventListener('click', procesarEliminacion);

    await cargarRoles();
});

// GET: Cargar la lista de roles
async function cargarRoles() {
    try {
        const token = getToken();
        rolesTotales = await apiRequest('/api/admin/roles', { token });
        aplicarFiltros();
    } catch (error) {
        mostrarToast("Error al obtener la lista de roles: " + error.message);
    }
}

function esActivo(estado){
    if(estado){
        return "Activo"
    }
    else return "Inactivo"
}

// Renderizar filas en la tabla
function renderizarTabla(lista) {
    tabla.innerHTML = '';
    cantResultados.textContent = `${lista.length} registro(s)`;

    if (lista.length === 0) {
        tabla.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 28px; color: var(--muted);">No se encontraron roles registrados.</td></tr>`;
        return;
    }

    lista.forEach(rol => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>#${rol.idRol}</td>
            <td><strong>${rol.nomCatUs}</strong></td>
            <td><span class="permission-count">${esActivo(rol.estado)}
        </span></td>
            <td>
                <div class="table-actions">
                    <button type="button" data-edit="${rol.idRol}">Modificar</button>
                    <button type="button" class="is-danger" data-delete="${rol.idRol}">Eliminar</button>
                </div>
            </td>
        `;

        tr.querySelector(`[data-edit="${rol.idRol}"]`).addEventListener('click', () => prepararEdicion(rol));
        tr.querySelector(`[data-delete="${rol.idRol}"]`).addEventListener('click', () => abrirModalEliminar(rol.idRol));

        tabla.appendChild(tr);
    });
}

function aplicarFiltros() {
    const texto = inputBuscar.value.toLowerCase().trim();
    const filtrados = rolesTotales.filter(rol => rol.nomCatUs.toLowerCase().includes(texto));
    renderizarTabla(filtrados);
}

// POST / PUT: Guardar
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusMsg = document.getElementById('formStatus');
    statusMsg.textContent = '';

    const id = document.getElementById('rolId').value;
    const token = getToken();

    const payload = {
        nomCatUs: document.getElementById('nomCatUs').value,
        //tipoPermiso: 2
        //document.getElementById('tipoPermiso').value
    };

    try {
        if (id) {
            await apiRequest(`/api/admin/roles/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
                token
            });
            mostrarToast("Rol actualizado con éxito.");
        } else {
            await apiRequest('/api/admin/roles', {
                method: 'POST',
                body: JSON.stringify(payload),
                token
            });
            mostrarToast("Rol creado con éxito.");
        }

        window.resetearFormulario();
        await cargarRoles();
    } catch (error) {
        statusMsg.textContent = error.message;
    }
});

function prepararEdicion(rol) {
    document.getElementById('rolId').value = rol.idRol;
    document.getElementById('nomCatUs').value = rol.nomCatUs;
   // document.getElementById('tipoPermiso').value = rol.tipoPermiso || '';

    document.getElementById('form-kicker').textContent = "Edición de Rol";
    document.getElementById('form-title').textContent = `Modificando: ${rol.nomCatUs}`;
    document.getElementById('btnGuardar').textContent = "Actualizar Rol";
    document.getElementById('btnCancelar').style.display = 'inline-flex';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.resetearFormulario = () => {
    form.reset();
    document.getElementById('rolId').value = '';
    document.getElementById('formStatus').textContent = '';
    document.getElementById('form-kicker').textContent = "Nuevo Rol";
    document.getElementById('form-title').textContent = "Crear Categoria de Rol";
    document.getElementById('btnGuardar').textContent = "Guardar Rol";
    document.getElementById('btnCancelar').style.display = 'none';
};

function abrirModalEliminar(id) {
    idEliminarSeleccionado = id;
    confirmDialog.showModal();
}

async function procesarEliminacion() {
    if (!idEliminarSeleccionado) return;

    try {
        const token = getToken();
        await apiRequest(`/api/admin/roles/${idEliminarSeleccionado}`, {
            method: 'DELETE',
            token
        });

        mostrarToast("Rol eliminado correctamente.");
        confirmDialog.close();
        await cargarRoles();
    } catch (error) {
        mostrarToast("Error al eliminar: " + error.message);
    } finally {
        idEliminarSeleccionado = null;
    }
}

function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.hidden = false;
    setTimeout(() => { toast.hidden = true; }, 3500);
}



/****************************/
//Dinamico
import { renderAdminLayout } from '../layout-admin.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Renderiza la barra lateral y activa la pestaña "02 Roles"
    renderAdminLayout('roles');

    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // Inicialización del resto de tu lógica para roles...
    await cargarRoles();
});