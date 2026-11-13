import {getToken, verificarAccesoRuta} from '../api.js';
import { renderCoachLayout } from '../layout-coach.js';

document.addEventListener('DOMContentLoaded', async () => {
    const tieneAcceso = await verificarAccesoRuta("/api/coach/validar", "/");
    if (!tieneAcceso) return;
    // Renderizamos el layout y activamos la pestaña 'overview'
    renderCoachLayout('overview');

    const token = getToken();
    if (!token) {
        window.location.href = '/login';
    }
});