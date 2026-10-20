// 1. Importar los estilos de Tailwind/CSS para que Vite los procese y aplique
import "./admin.css";
import "/src/index.css";
// Importar funciones de utilidad de la API
import { apiRequest, getToken } from "./src/api.js";

/**
 * Función para verificar el acceso al panel de administrador
 */
const verificarAccesoAdmin = async () => {
    // ... (el resto del código que ya tenías)
    const accessMessage = document.querySelector("[data-access-message]");
    const accessCopy = document.querySelector("[data-access-copy]");
    const accessAction = document.querySelector("[data-access-action]");
    const adminShell = document.querySelector("[data-admin-shell]");

    try {
        // Ahora consultamos la ruta correcta de la API
        await apiRequest("/admin/validar", {
            method: "GET",
            token: getToken()
        });


        if (accessMessage) accessMessage.hidden = true;
        if (adminShell) adminShell.hidden = false;
        console.log("Usuario con permisos a ingresado")
    } catch (error) {

        console.error("Error de acceso:", error.message);
        if (accessCopy) accessCopy.textContent = "Acceso denegado. No tienes los permisos necesarios para ver esta página.";
        if (accessAction) accessAction.hidden = false;
        console.log("Redirigiendo wey")
        window.location.href = "/";
    }
};

document.addEventListener("DOMContentLoaded", () => {
    verificarAccesoAdmin();
});