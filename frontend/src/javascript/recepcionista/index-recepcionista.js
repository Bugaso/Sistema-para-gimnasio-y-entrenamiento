import {getToken, verificarAccesoRuta} from '../api.js';
import {protegerVistaPorRol, renderRecepcionLayout} from './layout-recepcionista.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Ilumina la opción de "Resumen/Overview" o lo deja sin iluminar si no hay ninguna coincidencia
    renderRecepcionLayout('overview');

    const tieneAcceso = await verificarAccesoRuta("/api/recepcion/validar", "/");
    if (!tieneAcceso) return;


    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }
});

