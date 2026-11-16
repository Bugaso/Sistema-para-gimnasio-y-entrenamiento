import { apiRequest } from './api.js';
import "../css/index/index.css"
const modalRecuperar = document.getElementById('modalRecuperarPassword');
const btnOlvidePassword = document.getElementById('btnOlvidePassword');
const btnCerrarModal = document.getElementById('btnCerrarModalRecuperar');

const formPaso1 = document.getElementById('formPaso1Solicitar');
const formPaso2 = document.getElementById('formPaso2Validar');
const formPaso3 = document.getElementById('formPaso3Password');

let estadoRecuperacion = {
    mailUs: '',
    dniUs: null,
    codigo: ''
};

function mostrarPaso(numeroPaso) {
    formPaso1.style.display = numeroPaso === 1 ? 'block' : 'none';
    formPaso2.style.display = numeroPaso === 2 ? 'block' : 'none';
    formPaso3.style.display = numeroPaso === 3 ? 'block' : 'none';
}

function resetearModalRecuperacion() {
    estadoRecuperacion = { mailUs: '', dniUs: null, codigo: '' };
    formPaso1.reset();
    formPaso2.reset();
    formPaso3.reset();
    document.getElementById('statusPaso1').textContent = '';
    document.getElementById('statusPaso2').textContent = '';
    document.getElementById('statusPaso3').textContent = '';
    mostrarPaso(1);
}

btnOlvidePassword?.addEventListener('click', () => {
    resetearModalRecuperacion();

    // Si estamos en el perfil del cliente y ya están cargados su email y DNI, los autocompletamos
    const emailPerfil = document.getElementById('mailUs')?.value;
    const dniPerfil = document.getElementById('dniUs')?.value;
    if (emailPerfil) document.getElementById('recEmail').value = emailPerfil;
    if (dniPerfil) document.getElementById('recDni').value = dniPerfil;

    modalRecuperar.showModal();
});

btnCerrarModal?.addEventListener('click', () => modalRecuperar.close());

document.getElementById('btnVolverPaso1')?.addEventListener('click', () => {
    document.getElementById('statusPaso2').textContent = '';
    mostrarPaso(1);
});

// PASO 1: Solicitar envío del código de 6 dígitos
formPaso1?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('statusPaso1');
    const btn = document.getElementById('btnEnviarCodigo');
    status.textContent = '';

    const mailUs = document.getElementById('recEmail').value.trim();
    const dniUs = Number(document.getElementById('recDni').value.trim());

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
        await apiRequest('/api/v1/public/recuperar-password/solicitar', {
            method: 'POST',
            body: JSON.stringify({ mailUs, dniUs })
        });

        estadoRecuperacion.mailUs = mailUs;
        estadoRecuperacion.dniUs = dniUs;

        document.getElementById('lblEmailDestino').textContent = mailUs;
        mostrarPaso(2);
    } catch (error) {
        status.textContent = error.message || 'No se pudo procesar la solicitud.';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Enviar Código';
    }
});

// PASO 2: Validar código de 6 dígitos
formPaso2?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('statusPaso2');
    const btn = document.getElementById('btnValidarCodigo');
    status.textContent = '';

    const codigo = document.getElementById('recCodigo').value.trim();

    btn.disabled = true;
    btn.textContent = 'Validando...';

    try {
        await apiRequest('/api/v1/public/recuperar-password/validar', {
            method: 'POST',
            body: JSON.stringify({
                mailUs: estadoRecuperacion.mailUs,
                dniUs: estadoRecuperacion.dniUs,
                codigo
            })
        });

        estadoRecuperacion.codigo = codigo;
        mostrarPaso(3);
    } catch (error) {
        status.textContent = error.message || 'Código inválido o expirado.';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Validar Código';
    }
});

// PASO 3: Confirmar nueva contraseña
formPaso3?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('statusPaso3');
    const btn = document.getElementById('btnConfirmarNuevaPass');
    status.textContent = '';

    const nuevaPassword = document.getElementById('recNuevaPass').value;
    const confirmarPassword = document.getElementById('recConfirmarPass').value;

    if (nuevaPassword !== confirmarPassword) {
        status.textContent = 'Las contraseñas no coinciden.';
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
        await apiRequest('/api/v1/public/recuperar-password/restablecer', {
            method: 'POST',
            body: JSON.stringify({
                mailUs: estadoRecuperacion.mailUs,
                dniUs: estadoRecuperacion.dniUs,
                codigo: estadoRecuperacion.codigo,
                nuevaPassword
            })
        });

        modalRecuperar.close();

        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = '¡Contraseña actualizada correctamente!';
            toast.hidden = false;
            setTimeout(() => { toast.hidden = true; }, 3500);
        } else {
            alert('¡Contraseña actualizada correctamente!');
        }
    } catch (error) {
        status.textContent = error.message || 'Error al actualizar la contraseña.';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Confirmar Cambio';
    }
});