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
      const firstName = profile?.nomApe?.trim()
      authLink.textContent = firstName
        ? `${firstName} `
        : ""
      authLink.href = "#"
      authLink.addEventListener("click", (event) => {
          authLink.href = '/cliente/cliente-dashboard.html'
        //event.preventDefault()
        //clearToken()
        //window.location.reload()
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
    /*RECEPCIONISTA*/
    try {
        await apiRequest("/api/recepcion/validar", { method: "GET", token });
        document.getElementById('navRecepcionLink').hidden = false;
    } catch (error) { /* No es recepcionista */ }


    /*COACH*/
    const navCoachLink = document.getElementById("navCoachLink");

    if (token && navCoachLink) {
        try {
            await apiRequest("/api/coach/validar", { method: "GET", token });
            navCoachLink.hidden = false;
        } catch (error) {
            navCoachLink.hidden = true;

            if (error.status !== 403) {
                console.error("No se pudo validar el acceso de coach", error);
            }
        }
    }

}

//Membresias dinamicas

// Añade este código a tu archivo main.js

document.addEventListener('DOMContentLoaded', async () => {
    // ... tu código existente (verificarAdminNavBar, etc.)
    await cargarMembresiasIndex();
});

async function cargarMembresiasIndex() {
    const carrusel = document.getElementById('carruselMembresias');
    if (!carrusel) return;

    try {
        // Obtenemos las membresías directamente desde el backend (no requiere token de admin)
        const membresias = await apiRequest('/membresia/listar');
        const planesAgrupados = agruparMembresias(membresias);

        renderizarCarruselMembresias(carrusel, planesAgrupados);

    } catch (error) {
        console.error("Error al cargar las membresías para el index:", error);
        carrusel.innerHTML = '<p style="color: var(--muted); padding: 20px;">No se pudieron cargar los planes en este momento.</p>';
    }
}

function agruparMembresias(membresias) {
    const pasesDeUnDia = [];
    const planesMensuales = [];
    const planesConPlanificacion = [];

    membresias.forEach(membresia => {
        // Solo procesamos membresías ACTIVAS
        if (membresia.estado === 'INACTIVO' || !membresia.tipos) return;

        membresia.tipos.forEach(tipo => {
            if(!tipo.estado){
                return;
            }
            const dato = {
                nombreMembresia: membresia.descripMembresia,
                ...tipo
            };

            if (tipo.duracionMembresia === 1) {
                pasesDeUnDia.push(dato);
            } else if (tipo.planificacion) {
                planesConPlanificacion.push(dato);
            } else {
                planesMensuales.push(dato);
            }
        });
    });

    return {
        pasesDeUnDia,
        planesMensuales: consolidarPlanes(planesMensuales),
        planesConPlanificacion: consolidarPlanes(planesConPlanificacion)
    };
}

// Función para unificar los diferentes precios y días de una misma membresía
function consolidarPlanes(planesCrudos) {
    const mapa = new Map();

    planesCrudos.forEach(plan => {
        if (!mapa.has(plan.nombreMembresia)) {
            mapa.set(plan.nombreMembresia, {
                nombre: plan.nombreMembresia,
                precioDesde: plan.costoMembresia,
                minDias: plan.diasAsistencia,
                maxDias: plan.diasAsistencia,
                esPlanificado: plan.planificacion
            });
        } else {
            const planAgrupado = mapa.get(plan.nombreMembresia);
            // Actualizamos los rangos de precios y días
            if (plan.costoMembresia < planAgrupado.precioDesde) planAgrupado.precioDesde = plan.costoMembresia;
            if (plan.diasAsistencia < planAgrupado.minDias) planAgrupado.minDias = plan.diasAsistencia;
            if (plan.diasAsistencia > planAgrupado.maxDias) planAgrupado.maxDias = plan.diasAsistencia;
        }
    });

    return Array.from(mapa.values());
}

function renderizarCarruselMembresias(contenedor, grupos) {
    contenedor.innerHTML = ''; // Limpiamos el track del carrusel

    // 1. Tarjetas de Un Día
    grupos.pasesDeUnDia.forEach(pase => {
        contenedor.innerHTML += `
            <article class="membership-card">
              <span class="plan-badge">Un día</span>
              <h3>${pase.nombreMembresia}</h3>
              <p class="price">$${pase.costoMembresia} <small> / día</small></p>
              <ul class="plan-list">
                <li>Acceso por 1 día</li>
                <li>Membresía base</li>
              </ul>
              <a class="plan-link" href="/register">Elegir pase →</a>
            </article>
        `;
    });

    // 2. Tarjetas de Planes Mensuales Regulares
    grupos.planesMensuales.forEach(plan => {
        const textoDias = plan.minDias === plan.maxDias
            ? `${plan.minDias} días por semana`
            : `Desde ${plan.minDias} hasta ${plan.maxDias} días por semana`;

        contenedor.innerHTML += `
            <article class="membership-card">
              <span class="plan-badge">Mensual</span>
              <h3>${plan.nombre}</h3>
              <p class="price">Min $${plan.precioDesde} <small> / mes</small></p>
              <ul class="plan-list">
                <li>${textoDias}</li>
                <li>Acceso mensual estándar</li>
              </ul>
              <a class="plan-link" href="/register">Elegir plan →</a>
            </article>
        `;
    });

    // 3. Tarjetas de Planes con Planificación
    grupos.planesConPlanificacion.forEach(plan => {
        const textoDias = plan.minDias === plan.maxDias
            ? `${plan.minDias} días por semana`
            : `De ${plan.minDias} a ${plan.maxDias} días por semana`;

        contenedor.innerHTML += `
            <article class="membership-card featured">
              <span class="plan-badge">Planificado</span>
              <h3>${plan.nombre} PRO</h3>
              <p class="price">Min $${plan.precioDesde} <small> / mes</small></p>
              <ul class="plan-list">
                <li>${textoDias}</li>
                <li>Seguimiento planificado del rendimiento</li>
                <li>Rutinas enfocadas en objetivos</li>
              </ul>
              <a class="plan-link" href="/register">Elegir plan →</a>
            </article>
        `;
    });
}

/*
//Funcion para el Cliente
document.addEventListener('DOMContentLoaded', () => {
    const authContainer = document.getElementById('authContainer');
    const token = getToken();

    // Estilos alineados con Atlas Gym
    if (token) {
        // El usuario ya inició sesión: lo mandamos a su panel
        authContainer.innerHTML = `
            <a href="/cliente/cliente-dashboard.html" style="background-color: var(--lime, #a3e635); color: #121212; padding: 8px 16px; font-weight: bold; text-decoration: none; border-radius: 4px; transition: 0.3s;">
                 Mi Perfil
            </a>
        `;
    } else {
        // El usuario no tiene sesión: lo mandamos al login
        authContainer.innerHTML = `
            <a href="/login" style="background-color: transparent; color: #fff; border: 1px solid #fff; padding: 8px 16px; font-weight: bold; text-decoration: none; border-radius: 4px; transition: 0.3s;">
                Iniciar Sesión
            </a>
        `;
    }
});
*/
