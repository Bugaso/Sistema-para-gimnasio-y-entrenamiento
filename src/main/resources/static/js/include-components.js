
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
        await actualizarBotonUsuario();

        // Cargar Footer
        const footerResp = await fetch('/componentes/footer');
        if (footerResp.ok) {
            document.getElementById('footer-container').innerHTML = await footerResp.text();
        }
    } catch (error) {
        console.error('Error cargando los componentes HTML:', error);
    }
}



async function actualizarBotonUsuario() {
    const btnAuth = document.getElementById('AuthUser');
    const token = localStorage.getItem('jwt_token');

    if (!btnAuth || !token) return;

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

            // Cambia el texto por el nombre del usuario y redirige al Dashboard al hacer clic
            btnAuth.textContent = usuario.nomApe;
            btnAuth.href = '/';
        } else {
            // Si el token expiró o es inválido, limpia el storage
            localStorage.removeItem('jwt_token');
        }
    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
    }
}

document.addEventListener('DOMContentLoaded', cargarComponentes);
