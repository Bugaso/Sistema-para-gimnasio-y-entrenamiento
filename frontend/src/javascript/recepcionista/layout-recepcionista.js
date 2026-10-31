import { clearToken } from '../api.js';

export function renderRecepcionLayout(activeNav) {
    const sidebarContainer = document.querySelector('[data-layout-sidebar]');
    const topbarContainer = document.querySelector('[data-layout-topbar]');

    if (sidebarContainer) {
        sidebarContainer.outerHTML = `
            <aside class="admin-sidebar" id="recepcionSidebar">
                <a class="logo admin-logo" href="/" aria-label="Atlas Gym, volver al inicio">
                    <span class="logo-mark" aria-hidden="true">A</span>Atlas Gym
                </a>

                <nav class="admin-nav" aria-label="Navegación de Recepción">
                    <p>Gestión de Clientes</p>
                    <a class="admin-nav-link ${activeNav === 'historial_medico' ? 'is-active' : ''}" href="/recepcionista/historial-medico.html">
                        <span aria-hidden="true">01</span>Historial Médico
                    </a>
                    <a class="admin-nav-link ${activeNav === 'registrar_pago' ? 'is-active' : ''}" href="/recepcionista/registrar-pago.html">
                        <span aria-hidden="true">02</span>Registrar pago
                    </a>
                    <a class="admin-nav-link ${activeNav === 'historial_pago' ? 'is-active' : ''}" href="/recepcionista/historial-pago.html">
                        <span aria-hidden="true">03</span>Historial de pagos
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
                    <strong>Recepción</strong>
                </div>
                <div class="admin-user">
                    <span class="admin-user-avatar" aria-hidden="true">RC</span>
                    <p><strong>Recepcionista</strong><span>Atención al Cliente</span></p>
                </div>
            </header>
        `;
    }

    document.getElementById('btnLogout')?.addEventListener('click', () => {
        clearToken();
        window.location.href = '/login';
    });

    document.getElementById('btnToggleMenu')?.addEventListener('click', () => {
        document.getElementById('recepcionSidebar')?.classList.toggle('is-open');
    });
}