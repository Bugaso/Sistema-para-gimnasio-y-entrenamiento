import { apiRequest, getToken, clearToken } from '../api.js';
import { renderAdminLayout } from '../layout-admin.js';

const form = document.getElementById('formEquipamiento');
const tabla = document.getElementById('tablaEquipamiento');
const confirmDialog = document.getElementById('confirmDialog');
const inputBuscar = document.getElementById('inputBuscar');
const cantResultados = document.getElementById('cantResultados');
const toast = document.getElementById('toast');

let equipamientosTotales = [];
let idEliminarSeleccionado = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Renderizamos el layout
    renderAdminLayout('equipamiento');

    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }

    inputBuscar?.addEventListener('input', aplicarFiltros);
    document.getElementById('btnCancelarModal')?.addEventListener('click', () => confirmDialog.close());
    document.getElementById('btnConfirmarEliminar')?.addEventListener('click', procesarEliminacion);

    await cargarEquipamientos();
});

// GET
async function cargarEquipamientos() {
    try {
        const token = getToken();
        equipamientosTotales = await apiRequest('/api/admin/equipamiento', { token });
        aplicarFiltros();
    } catch (error) {
        mostrarToast("Error al cargar: " + error.message);
    }
}

function renderizarTabla(lista) {
    tabla.innerHTML = '';
    cantResultados.textContent = `${lista.length} registro(s)`;

    if (lista.length === 0) {
        tabla.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 28px; color: var(--muted);">No se encontraron equipamientos.</td></tr>`;
        return;
    }

    lista.forEach(equip => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${equip.idEquipamiento}</td>
            <td><strong>${equip.nomEquipamiento}</strong></td>
            <td>
                <div class="table-actions">
                    <button type="button" data-edit="${equip.idEquipamiento}">Modificar</button>
                    <button type="button" class="is-danger" data-delete="${equip.idEquipamiento}">Eliminar</button>
                </div>
            </td>
        `;

        tr.querySelector(`[data-edit="${equip.idEquipamiento}"]`).addEventListener('click', () => prepararEdicion(equip));
        tr.querySelector(`[data-delete="${equip.idEquipamiento}"]`).addEventListener('click', () => abrirModalEliminar(equip.idEquipamiento));
        tabla.appendChild(tr);
    });
}

function aplicarFiltros() {
    const texto = inputBuscar.value.toLowerCase().trim();
    const filtrados = equipamientosTotales.filter(equip =>
        equip.nomEquipamiento.toLowerCase().includes(texto)
    );
    renderizarTabla(filtrados);
}

// POST / PUT
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusMsg = document.getElementById('formStatus');
    statusMsg.textContent = '';

    const id = document.getElementById('idEquipamiento').value;
    const token = getToken();
    const payload = { nomEquipamiento: document.getElementById('nomEquipamiento').value };

    try {
        if (id) {
            await apiRequest(`/api/admin/equipamiento/${id}`, {
                method: 'PUT', body: JSON.stringify(payload), token
            });
            mostrarToast("Equipamiento actualizado con éxito.");
        } else {
            await apiRequest('/api/admin/equipamiento', {
                method: 'POST', body: JSON.stringify(payload), token
            });
            mostrarToast("Equipamiento creado con éxito.");
        }

        window.resetearFormulario();
        await cargarEquipamientos();
    } catch (error) {
        statusMsg.textContent = error.message;
    }
});

function prepararEdicion(equip) {
    document.getElementById('idEquipamiento').value = equip.idEquipamiento;
    document.getElementById('nomEquipamiento').value = equip.nomEquipamiento;

    document.getElementById('form-kicker').textContent = "Edición de Registro";
    document.getElementById('form-title').textContent = `Modificando: ${equip.nomEquipamiento}`;
    document.getElementById('btnGuardar').textContent = "Actualizar Equipamiento";
    document.getElementById('btnCancelar').style.display = 'inline-flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.resetearFormulario = () => {
    form.reset();
    document.getElementById('idEquipamiento').value = '';
    document.getElementById('formStatus').textContent = '';
    document.getElementById('form-kicker').textContent = "Nuevo Registro";
    document.getElementById('form-title').textContent = "Crear Equipamiento";
    document.getElementById('btnGuardar').textContent = "Guardar Equipamiento";
    document.getElementById('btnCancelar').style.display = 'none';
};

// DELETE
function abrirModalEliminar(id) {
    idEliminarSeleccionado = id;
    confirmDialog.showModal();
}

async function procesarEliminacion() {
    if (!idEliminarSeleccionado) return;

    try {
        const token = getToken();
        await apiRequest(`/api/admin/equipamiento/${idEliminarSeleccionado}`, {
            method: 'DELETE', token
        });

        mostrarToast("Equipamiento eliminado.");
        confirmDialog.close();
        await cargarEquipamientos();
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