document.addEventListener("DOMContentLoaded", () => {
    cargarUsuarios();
    cargarHistorial();
    cargarMembresias();
    document.getElementById("formMembresia").addEventListener("submit", registrarMembresiaYPago);
    document.getElementById("searchDni").addEventListener("input", filtrarPorDni);
});

let listaHistorialCompleta = [];

// 1. Cargar combo de clientes / usuarios
async function cargarUsuarios() {
    const select = document.getElementById("selectUsuario");
    try {
        const response = await fetch("/usuarios"); // Endpoint que lista usuarios
        if (!response.ok) throw new Error("Error al obtener usuarios");

        const usuarios = await response.json();
        select.innerHTML = '<option value="">-- Seleccione un Cliente --</option>';

        usuarios.forEach(user => {
            // Asume que el usuario tiene idUsuario, nomApe o nombre/dni
            const dniText = user.dniUs ? ` (DNI: ${user.dniUs})` : '';
            select.innerHTML += `<option value="${user.idUsuario}">${user.nomApe || user.nombre}${dniText}</option>`;
        });
    } catch (error) {
        console.error(error);
        select.innerHTML = '<option value="">No se pudieron cargar los clientes</option>';
    }
}

async function cargarMembresias(){
    const selectMembresias = document.getElementById("descripMembresia")
    try {
        const response = await fetch("/membresia/listar"); // Endpoint que lista usuarios
        if (!response.ok) throw new Error("Error al obtener las membresias");

        const membresias = await response.json();
        //console.log(membresias)
        membresias.forEach(membresia => {
            // Asume que la membresia fue cargada y contiene los datos
            const descText = membresia.descripMembresia ? ` (${membresia.descripMembresia})` : '';
            selectMembresias.innerHTML += `<option value="${membresia.idMembresia}">${membresia.descripMembresia} | ${membresia.costoMembresia} ARS</option>`;
        });
    } catch (error) {
        console.error(error);
        selectMembresias.innerHTML = '<option value="">No se pudieron cargar las membresias</option>';
    }
}

// 2. Registrar la Membresía y guardar el registro en ClienteMembresia
async function registrarMembresiaYPago(e) {
    e.preventDefault();

    const idUsuario = document.getElementById("selectUsuario").value;
    const idMembresia = document.getElementById("descripMembresia").value;

    let duracion = parseInt(document.getElementById("duracionMembresia").value);
    const unidad = document.getElementById("unidadDuracion").value;

    // Si selecciona meses, convertimos opcionalmente a días o guardamos el valor entero según tu regla de negocio
    if (unidad === "meses") {
        duracion = duracion * 30; // Guarda la equivalencia en días (30 días por mes)
    }

    const payload = {
        idUsuario: parseInt(idUsuario),
        idMembresia : parseInt(idMembresia),
        duracionMembresia: duracion
    };

    try {
        const response = await fetch("/cliente-membresias/registrar-pago", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("¡Membresía asignada y pago registrado con éxito!");
            document.getElementById("formMembresia").reset();
            cargarHistorial(); // Recarga la tabla de abajo
        } else {
            alert("Error al procesar el registro.");
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión con el servidor.");
    }
}

// 3. Obtener todo el historial de suscripciones creadas
async function cargarHistorial() {
    try {
        const response = await fetch("/cliente-membresias/historial");
        if (!response.ok) throw new Error("Error al cargar historial");

        listaHistorialCompleta = await response.json();
        renderizarTabla(listaHistorialCompleta);
    } catch (error) {
        console.error(error);
        document.getElementById("tablaCuerpo").innerHTML =
            '<tr><td colspan="7" class="empty-msg">Error al cargar la lista.</td></tr>';
    }
}

// 4. Renderizar registros en la tabla
function renderizarTabla(lista) {
    const tbody = document.getElementById("tablaCuerpo");
    tbody.innerHTML = "";

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-msg">No hay membresías registradas.</td></tr>';
        return;
    }

    lista.forEach(reg => {
        const fecha = reg.fechaPago ? new Date(reg.fechaPago).toLocaleString() : 'N/A';
        const dni = reg.usuario && reg.usuario.dniUs ? reg.usuario.dniUs : 'S/D';
        const clienteNom = reg.usuario ? (reg.usuario.nomApe || reg.usuario.nombre) : `ID: ${reg.idUsuario}`;
        const planNom = reg.membresia ? reg.membresia.descripMembresia : 'N/A';
        const costo = reg.membresia ? `$${reg.membresia.costoMembresia}` : 'N/A';
        const duracion = reg.membresia ? `${reg.membresia.duracionMembresia} días` : 'N/A';

        tbody.innerHTML += `
            <tr>
                <td>#${reg.idCliMem}</td>
                <td><strong>${dni}</strong></td>
                <td>${clienteNom}</td>
                <td>${planNom}</td>
                <td>${costo}</td>
                <td>${duracion}</td>
                <td>${fecha}</td>
            </tr>
        `;
    });
}

// 5. Filtro dinámico por DNI en tiempo real
function filtrarPorDni() {
    const termino = document.getElementById("searchDni").value.trim().toLowerCase();

    const filtrados = listaHistorialCompleta.filter(reg => {
        const dni = reg.usuario && reg.usuario.dniUs ? reg.usuario.dniUs.toString().toLowerCase() : '';
        return dni.includes(termino);
    });

    renderizarTabla(filtrados);
}