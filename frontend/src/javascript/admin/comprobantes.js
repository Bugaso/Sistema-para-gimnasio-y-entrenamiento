import { apiRequest, getToken, clearToken } from '../api.js';
import { renderAdminLayout } from '../layout-admin.js';

const form = document.getElementById('formComprobante');
const tabla = document.getElementById('tablaComprobantes');
const confirmDialog = document.getElementById('confirmDialog');
const inputBuscar = document.getElementById('inputBuscar');
const selectCategoria = document.getElementById('idCatGasto');
const filtroCategoria = document.getElementById('filtroCategoria');
const cantResultados = document.getElementById('cantResultados');
const toast = document.getElementById('toast');

let comprobantesTotales = [];
let idEliminarSeleccionado = null;

// Formateador de moneda (Pesos o Dólares)
const formateadorMoneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

document.addEventListener('DOMContentLoaded', async () => {
    renderAdminLayout('comprobantes');

    const token = getToken();
    if (!token) {
        window.location.href = '/inicio-sesion.html';
        return;
    }

    inputBuscar?.addEventListener('input', aplicarFiltros);
    filtroCategoria?.addEventListener('change', aplicarFiltros);
    document.getElementById('btnCancelarModal')?.addEventListener('click', () => confirmDialog.close());
    document.getElementById('btnConfirmarEliminar')?.addEventListener('click', procesarEliminacion);

    await cargarCategorias();
    await cargarComprobantes();
});

// GET CATEGORIAS (Para el Select)
async function cargarCategorias() {
    try {
        const token = getToken();
        const categorias = await apiRequest('/api/admin/categorias-gastos', { token });

        let opciones = '<option value="">Selecciona una categoría...</option>';
        let opcionesFiltro = '<option value="">Todas las Categorías</option>';

        categorias.forEach(cat => {
            opciones += `<option value="${cat.idCategoriaGasto}">${cat.nombreCatGasto}</option>`;
            opcionesFiltro += `<option value="${cat.idCategoriaGasto}">${cat.nombreCatGasto}</option>`;
        });

        selectCategoria.innerHTML = opciones;
        filtroCategoria.innerHTML = opcionesFiltro;
    } catch (error) {
        console.error("Error al cargar categorías de gastos");
    }
}

// GET COMPROBANTES
async function cargarComprobantes() {
    try {
        const token = getToken();
        comprobantesTotales = await apiRequest('/api/admin/comprobantes', { token });
        aplicarFiltros();
    } catch (error) {
        mostrarToast("Error al cargar: " + error.message);
    }
}

function renderizarTabla(lista) {
    tabla.innerHTML = '';
    cantResultados.textContent = `${lista.length} registro(s)`;

    if (lista.length === 0) {
        tabla.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 28px; color: var(--muted);">No se encontraron comprobantes.</td></tr>`;
        return;
    }

    lista.forEach(comp => {
        const tr = document.createElement('tr');

        // Clase dinámica para el estado
        let colorEstado = '';
        if(comp.estado === 'Pagado') colorEstado = 'color: var(--lime);';
        if(comp.estado === 'Anulado') colorEstado = 'color: var(--danger); text-decoration: line-through;';

        // Invertimos el formato de fecha para mostrar DD-MM-YYYY
        const fechaFormat = comp.fechaDelComprobante ? comp.fechaDelComprobante.split('-').reverse().join('-') : '-';

        tr.innerHTML = `
            <td><strong>${comp.descripcionGasto}</strong></td>
            <td><span class="role-label">${comp.nombreCatGasto}</span></td>
            <td>${fechaFormat}</td>
            <td><strong>${formateadorMoneda.format(comp.monto)}</strong></td>
            <td style="${colorEstado}">${comp.estado}</td>
            <td>
                <div class="table-actions">
                    <button type="button" data-edit="${comp.idComprobante}">Modificar</button>
                    <button type="button" class="is-danger" data-delete="${comp.idComprobante}">Eliminar</button>
                </div>
            </td>
        `;

        tr.querySelector(`[data-edit="${comp.idComprobante}"]`).addEventListener('click', () => prepararEdicion(comp));
        tr.querySelector(`[data-delete="${comp.idComprobante}"]`).addEventListener('click', () => abrirModalEliminar(comp.idComprobante));
        tabla.appendChild(tr);
    });
}

function aplicarFiltros() {
    const texto = inputBuscar.value.toLowerCase().trim();
    const catFiltro = filtroCategoria.value ? parseInt(filtroCategoria.value) : null;

    const filtrados = comprobantesTotales.filter(comp => {
        const coincideTexto = comp.descripcionGasto.toLowerCase().includes(texto);
        const coincideCat = !catFiltro || comp.idCatGasto === catFiltro;
        return coincideTexto && coincideCat;
    });
    renderizarTabla(filtrados);
}

// POST / PUT
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusMsg = document.getElementById('formStatus');
    statusMsg.textContent = '';

    const id = document.getElementById('idComprobante').value;
    const token = getToken();

    const payload = {
        idCatGasto: parseInt(selectCategoria.value),
        descripcionGasto: document.getElementById('descripcionGasto').value.trim(),
        fechaDelComprobante: document.getElementById('fechaDelComprobante').value,
        monto: parseFloat(document.getElementById('monto').value),
        estado: document.getElementById('estado').value
    };

    try {
        if (id) {
            await apiRequest(`/api/admin/comprobantes/${id}`, {
                method: 'PUT', body: JSON.stringify(payload), token
            });
            mostrarToast("Comprobante actualizado con éxito.");
        } else {
            await apiRequest('/api/admin/comprobantes', {
                method: 'POST', body: JSON.stringify(payload), token
            });
            mostrarToast("Comprobante registrado con éxito.");
        }

        window.resetearFormulario();
        await cargarComprobantes();
    } catch (error) {
        statusMsg.textContent = error.message;
    }
});

function prepararEdicion(comp) {
    document.getElementById('idComprobante').value = comp.idComprobante;
    document.getElementById('descripcionGasto').value = comp.descripcionGasto;
    document.getElementById('idCatGasto').value = comp.idCatGasto;
    document.getElementById('fechaDelComprobante').value = comp.fechaDelComprobante;
    document.getElementById('monto').value = comp.monto;
    document.getElementById('estado').value = comp.estado;

    document.getElementById('form-kicker').textContent = "Edición de Registro";
    document.getElementById('form-title').textContent = `Modificando Comprobante`;
    document.getElementById('btnGuardar').textContent = "Actualizar Comprobante";
    document.getElementById('btnCancelar').style.display = 'inline-flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.resetearFormulario = () => {
    form.reset();
    document.getElementById('idComprobante').value = '';
    document.getElementById('formStatus').textContent = '';
    document.getElementById('form-kicker').textContent = "Nuevo Registro";
    document.getElementById('form-title').textContent = "Ingresar Comprobante";
    document.getElementById('btnGuardar').textContent = "Guardar Comprobante";
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
        await apiRequest(`/api/admin/comprobantes/${idEliminarSeleccionado}`, {
            method: 'DELETE', token
        });

        mostrarToast("Comprobante eliminado.");
        confirmDialog.close();
        await cargarComprobantes();
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