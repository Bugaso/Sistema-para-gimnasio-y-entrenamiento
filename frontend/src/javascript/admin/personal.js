// Importamos el layout y la API subiendo un nivel (../)
import { renderAdminLayout } from '../layout-admin.js';
import { apiRequest, getToken, clearToken } from '../api.js';

const form = document.getElementById('formEmpleado');
const tabla = document.getElementById('tablaEmpleados');
const confirmDialog = document.getElementById('confirmDialog');
const inputBuscar = document.getElementById('inputBuscar');
const filtroRol = document.getElementById('filtroRol');
const cantResultados = document.getElementById('cantResultados');
const toast = document.getElementById('toast');
const contenedorRoles = document.getElementById('contenedorRoles');

let empleadosTotales = [];
let rolesDisponibles = [];
let idEliminarSeleccionado = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Renderizar la barra lateral y superior marcando "03 Personal"
    renderAdminLayout('personnel');

    const token = getToken();
    if (!token) {
        window.location.href = '/inicio-sesion.html';
        return;
    }

    // Eventos de filtros
    inputBuscar?.addEventListener('input', aplicarFiltros);
    filtroRol?.addEventListener('change', aplicarFiltros);

    // Modal Cancelar / Confirmar
    document.getElementById('btnCancelarModal')?.addEventListener('click', () => confirmDialog.close());
    document.getElementById('btnConfirmarEliminar')?.addEventListener('click', procesarEliminacion);

    // Cargar roles dinámicamente y luego la lista de empleados
    await cargarRoles();
    await cargarEmpleados();
});

// GET: Cargar roles desde /rol y generar los checkboxes dinámicamente
async function cargarRoles() {
    try {
        const token = getToken();
        rolesDisponibles = await apiRequest('/rol', { token });

        if (contenedorRoles) {
            if (rolesDisponibles.length === 0) {
                contenedorRoles.innerHTML = '<p style="color: var(--muted); padding: 12px;">No hay roles registrados.</p>';
                return;
            }

            contenedorRoles.innerHTML = rolesDisponibles.map(rol => `
                <label>
                    <input type="checkbox" name="roles" value="${rol.idRol}" />
                    <span>${rol.nomCatUs}</span>
                </label>
            `).join('');
        }

        if (filtroRol) {
            filtroRol.innerHTML = '<option value="">Todos los puestos</option>' +
                rolesDisponibles.map(rol => `<option value="${rol.idRol}">${rol.nomCatUs}</option>`).join('');
        }

    } catch (error) {
        console.error("Error al cargar roles:", error);
        if (contenedorRoles) {
            contenedorRoles.innerHTML = '<p style="color: #ef9d89; padding: 12px;">Error al obtener roles del servidor.</p>';
        }
    }
}

// GET: Cargar la lista de empleados desde el Backend
async function cargarEmpleados() {
    try {
        const token = getToken();
        empleadosTotales = await apiRequest('/api/admin/empleados', { token });
        aplicarFiltros();
    } catch (error) {
        mostrarToast("Error al obtener la lista de empleados: " + error.message);
    }
}

// Renderizar la tabla de empleados
function renderizarTabla(lista) {
    tabla.innerHTML = '';
    cantResultados.textContent = `${lista.length} registro(s)`;

    if (lista.length === 0) {
        tabla.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 28px; color: var(--muted);">No se encontraron empleados registrados.</td></tr>`;
        return;
    }

    lista.forEach(emp => {
        const tr = document.createElement('tr');
        const iniciales = emp.nomApe ? emp.nomApe.substring(0, 2).toUpperCase() : 'US';

        const nombresRoles = (emp.rolesIds || []).map(idRol => {
            const r = rolesDisponibles.find(item => item.idRol === idRol);
            return r ? r.nomCatUs : `Rol #${idRol}`;
        }).join(', ') || 'Sin rol';

        tr.innerHTML = `
            <td class="person-cell">
                <span class="person-avatar">${iniciales}</span>
                <div>
                    <strong>${emp.nomApe}</strong>
                    <small>${emp.mailUs}</small>
                </div>
            </td>
            <td>
                <span class="role-label">${nombresRoles}</span>
            </td>
            <td>
                <strong>${emp.telUs || '-'}</strong>
                <small>${emp.contacoE || 'Sin contacto emerg.'}</small>
            </td>
            <td>${emp.dniUs}</td>
            <td>
                <div class="table-actions">
                    <button type="button" data-edit="${emp.idUsuario}">Modificar</button>
                    <button type="button" class="is-danger" data-delete="${emp.idUsuario}">Eliminar</button>
                </div>
            </td>
        `;

        tr.querySelector(`[data-edit="${emp.idUsuario}"]`).addEventListener('click', () => prepararEdicion(emp));
        tr.querySelector(`[data-delete="${emp.idUsuario}"]`).addEventListener('click', () => abrirModalEliminar(emp.idUsuario));

        tabla.appendChild(tr);
    });
}

