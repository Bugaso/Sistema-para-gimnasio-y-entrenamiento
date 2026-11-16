import { renderRecepcionLayout } from './layout-recepcionista.js';
import { apiRequest, getToken, verificarAccesoRuta } from '../api.js';

const form = document.getElementById('formRegistrarCliente');
const btnLimpiar = document.getElementById('btnLimpiar');
const statusMsg = document.getElementById('formStatus');
const toast = document.getElementById('toast');

document.addEventListener('DOMContentLoaded', async () => {
    renderRecepcionLayout('registrar_cliente');

    const tieneAcceso = await verificarAccesoRuta('/api/recepcion/validar', '/');
    if (!tieneAcceso) return;

    if (!getToken()) {
        window.location.href = '/login';
        return;
    }

    btnLimpiar?.addEventListener('click', () => {
        form.reset();
        statusMsg.textContent = '';
    });
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusMsg.textContent = '';

    const dniVal = document.getElementById('dniUs').value.trim();
    const telVal = document.getElementById('telUs').value.trim();
    const contactoVal = document.getElementById('numContacto').value.trim();

    const payload = {
        idUsuario: null,
        nomApe: document.getElementById('nomApe').value.trim(),
        fechaNacimiento: document.getElementById('fechaNacimiento').value,
        dniUs: Number(dniVal),
        mailUs: document.getElementById('mailUs').value.trim(),
        telUs: Number(telVal),
        numContacto: contactoVal ? Number(contactoVal) : null,
        password: null,
        idRol: null
    };

    try {
        const respuesta = await apiRequest('/api/recepcion/registrar-cliente', {
            method: 'POST',
            body: JSON.stringify(payload),
            token: getToken()
        });

        mostrarToast(respuesta.message || 'Cliente registrado con éxito.');
        form.reset();
    } catch (error) {
        statusMsg.textContent = error.message || 'No se pudo registrar el cliente.';
    }
});

function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.hidden = false;
    setTimeout(() => { toast.hidden = true; }, 3500);
}