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

        // Cargar Footer
        const footerResp = await fetch('/componentes/footer');
        if (footerResp.ok) {
            document.getElementById('footer-container').innerHTML = await footerResp.text();
        }
    } catch (error) {
        console.error('Error cargando los componentes HTML:', error);
    }
}

document.addEventListener('DOMContentLoaded', cargarComponentes);