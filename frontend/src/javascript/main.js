import "../css/index/index.css"
import { clearToken, getProfile, getToken } from "./api.js"

const toggle = document.querySelector(".menu-toggle")
const nav = document.querySelector(".nav-links")

toggle?.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") === "true"
  toggle.setAttribute("aria-expanded", String(!open))
  nav?.classList.toggle("is-open", !open)
})

document.querySelectorAll(".nav-links a").forEach((link) =>
  link.addEventListener("click", () => {
    toggle?.setAttribute("aria-expanded", "false")
    nav?.classList.remove("is-open")
  }),
)

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector(".carousel-track")
  carousel.querySelectorAll("[data-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = track?.firstElementChild
      if (!track || !card) return
      const gap = Number.parseFloat(getComputedStyle(track).gap) || 20
      const direction = button.dataset.direction === "next" ? 1 : -1
      track.scrollBy({
        left: direction * (card.getBoundingClientRect().width + gap),
        behavior: "smooth",
      })
    })
  })
})

const year = document.querySelector("[data-year]")
if (year) year.textContent = new Date().getFullYear()

const authLink = document.querySelector("[data-auth-link]")
const token = getToken()

if (authLink && token) {
  getProfile(token)
    .then((profile) => {
      const firstName = profile?.nomApe?.trim().split(/\s+/)[0]
      authLink.textContent = firstName
        ? `${firstName} · Cerrar sesión`
        : "Cerrar sesión"
      authLink.href = "#"
      authLink.addEventListener("click", (event) => {
        event.preventDefault()
        clearToken()
        window.location.reload()
      })
    })
    .catch((error) => {
      if (error.status === 401 || error.status === 403) clearToken()
    })
}


import { apiRequest } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    await verificarAdminNavBar();
});

async function verificarAdminNavBar() {
    const token = getToken();
    const navAdminLink = document.getElementById('navAdminLink');

    // Si no hay token o no existe el enlace en el HTML, no hacemos nada
    if (!token || !navAdminLink) return;

    try {
        // Consultamos al backend si este token tiene permisos de administrador
        await apiRequest("/admin/validar", {
            method: "GET",
            token: token
        });

        // Si la promesa se resuelve correctamente, el usuario es Admin.
        // Removemos el atributo hidden para que aparezca el botón.
        navAdminLink.hidden = false;

    } catch (error) {
        // Si da error (es un cliente normal o el token expiró), se queda oculto.
        console.log("Usuario regular, pestaña de administración oculta.");
    }
}