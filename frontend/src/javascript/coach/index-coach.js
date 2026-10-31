import { getToken } from '../api.js';
import { renderCoachLayout } from '../layout-coach.js';

document.addEventListener('DOMContentLoaded', () => {
    // Renderizamos el layout y activamos la pestaña 'overview'
    renderCoachLayout('overview');

    const token = getToken();
    if (!token) {
        window.location.href = '/login.html';
    }
});