function aplicarFiltros() {
    const texto = inputBuscar.value.toLowerCase().trim();
    const rolFiltroId = filtroRol.value ? parseInt(filtroRol.value) : null;

    const filtrados = empleadosTotales.filter(emp => {
        const coincideTexto = emp.nomApe.toLowerCase().includes(texto) ||
            emp.mailUs.toLowerCase().includes(texto) ||
            emp.dniUs.includes(texto);

        const coincideRol = !rolFiltroId || (emp.rolesIds && emp.rolesIds.includes(rolFiltroId));

        return coincideTexto && coincideRol;
    });

    renderizarTabla(filtrados);
}

// POST / PUT: Guardar cambios
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusMsg = document.getElementById('formStatus');
    statusMsg.textContent = '';

    const id = document.getElementById('empId').value;
    const token = getToken();

    const checkboxes = document.querySelectorAll('input[name="roles"]:checked');
    const rolesIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

    if (rolesIds.length === 0) {
        statusMsg.textContent = "Debes seleccionar al menos un rol.";
        return;
    }

    const payload = {
        nomApe: document.getElementById('nomApe').value,
        dniUs: document.getElementById('dniUs').value,
        mailUs: document.getElementById('mailUs').value,
        telUs: document.getElementById('telUs').value,
        fechaNacimiento: document.getElementById('fechaNacimiento').value,
        rolesIds: rolesIds,
        contacoE: document.getElementById('contacoE').value,
        password: document.getElementById('password').value
    };

    try {
        if (id) {
            await apiRequest(`/api/admin/empleados/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
                token
            });
            mostrarToast("Empleado actualizado con éxito.");
        } else {
            await apiRequest('/api/admin/empleados', {
                method: 'POST',
                body: JSON.stringify(payload),
                token
            });
            mostrarToast("Empleado creado con éxito.");
        }

        window.resetearFormulario();
        await cargarEmpleados();
    } catch (error) {
        statusMsg.textContent = error.message;
    }
});

function prepararEdicion(emp) {
    document.getElementById('empId').value = emp.idUsuario;
    document.getElementById('nomApe').value = emp.nomApe;
    document.getElementById('dniUs').value = emp.dniUs;
    document.getElementById('mailUs').value = emp.mailUs;
    document.getElementById('telUs').value = emp.telUs || '';
    document.getElementById('fechaNacimiento').value = emp.fechaNacimiento;
    document.getElementById('contacoE').value = emp.contacoE || '';
    document.getElementById('password').value = '';

    document.querySelectorAll('input[name="roles"]').forEach(cb => cb.checked = false);
    if (emp.rolesIds && Array.isArray(emp.rolesIds)) {
        emp.rolesIds.forEach(idRol => {
            const cb = document.querySelector(`input[name="roles"][value="${idRol}"]`);
            if (cb) cb.checked = true;
        });
    }

    document.getElementById('form-kicker').textContent = "Edición de Registro";
    document.getElementById('form-title').textContent = `Modificando a ${emp.nomApe}`;
    document.getElementById('btnGuardar').textContent = "Actualizar Empleado";
    document.getElementById('btnCancelar').style.display = 'inline-flex';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.resetearFormulario = () => {
    form.reset();
    document.getElementById('empId').value = '';
    document.getElementById('formStatus').textContent = '';
    document.querySelectorAll('input[name="roles"]').forEach(cb => cb.checked = false);
    document.getElementById('form-kicker').textContent = "Nuevo Registro";
    document.getElementById('form-title').textContent = "Alta de Empleado";
    document.getElementById('btnGuardar').textContent = "Guardar Personal";
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
        await apiRequest(`/api/admin/empleados/${idEliminarSeleccionado}`, {
            method: 'DELETE',
            token
        });

        mostrarToast("Empleado eliminado correctamente.");
        confirmDialog.close();
        await cargarEmpleados();
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