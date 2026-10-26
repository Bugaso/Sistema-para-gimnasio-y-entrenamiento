import { apiRequest, getToken } from '../api.js';
import { renderRecepcionLayout } from './layout-recepcionista.js';

const form = document.getElementById('formHistorial');
const tabla = document.getElementById('tablaHistoriales');
const confirmDialog = document.getElementById('confirmDialog');
const inputBuscar = document.getElementById('inputBuscar');
const selectCliente = document.getElementById('idUsuario');
const cantResultados = document.getElementById('cantResultados');
const toast = document.getElementById('toast');

let historialesTotales = [];
let idEliminarSeleccionado = null;

document.addEventListener('DOMContentLoaded', async () => {
    renderRecepcionLayout('historial_medico');

    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }

    inputBuscar?.addEventListener('input', aplicarFiltros);
    document.getElementById('btnCancelarModal')?.addEventListener('click', () => confirmDialog.close());
    document.getElementById('btnConfirmarEliminar')?.addEventListener('click', procesarEliminacion);

    await cargarClientes();
    await cargarHistoriales();
});

// Suponiendo que tienes un endpoint para obtener clientes activos
async function cargarClientes() {
    try {
        const token = getToken();
        // Ajusta esta ruta a tu endpoint real de clientes/usuarios
        const clientes = await apiRequest('/api/usuarios/clientes', { token });
        let opciones = '<option value="">Seleccione un cliente...</option>';
        clientes.forEach(c => {
            opciones += `<option value="${c.idUsuario}">${c.dniUs} - ${c.nomApe}</option>`;
        });
        selectCliente.innerHTML = opciones;
    } catch (error) { console.error("Error cargando clientes"); }
}

async function cargarHistoriales() {
    try {
        const token = getToken();
        historialesTotales = await apiRequest('/api/recepcion/historial-medico', { token });
        aplicarFiltros();
    } catch (error) {
        mostrarToast("Error al cargar: " + error.message);
    }
}

function renderizarTabla(lista) {
    tabla.innerHTML = '';
    cantResultados.textContent = `${lista.length} registro(s)`;

    if (lista.length === 0) {
        tabla.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 28px; color: var(--muted);">No se encontraron historiales.</td></tr>`;
        return;
    }

    lista.forEach(hm => {
        const tr = document.createElement('tr');
        const fechaFormat = hm.fechaRegHMed ? hm.fechaRegHMed.split('-').reverse().join('/') : '-';

        tr.innerHTML = `
            <td>#${hm.idHMedico}</td>
            <td>
                <strong>${hm.nombreUsuario}</strong>
                <small>DNI: ${hm.dniUsuario}</small>
            </td>
            <td>${hm.alturaHReg}m / ${hm.pesoHReg}kg</td>
            <td><span class="role-label">${hm.condMed}</span></td>
            <td>${fechaFormat}</td>
            <td>
                <div class="table-actions">
                    <button type="button" data-edit="${hm.idHMedico}">Modificar</button>
                    <button type="button" class="is-danger" data-delete="${hm.idHMedico}">Eliminar</button>
                </div>
            </td>
        `;

        tr.querySelector(`[data-edit="${hm.idHMedico}"]`).addEventListener('click', () => prepararEdicion(hm));
        tr.querySelector(`[data-delete="${hm.idHMedico}"]`).addEventListener('click', () => abrirModalEliminar(hm.idHMedico));
        tabla.appendChild(tr);
    });
}

//Funcion para el momento de registrar un historial medico
function aplicarFiltros() {
    const texto = inputBuscar.value.toLowerCase().trim();

    const filtrados = historialesTotales.filter(hm => {
        // Convertimos a String por seguridad para evitar el error si llega como número
        const dniStr = hm.dniUsuario ? String(hm.dniUsuario).toLowerCase() : "";
        const nombreStr = hm.nombreUsuario ? String(hm.nombreUsuario).toLowerCase() : "";

        return dniStr.includes(texto) || nombreStr.includes(texto);
    });

    renderizarTabla(filtrados);
}

// POST / PUT
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusMsg = document.getElementById('formStatus');
    statusMsg.textContent = '';

    const id = document.getElementById('idHMedico').value;
    const token = getToken();

    const payload = {
        idUsuario: parseInt(selectCliente.value),
        alturaHReg: parseFloat(document.getElementById('alturaHReg').value),
        pesoHReg: parseFloat(document.getElementById('pesoHReg').value),
        condMed: document.getElementById('condMed').value.trim(),
        descHMed: document.getElementById('descHMed').value.trim()
    };

    try {
        if (id) {
            await apiRequest(`/api/recepcion/historial-medico/${id}`, {
                method: 'PUT', body: JSON.stringify(payload), token
            });
            mostrarToast("Expediente actualizado con éxito.");
        } else {
            await apiRequest('/api/recepcion/historial-medico', {
                method: 'POST', body: JSON.stringify(payload), token
            });
            mostrarToast("Expediente registrado con éxito.");
        }

        window.resetearFormulario();
        await cargarHistoriales();
    } catch (error) {
        statusMsg.textContent = error.message;
    }
});

function prepararEdicion(hm) {
    document.getElementById('idHMedico').value = hm.idHMedico;
    selectCliente.value = hm.idUsuario;
    selectCliente.disabled = true; // No se permite cambiar el cliente del expediente

    document.getElementById('alturaHReg').value = hm.alturaHReg;
    document.getElementById('pesoHReg').value = hm.pesoHReg;
    document.getElementById('condMed').value = hm.condMed;
    document.getElementById('descHMed').value = hm.descHMed;

    document.getElementById('form-kicker').textContent = "Edición de Registro";
    document.getElementById('form-title').textContent = `Modificando Expediente #${hm.idHMedico}`;
    document.getElementById('btnGuardar').textContent = "Actualizar Expediente";
    document.getElementById('btnCancelar').style.display = 'inline-flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.resetearFormulario = () => {
    form.reset();
    document.getElementById('idHMedico').value = '';
    selectCliente.disabled = false;
    document.getElementById('formStatus').textContent = '';
    document.getElementById('form-kicker').textContent = "Nuevo Expediente";
    document.getElementById('form-title').textContent = "Registrar Historial";
    document.getElementById('btnGuardar').textContent = "Guardar Expediente";
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
        await apiRequest(`/api/recepcion/historial-medico/${idEliminarSeleccionado}`, {
            method: 'DELETE', token
        });
        mostrarToast("Expediente eliminado.");
        confirmDialog.close();
        await cargarHistoriales();
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

