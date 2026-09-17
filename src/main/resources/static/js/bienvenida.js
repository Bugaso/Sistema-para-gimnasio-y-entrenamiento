document.addEventListener("DOMContentLoaded", () => {

    // 1. Efecto de Navbar al hacer scroll (busca el navbar dinámicamente en cada evento)
    window.addEventListener("scroll", () => {
        const navbar = document.getElementById("navbar");
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        }
    });

    // 2. Menú hamburguesa utilizando Delegación de Eventos
    document.addEventListener("click", (e) => {
        // Captura el clic incluso si los elementos se inyectaron después de cargar el DOM
        const mobileMenu = e.target.closest("#mobile-menu");

        if (mobileMenu) {
            const navLinks = document.querySelector(".nav-links");
            if (navLinks) {
                const isFlex = navLinks.style.display === "flex";
                navLinks.style.display = isFlex ? "none" : "flex";
                navLinks.style.flexDirection = "column";
                navLinks.style.position = "absolute";
                navLinks.style.top = "70px";
                navLinks.style.right = "20px";
                navLinks.style.background = "#08080a";
                navLinks.style.padding = "20px";
                navLinks.style.borderRadius = "8px";
            }
        }
    });

});