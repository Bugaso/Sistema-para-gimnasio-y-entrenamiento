import { apiRequest, getToken, clearToken } from './api.js';

const form = document.getElementById('formEmpleado');
const tabla = document.getElementById('tablaEmpleados');
const confirmDialog = document.getElementById('confirmDialog');
const inputBuscar = document.getElementById('inputBuscar');
const filtroRol = document.getElementById('filtroRol');
const cantResultados = document.getElementById('cantResultados');
const toast = document.getElementById('toast');

let empleadosTotales = [];
let idEliminarSeleccionado = null;

document.addEventListener('DOMContentLoaded', async () => {
    const token = getToken();
    if (!token) {
        window.location.href = '/inicio-sesion.html';
        return;
    }

    // Botón Logout
    document.querySelector('[data-logout]')?.addEventListener('click', () => {
        clearToken();
        window.location.href = '/inicio-sesion.html';
    });

    // Filtros
    inputBuscar?.addEventListener('input', aplicarFiltros);
    filtroRol?.addEventListener('change', aplicarFiltros);

    // Modal Cancelar
    document.getElementById('btnCancelarModal')?.addEventListener('click', () => {
        confirmDialog.close();
    });

    // Confirmar eliminación
    document.getElementById('btnConfirmarEliminar')?.addEventListener('click', procesarEliminacion);

    await cargarEmpleados();
});

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

// Renderizar filas en la tabla
function renderizarTabla(lista) {
    tabla.innerHTML = '';
    cantResultados.textContent = `${lista.length} registro(s)`;

    if (lista.length === 0) {
        tabla.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 28px; color: var(--muted);">No se encontraron empleados registrados.</td></tr>`;
        return;
    }

    lista.forEach(emp => {
        const tr = document.createElement('tr');
        const esCoach = emp.idRol === 3;
        const rolTexto = esCoach ? 'Coach' : 'Recepcionista';
        const iniciales = emp.nomApe ? emp.nomApe.substring(0, 2).toUpperCase() : 'US';

        tr.innerHTML = `
            <td class="person-cell">
                <span class="person-avatar">${iniciales}</span>
                <div>
                    <strong>${emp.nomApe}</strong>
                    <small>${emp.mailUs}</small>
                </div>
            </td>
            <td>
                <span class="role-label">${rolTexto}</span>
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

// Filtrar la tabla localmente por búsqueda y rol
function aplicarFiltros() {
    const texto = inputBuscar.value.toLowerCase().trim();
    const rol = filtroRol.value;

    const filtrados = empleadosTotales.filter(emp => {
        const coincideTexto = emp.nomApe.toLowerCase().includes(texto) ||
            emp.mailUs.toLowerCase().includes(texto) ||
            emp.dniUs.includes(texto);
        const coincideRol = rol === "" || emp.idRol === parseInt(rol);
        return coincideTexto && coincideRol;
    });

    renderizarTabla(filtrados);
}

// POST / PUT: Guardar cambios del formulario
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusMsg = document.getElementById('formStatus');
    statusMsg.textContent = '';

    const id = document.getElementById('empId').value;
    const token = getToken();

    const payload = {
        nomApe: document.getElementById('nomApe').value,
        dniUs: document.getElementById('dniUs').value,
        mailUs: document.getElementById('mailUs').value,
        telUs: document.getElementById('telUs').value,
        fechaNacimiento: document.getElementById('fechaNacimiento').value,
        idRol: parseInt(document.getElementById('idRol').value),
        contacoE: document.getElementById('contacoE').value,
        password: document.getElementById('password').value
    };

    try {
        if (id) {
            // Edición (PUT)
            await apiRequest(`/api/admin/empleados/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
                token
            });
            mostrarToast("Empleado actualizado con éxito.");
        } else {
            // Alta (POST)
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

// Pasar datos del empleado seleccionado al formulario para Modificar
function prepararEdicion(emp) {
    document.getElementById('empId').value = emp.idUsuario;
    document.getElementById('nomApe').value = emp.nomApe;
    document.getElementById('dniUs').value = emp.dniUs;
    document.getElementById('mailUs').value = emp.mailUs;
    document.getElementById('telUs').value = emp.telUs || '';
    document.getElementById('fechaNacimiento').value = emp.fechaNacimiento;
    document.getElementById('idRol').value = emp.idRol;
    document.getElementById('contacoE').value = emp.contacoE || '';
    document.getElementById('password').value = '';

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
    document.getElementById('form-kicker').textContent = "Nuevo Registro";
    document.getElementById('form-title').textContent = "Alta de Empleado";
    document.getElementById('btnGuardar').textContent = "Guardar Personal";
    document.getElementById('btnCancelar').style.display = 'none';
};

// DELETE: Procesar eliminación
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