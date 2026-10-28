// 1. Importar los estilos de Tailwind/CSS
import "../../css/admin/admin.css";
import "../../css/index/index.css";

// 2. Importar funciones de la API y el Layout
import { apiRequest, getToken } from "../api.js";
import { renderAdminLayout } from "../layout-admin.js";

/**
 * Función para verificar el acceso al panel de administrador
 */
const verificarAccesoAdmin = async () => {
    const accessMessage = document.querySelector("[data-access-message]");
    const accessCopy = document.querySelector("[data-access-copy]");
    const accessAction = document.querySelector("[data-access-action]");
    const adminShell = document.querySelector("[data-admin-shell]");

    try {
        // Consultamos la ruta protegida de la API
        await apiRequest("/admin/validar", {
            method: "GET",
            token: getToken()
        });

        // Si la promesa se resuelve correctamente
        if (accessMessage) accessMessage.hidden = true;
        if (adminShell) adminShell.hidden = false;
        console.log("Usuario con permisos ha ingresado exitosamente.");

    } catch (error) {
        console.error("Error de acceso:", error.message);

        // Si falla, mostramos el mensaje de error y el botón de iniciar sesión
        if (accessCopy) accessCopy.textContent = "Acceso denegado. No tienes los permisos necesarios para ver esta página.";
        if (accessAction) accessAction.hidden = false;

        console.log("Redirigiendo al login...");

        // Redirigimos automáticamente después de 2.5 segundos
        setTimeout(() => {
            window.location.href = "/login";
        }, 2500);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // Inyectamos la barra lateral y superior, marcando "overview" (Resumen) como activo
    renderAdminLayout('overview');

    // Validamos el token
    verificarAccesoAdmin();
});