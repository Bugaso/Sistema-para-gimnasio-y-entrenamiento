
    document.addEventListener("DOMContentLoaded", () => {
        cargarUsuarios();
        cargarHistorial();
        cargarMembresias();

        // Eventos para recalcular la duración y el total estimado en tiempo real
        document.getElementById("descripMembresia").addEventListener("change", manejarCambioMembresia);
        document.getElementById("duracionMembresia").addEventListener("input", calcularTotalEstimado);
        document.getElementById("unidadDuracion").addEventListener("change", calcularTotalEstimado);

        document.getElementById("formMembresia").addEventListener("submit", registrarMembresiaYPago);
        document.getElementById("searchDni").addEventListener("input", filtrarPorDni);
    });

    let listaHistorialCompleta = [];
    let listaMembresias = [];

// 1. Cargar combo de clientes / usuarios
    async function cargarUsuarios() {
        const select = document.getElementById("selectUsuario");
        try {
            const response = await fetch("/usuarios");
            if (!response.ok) throw new Error("Error al obtener usuarios");

            const usuarios = await response.json();
            select.innerHTML = '<option value="">-- Seleccione un Cliente --</option>';

            usuarios.forEach(user => {
                const dniText = user.dniUs ? ` (DNI: ${user.dniUs})` : '';
                select.innerHTML += `<option value="${user.idUsuario}">${user.nomApe || user.nombre}${dniText}</option>`;
            });
        } catch (error) {
            console.error(error);
            select.innerHTML = '<option value="">No se pudieron cargar los clientes</option>';
        }
    }

// Cargar catálogo de membresías
    async function cargarMembresias() {
        const selectMembresias = document.getElementById("descripMembresia");
        try {
            const response = await fetch("/membresia/listar");
            if (!response.ok) throw new Error("Error al obtener las membresias");

            listaMembresias = await response.json();
            selectMembresias.innerHTML = '<option value="">-- Seleccionar Plan --</option>';

            listaMembresias.forEach(membresia => {
                selectMembresias.innerHTML += `<option value="${membresia.idMembresia}">${membresia.descripMembresia} | $${membresia.costoMembresia} ARS</option>`;
            });
        } catch (error) {
            console.error(error);
            selectMembresias.innerHTML = '<option value="">No se pudieron cargar las membresias</option>';
        }
    }

// Regla de negocio para bloqueo/autoselección de unidades

    function manejarCambioMembresia() {
        const idMembresia = document.getElementById("descripMembresia").value;
        const inputDuracion = document.getElementById("duracionMembresia");
        const selectUnidad = document.getElementById("unidadDuracion");

        if (!idMembresia) {
            inputDuracion.value = 1;
            selectUnidad.value = "meses";
            calcularTotalEstimado();
            return;
        }

        const membresia = listaMembresias.find(m => m.idMembresia == idMembresia);

        if (membresia) {
            // Aseguramos que el input contenga al menos 1
            if (!inputDuracion.value || inputDuracion.value <= 0) {
                inputDuracion.value = 1;
            }
            const membresia = listaMembresias.find(m => m.idMembresia == idMembresia);
            const diasPlan = membresia.duracionMembresia;

            // 1. Si es un pase por día / diario (1 día): bloquear selector en "Día(s)"
            if (diasPlan === 1) {
                selectUnidad.value = "dias";
                inputDuracion.disabled = true;
            }
            // 2. Si es una membresía mensual (30 días): bloquear selector en "Mes(es)"
            if (diasPlan >= 30) {
                selectUnidad.value = "meses";
                inputDuracion.disabled = false;
            }
            // 3. Planes flexibles o personalizados: habilitar selector

        }

        calcularTotalEstimado();
    }

// Calcula el subtotal en tiempo real multiplicando el costo de la membresía por la cantidad ingresada
    function calcularTotalEstimado() {
        const idMembresia = document.getElementById("descripMembresia").value;
        const inputDuracion = document.getElementById("duracionMembresia");
        const contenedorTotal = document.getElementById("montoEstimado");

        if (!idMembresia) {
            if (contenedorTotal) contenedorTotal.textContent = "$0.00 ARS";
            return;
        }

        const membresia = listaMembresias.find(m => m.idMembresia == idMembresia);
        const cantidad = parseInt(inputDuracion.value) || 0;

        if (membresia && cantidad > 0) {
            const total = membresia.costoMembresia * cantidad;
            if (contenedorTotal) {
                contenedorTotal.textContent = `$${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })} ARS`;
            }
        } else {
            if (contenedorTotal) contenedorTotal.textContent = "$0.00 ARS";
        }
    }

// 2. Registrar la Membresía y guardar el registro en ClienteMembresia
    async function registrarMembresiaYPago(e) {
        e.preventDefault();

        const idUsuario = document.getElementById("selectUsuario").value;
        const idMembresia = document.getElementById("descripMembresia").value;
        const inputDuracion = document.getElementById("duracionMembresia");
        const selectUnidad = document.getElementById("unidadDuracion");

        let duracion = parseInt(inputDuracion.value);

        const payload = {
            idUsuario: parseInt(idUsuario),
            idMembresia: parseInt(idMembresia),
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

                // Restablecer valores de estado inicial
                selectUnidad.disabled = true;
                selectUnidad.value = "meses";
                inputDuracion.value = 1;
                calcularTotalEstimado();

                cargarHistorial();
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
            const costo = reg.costoTotal ? `$${reg.costoTotal}` : 'N/A';
            const duracion = reg.fechaVenc ? new Date(reg.fechaVenc).toLocaleDateString() : 'N/A';

            tbody.innerHTML += `
            <tr>
                <td>#${reg.idCliMem}</td>
                <td><strong>${dni}</strong></td>
                <td>${clienteNom}</td>
                <td>${planNom}</td>
                <td>${costo}</td>
                <td>${fecha}</td>
                <td>${duracion}</td>
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