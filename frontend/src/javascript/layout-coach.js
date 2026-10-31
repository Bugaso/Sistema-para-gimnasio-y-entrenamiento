import { clearToken } from './api.js';

export function renderCoachLayout(activeNav) {
    const sidebarContainer = document.querySelector('[data-layout-sidebar]');
    const topbarContainer = document.querySelector('[data-layout-topbar]');

    if (sidebarContainer) {
        sidebarContainer.outerHTML = `
            <aside class="admin-sidebar" id="coachSidebar">
                <a class="logo admin-logo" href="/" aria-label="Atlas Gym, volver al inicio">
                    <span class="logo-mark" aria-hidden="true">A</span>Atlas Gym
                </a>

                <nav class="admin-nav" aria-label="Navegación de Coach">
                    <p>Entrenamiento</p>
                    <a class="admin-nav-link ${activeNav === 'overview' ? 'is-active' : ''}" href="/coach/index-coach.html">
                        <span aria-hidden="true">⌂</span> Inicio
                    </a>
                    <a class="admin-nav-link ${activeNav === 'rutinas' ? 'is-active' : ''}" href="/coach/rutinas.html">
                        <span aria-hidden="true">01</span> Rutinas y Asignaciones
                    </a>
                </nav>

                <div class="admin-sidebar-footer">
                    <a href="/">Volver al sitio <span aria-hidden="true">↗</span></a>
                    <button type="button" id="btnLogout">Cerrar sesión</button>
                </div>
            </aside>
        `;
    }

    if (topbarContainer) {
        topbarContainer.outerHTML = `
            <header class="admin-topbar">
                <button class="admin-menu-toggle" type="button" aria-label="Abrir navegación" id="btnToggleMenu">
                    <span></span><span></span>
                </button>
                <div>
                    <p>Atlas Gym</p>
                    <strong>Portal de Entrenadores</strong>
                </div>
                <div class="admin-user">
                    <span class="admin-user-avatar" aria-hidden="true">CO</span>
                    <p><strong>Coach</strong><span>Entrenamiento</span></p>
                </div>
            </header>
        `;
    }

    document.getElementById('btnLogout')?.addEventListener('click', () => {
        clearToken();
        window.location.href = '/login';
    });

    document.getElementById('btnToggleMenu')?.addEventListener('click', () => {
        document.getElementById('coachSidebar')?.classList.toggle('is-open');
    });
}