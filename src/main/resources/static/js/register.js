/**
 * Envía la petición de registro al backend de Spring Boot.
 * @param {Object} datosFormulario - Objeto con los datos capturados del formulario HTML
 */


async function registrarUsuario(datosFormulario) {
    const URL_ENDPOINT = 'http://localhost:8080/api/v1/auth/register';

    // Estructura del cuerpo JSON coincidente con los campos de la entidad Usuario
    const usuarioPayload = {
        idUsuario: datosFormulario.idUsuario,
        nomApe: datosFormulario.nomApe,                  // String
        fechaNacimiento: datosFormulario.fechaNacimiento,// String con formato "YYYY-MM-DD"
        dniUs: Number(datosFormulario.dniUs),            // Long
        telUs: Number(datosFormulario.telUs),            // Long
        mailUs: datosFormulario.mailUs,                  // String
        password: datosFormulario.password,              // String (En texto plano; el backend aplica BCrypt)
        idCatUs: Number(datosFormulario.idCatUs)         // Long (ID para la relación con CategoriaUs)
    };

    try {
        const response = await fetch(URL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuarioPayload)
        });

        if (!response.ok) {
            const errorDetail = await response.text();
            throw new Error(`Error ${response.status}: ${errorDetail || 'No se pudo completar el registro'}`);
        }

        // Recibe el objeto AuthenticationResponse { token: "..." }
        const data = await response.json();

        if (data.token) {
            // Guarda el token JWT devuelto en el localStorage para futuras peticiones
            localStorage.setItem('jwt_token', data.token);
            console.log('Registro exitoso. Token JWT guardado localmente.');
        }

        return data;

    } catch (error) {
        console.error('Error durante el registro:', error.message);
        throw error;
    }
}

// === Ejemplo de uso desde un formulario ===
document.getElementById('formRegistro')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        idUsuario : 0,
        nomApe: document.getElementById('nomApe').value,
        fechaNacimiento: document.getElementById('fechaNacimiento').value, // input type="date"
        dniUs: document.getElementById('dniUs').value,
        telUs: document.getElementById('telUs').value,
        mailUs: document.getElementById('mailUs').value,
        password: document.getElementById('password').value,
        idCatUs: document.getElementById('idCatUs').value // <select> con las categorías
    };

    try {
        await registrarUsuario(formData);
        alert('¡Usuario registrado con éxito!');
        // Redirigir al panel o vista principal
        // window.location.href = '/dashboard.html';
    } catch (err) {
        alert('Error al registrar usuario: ' + err.message);
    }
});


/**
 * Consulta la API y puebla el selector HTML de categorías
 */
async function cargarCategorias() {
    const selectCategorias = document.getElementById('idCatUs');
    const URL_ENDPOINT = 'http://localhost:8080/api/v1/public/categorias';

    try {
        const response = await fetch(URL_ENDPOINT);
        if (!response.ok) {
            throw new Error('Error al cargar las categorías');
        }

        const categorias = await response.json();
        console.log('Categorías recibidas:', categorias);

        // Limpia el contenido actual manteniendo la opción por defecto
        selectCategorias.innerHTML = '<option value="" disabled selected>Seleccione una categoría...</option>';

        // Inserta cada CategoriaUs devuelta por la base de datos
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.idCatUs;
            option.textContent = cat.nomCatUs;
            selectCategorias.appendChild(option);
        });

    } catch (error) {
        console.error('No se pudieron cargar las categorías:', error);
        selectCategorias.innerHTML = '<option value="" disabled>Error al cargar categorías</option>';
    }
}

// Ejecutar la carga automáticamente al renderizar el DOM
document.addEventListener('DOMContentLoaded', cargarCategorias);

