import { getToken } from '../api.js';
import { renderRecepcionLayout } from './layout-recepcionista.js';

document.addEventListener('DOMContentLoaded', () => {
    // Ilumina la opción de "Resumen/Overview" o lo deja sin iluminar si no hay ninguna coincidencia
    renderRecepcionLayout('overview');

    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }
});