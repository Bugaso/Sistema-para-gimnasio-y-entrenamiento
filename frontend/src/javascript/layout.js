import { clearToken } from '../api.js';

export function renderAdminLayout(activeNav) {
    const sidebarContainer = document.querySelector('[data-layout-sidebar]');
    const topbarContainer = document.querySelector('[data-layout-topbar]');

    if (sidebarContainer) {
        sidebarContainer.outerHTML = `
            <aside class="admin-sidebar" id="adminSidebar">
                <a class="logo admin-logo" href="/" aria-label="Atlas Gym, volver al inicio">
                    <span class="logo-mark" aria-hidden="true">A</span>Atlas Gym
                </a>

                <nav class="admin-nav" aria-label="Navegación del administrador">
                    <p>Gestión</p>
                    <a class="admin-nav-link ${activeNav === 'overview' ? 'is-active' : ''}" href="/admin">
                        <span aria-hidden="true">01</span>Resumen
                    </a>
                    <a class="admin-nav-link ${activeNav === 'roles' ? 'is-active' : ''}" href="/admin/roles.html">
                        <span aria-hidden="true">02</span>Roles
                    </a>
                    <a class="admin-nav-link ${activeNav === 'personnel' ? 'is-active' : ''}" href="/admin/personal.html">
                        <span aria-hidden="true">03</span>Personal
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
                    <strong>Administración</strong>
                </div>
                <div class="admin-user">
                    <span class="admin-user-avatar" aria-hidden="true">AD</span>
                    <p><strong>Administrador</strong><span>Control total</span></p>
                </div>
            </header>
        `;
    }

    document.getElementById('btnLogout')?.addEventListener('click', () => {
        clearToken();
        window.location.href = '/inicio-sesion.html';
    });

    document.getElementById('btnToggleMenu')?.addEventListener('click', () => {
        document.getElementById('adminSidebar')?.classList.toggle('is-open');
    });
}