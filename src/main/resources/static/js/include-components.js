
async function cargarComponentes() {
    try {
        // Cargar Header
        const headerResp = await fetch('componentes/header');
        if (headerResp.ok) {
            document.getElementById('header-container').innerHTML = await headerResp.text();

            // Re-vincular evento de menú móvil tras cargar el HTML dinámico
            const mobileMenu = document.getElementById('mobile-menu');
            const navLinks = document.querySelector('.nav-links');
            if (mobileMenu && navLinks) {
                mobileMenu.addEventListener('click', () => {
                    navLinks.classList.toggle('active');
                });
            }
        }

        // 2. Verificar sesión y actualizar el botón de Login
        await gestionarEstadoSesion();

        // Cargar Footer
        const footerResp = await fetch('/componentes/footer');
        if (footerResp.ok) {
            document.getElementById('footer-container').innerHTML = await footerResp.text();
        }
    } catch (error) {
        console.error('Error cargando los componentes HTML:', error);
    }
}



async function gestionarEstadoSesion() {
    const btnAuth = document.getElementById('AuthUser');
    const btnLogout = document.getElementById('btnLogout');
    const token = localStorage.getItem('jwt_token');

    // Estado cuando NO hay sesión activa
    if (!token) {
        if (btnLogout) btnLogout.style.display = 'none';
        if (btnAuth) {
            btnAuth.textContent = 'Iniciar Sesión';
            btnAuth.href = '/login';
        }
        return;
    }

    // Validar token contra el backend
    try {
        const response = await fetch('http://localhost:8080/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const usuario = await response.json();

            // Usuario Autenticado: Actualizar nombre y mostrar Logout
            if (btnAuth) {
                btnAuth.textContent = usuario.nomApe;
                btnAuth.href = '/';
            }

            if (btnLogout) {
                btnLogout.style.display = 'inline-block';
                btnLogout.addEventListener('click', postCierreSesion);
            }
        } else {
            // Token expirado o alterado
            postCierreSesion();
        }
    } catch (error) {
        console.error('Error al validar la sesión:', error);
    }
}

function postCierreSesion() {
    localStorage.removeItem('jwt_token');
    window.location.href = '/';
}

document.addEventListener('DOMContentLoaded', cargarComponentes);
