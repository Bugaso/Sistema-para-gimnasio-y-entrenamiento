import { clearToken } from './api.js';

export function renderAdminLayout(activeNav) {
    const sidebarContainer = document.querySelector('[data-layout-sidebar]');
    const topbarContainer = document.querySelector('[data-layout-topbar]');

    // Evaluamos qué sección está activa para dejarla desplegada por defecto
    const isGestionActive = ['overview', 'roles', 'personnel', 'membresias'].includes(activeNav);
    const isEjerciciosActive = ['cat_ejercicios', 'ejercicios', 'equipamiento'].includes(activeNav);
    const isMusculosActive = ['grupo_muscular', 'musculos_asociados'].includes(activeNav);
    const isFinanzasActive = ['cat_gastos', 'comprobantes'].includes(activeNav);

    if (sidebarContainer) {
        sidebarContainer.outerHTML = `
            <style>
                .nav-section-content {
                    display: none;
                    flex-direction: column;
                    margin-bottom: 12px;
                }
                .nav-section-content.is-open {
                    display: flex;
                }
                
                /* 
                 * Fusionamos la clase .admin-nav-link del sistema 
                 * con el tamaño (.62rem) y espaciado (.16em) de los antiguos <p>
                 */
                .admin-nav-accordion {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    font-size: .62rem;
                    letter-spacing: .16em;
                    color: #888d89;
                    margin-top: 12px;
                }
                
                /* Forzamos que adopte el diseño "is-active" nativo al abrir el menú */
                .admin-nav-accordion.is-open {
                    border-left-color: var(--lime);
                    background: rgb(217 4 41 / 5%);
                    color: var(--lime);
                }
                
                .nav-chevron {
                    font-size: 0.55rem;
                    transition: transform 0.2s ease;
                }
                
                .nav-section-title.is-open .nav-chevron {
                    transform: rotate(180deg);
                }
            </style>

            <aside class="admin-sidebar" id="adminSidebar">
                <a class="logo admin-logo" href="/" aria-label="Atlas Gym, volver al inicio">
                    <span class="logo-mark" aria-hidden="true">A</span>Atlas Gym
                </a>

                <nav class="admin-nav" aria-label="Navegación del administrador">
                
                    <!-- SECCIÓN: GESTIÓN -->
                    <button type="button" class="admin-nav-link admin-nav-accordion nav-section-title ${isGestionActive ? 'is-open' : ''}" style="margin-top: 0;" data-target="nav-gestion">
                        Gestión <span class="nav-chevron">▼</span>
                    </button>
                    <div id="nav-gestion" class="nav-section-content ${isGestionActive ? 'is-open' : ''}">
                        <a class="admin-nav-link ${activeNav === 'overview' ? 'is-active' : ''}" href="/admin">
                            <span aria-hidden="true">01</span>Resumen
                        </a>
                        <a class="admin-nav-link ${activeNav === 'roles' ? 'is-active' : ''}" href="/admin/roles.html">
                            <span aria-hidden="true">02</span>Roles
                        </a>
                        <a class="admin-nav-link ${activeNav === 'personnel' ? 'is-active' : ''}" href="/admin/personal.html">
                            <span aria-hidden="true">03</span>Personal
                        </a>
                        <a class="admin-nav-link ${activeNav === 'membresias' ? 'is-active' : ''}" href="/admin/membresias.html">
                            <span aria-hidden="true">04</span>Membresías
                        </a>
                    </div>

                    <!-- SECCIÓN: EJERCICIOS -->
                    <button type="button" class="admin-nav-link admin-nav-accordion nav-section-title ${isEjerciciosActive ? 'is-open' : ''}" data-target="nav-ejercicios">
                        Ejercicios <span class="nav-chevron">▼</span>
                    </button>
                    <div id="nav-ejercicios" class="nav-section-content ${isEjerciciosActive ? 'is-open' : ''}">
                        <a class="admin-nav-link ${activeNav === 'cat_ejercicios' ? 'is-active' : ''}" href="/admin/categorias-ejercicios.html">
                            <span aria-hidden="true">04</span>Categorías Ejercicios
                        </a>
                        <a class="admin-nav-link ${activeNav === 'ejercicios' ? 'is-active' : ''}" href="/admin/ejercicios.html">
                            <span aria-hidden="true">05</span>Ejercicios
                        </a>
                        <a class="admin-nav-link ${activeNav === 'equipamiento' ? 'is-active' : ''}" href="/admin/equipamiento.html">
                            <span aria-hidden="true">06</span>Equipamiento   
                        </a>
                    </div>

                    <!-- SECCIÓN: MÚSCULOS -->
                    <button type="button" class="admin-nav-link admin-nav-accordion nav-section-title ${isMusculosActive ? 'is-open' : ''}" data-target="nav-musculos">
                        Músculos <span class="nav-chevron">▼</span>
                    </button>
                    <div id="nav-musculos" class="nav-section-content ${isMusculosActive ? 'is-open' : ''}">
                        <a class="admin-nav-link ${activeNav === 'grupo_muscular' ? 'is-active' : ''}" href="/admin/grupos-musculares.html">
                            <span aria-hidden="true">07</span>Grupos Musculares
                        </a>
                        <a class="admin-nav-link ${activeNav === 'musculos_asociados' ? 'is-active' : ''}" href="/admin/musculos-asociados.html">
                            <span aria-hidden="true">08</span>Músculos Asociados
                        </a>
                    </div>

                    <!-- SECCIÓN: FINANZAS -->
                    <button type="button" class="admin-nav-link admin-nav-accordion nav-section-title ${isFinanzasActive ? 'is-open' : ''}" data-target="nav-finanzas">
                        Finanzas <span class="nav-chevron">▼</span>
                    </button>
                    <div id="nav-finanzas" class="nav-section-content ${isFinanzasActive ? 'is-open' : ''}">
                        <a class="admin-nav-link ${activeNav === 'cat_gastos' ? 'is-active' : ''}" href="/admin/categorias-gastos.html">
                            <span aria-hidden="true">09</span>Categorías Gastos
                        </a>    
                        <a class="admin-nav-link ${activeNav === 'comprobantes' ? 'is-active' : ''}" href="/admin/comprobantes.html">
                            <span aria-hidden="true">10</span>Comprobantes
                        </a> 
                        <a class="admin-nav-link ${activeNav === 'estadisticas' ? 'is-active' : ''}" href="/admin/estadisticas-gastos.html">
                            <span aria-hidden="true">11</span>Estadisticas gastos
                        </a>
                    </div>             
                    
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

    // --- EVENTOS DEL LAYOUT ---

    // 1. Cerrar Sesión
    document.getElementById('btnLogout')?.addEventListener('click', () => {
        clearToken();
        window.location.href = '/login';
    });

    // 2. Toggle Menú Mobile
    document.getElementById('btnToggleMenu')?.addEventListener('click', () => {
        document.getElementById('adminSidebar')?.classList.toggle('is-open');
    });

    // 3. Lógica de Acordeón
    document.querySelectorAll('.nav-section-title').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const content = document.getElementById(targetId);

            btn.classList.toggle('is-open');
            content.classList.toggle('is-open');
        });
    });
}