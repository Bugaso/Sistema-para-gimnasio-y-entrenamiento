document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.getElementById("navbar");
    const mobileMenu = document.getElementById("mobile-menu");
    const navLinks = document.querySelector(".nav-links");

    // Efecto de Navbar al hacer scroll
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // Menú hamburguesa básico para móviles
    mobileMenu.addEventListener("click", () => {
        // Aquí podrías alternar una clase para mostrar el menú móvil.
        // Por ahora, lanza un alert o maneja el toggle de clases.
        navLinks.style.display = navLinks.style.display === "flex" ? "none" : "flex";
        navLinks.style.flexDirection = "column";
        navLinks.style.position = "absolute";
        navLinks.style.top = "70px";
        navLinks.style.right = "20px";
        navLinks.style.background = "#08080a";
        navLinks.style.padding = "20px";
        navLinks.style.borderRadius = "8px";
    });
});