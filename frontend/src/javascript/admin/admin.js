import "../../css/admin/admin.css";
import "../../css/index/index.css";

import { apiRequest, getToken } from "../api.js";
import { renderAdminLayout } from "../layout-admin.js";

const formateadorMoneda = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
});

const verificarAccesoAdmin = async () => {
    const accessMessage = document.querySelector("[data-access-message]");
    const accessCopy = document.querySelector("[data-access-copy]");
    const accessAction = document.querySelector("[data-access-action]");
    const adminShell = document.querySelector("[data-admin-shell]");

    try {
        await apiRequest("/admin/validar", {
            method: "GET",
            token: getToken()
        });

        if (accessMessage) accessMessage.hidden = true;
        if (adminShell) adminShell.hidden = false;
        return true;

    } catch (error) {
        console.error("Error de acceso:", error.message);

        if (accessCopy) accessCopy.textContent = "Acceso denegado. No tienes los permisos necesarios para ver esta página.";
        if (accessAction) accessAction.hidden = false;

        setTimeout(() => {
            window.location.href = "/login";
        }, 2500);
        return false;
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    renderAdminLayout("overview");

    const tieneAcceso = await verificarAccesoAdmin();
    if (tieneAcceso) {
        await cargarResumenGeneral();
    }
});

async function cargarResumenGeneral() {
    const token = getToken();

    // Fecha local actual en formato YYYY-MM-DD
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    const hoyISO = new Date(Date.now() - tzOffset).toISOString().split("T")[0];
    const [anioActual, mesActual] = hoyISO.split("-");

    // Consultamos los 3 endpoints en paralelo de forma segura
    const [resPagos, resComprobantes, resAsistencias] = await Promise.allSettled([
        apiRequest("/cliente-membresias/historial", { token }),
        apiRequest("/api/admin/comprobantes", { token }),
        apiRequest(`/api/recepcion/asistencia/historial/dia?fecha=${hoyISO}`, { token })
    ]);

    const historialPagos = resPagos.status === "fulfilled" && Array.isArray(resPagos.value) ? resPagos.value : [];
    const comprobantes = resComprobantes.status === "fulfilled" && Array.isArray(resComprobantes.value) ? resComprobantes.value : [];
    const asistenciasHoy = resAsistencias.status === "fulfilled" && Array.isArray(resAsistencias.value) ? resAsistencias.value : [];

    // 1. CÁLCULOS FINANCIEROS DEL MES
    let ingresosMes = 0;
    let cantidadCobrosMes = 0;

    historialPagos.forEach((p) => {
        if (p.estado === "BAJA" || !p.fechaPago) return;
        const fechaSoloDia = p.fechaPago.substring(0, 10);
        const [anio, mes] = fechaSoloDia.split("-");

        if (anio === anioActual && mes === mesActual) {
            ingresosMes += Number(p.costoTotal || 0);
            cantidadCobrosMes++;
        }
    });

    let egresosMes = 0;
    comprobantes.forEach((c) => {
        if (c.estado !== "Pagado" || !c.fechaDelComprobante) return;
        const [anio, mes] = c.fechaDelComprobante.split("-");

        if (anio === anioActual && mes === mesActual) {
            egresosMes += Number(c.monto || 0);
        }
    });

    const balanceNeto = ingresosMes - egresosMes;

    // 2. CÁLCULOS DE MEMBRESÍAS ACTIVAS Y PRÓXIMOS VENCIMIENTOS (<= 7 días)
    const hoyDate = new Date();
    hoyDate.setHours(0, 0, 0, 0);

    let activasCount = 0;
    let porVencerCount = 0;

    historialPagos.forEach((p) => {
        if (p.estado !== "ACTIVO") return;
        activasCount++;

        if (p.fechaVencimiento) {
            const [y, m, d] = p.fechaVencimiento.split("-");
            const fechaVenc = new Date(y, m - 1, d);
            fechaVenc.setHours(0, 0, 0, 0);
            const diffDias = Math.ceil((fechaVenc - hoyDate) / (1000 * 60 * 60 * 24));

            if (diffDias >= 0 && diffDias <= 7) {
                porVencerCount++;
            }
        }
    });

    // 3. CÁLCULOS DE ASISTENCIA DIARIA
    const totalAsistenciasHoy = asistenciasHoy.length;
    const enGimnasioAhora = asistenciasHoy.filter((a) => !a.fechaHoraSalida).length;

    // ACTUALIZAR TARJETAS SUPERIORES (KPIs)
    document.querySelector("[data-ingresos-mes]").textContent = formateadorMoneda.format(ingresosMes);
    document.querySelector("[data-ingresos-detalle]").textContent = `${cantidadCobrosMes} cobro(s) este mes`;

    document.querySelector("[data-socios-activos]").textContent = activasCount;
    document.querySelector("[data-por-vencer]").textContent = porVencerCount > 0
        ? `${porVencerCount} vencen en ≤ 7 días`
        : "Sin vencimientos próximos";

    document.querySelector("[data-asistencias-hoy]").textContent = resAsistencias.status === "fulfilled" ? totalAsistenciasHoy : "N/D";
    document.querySelector("[data-en-gimnasio]").textContent = resAsistencias.status === "fulfilled"
        ? `${enGimnasioAhora} entrenando ahora`
        : "Sin acceso a recepción";

    document.querySelector("[data-balance-mes]").textContent = formateadorMoneda.format(balanceNeto);
    document.querySelector("[data-egresos-detalle]").textContent = `Egresos pagados: ${formateadorMoneda.format(egresosMes)}`;

    // RENDERIZAR BLOQUES INFERIORES
    renderizarUltimosMovimientos(historialPagos, comprobantes);
    renderizarDistribucionPlanes(historialPagos);
}

function renderizarUltimosMovimientos(pagos, comprobantes) {
    const contenedor = document.querySelector("[data-ultimos-movimientos]");
    const movimientos = [];

    // Normalizar ingresos
    pagos.forEach((p) => {
        if (p.estado === "BAJA" || !p.fechaPago) return;
        const cliente = p.usuario?.nomApe || p.nombreCliente || "Cliente";
        movimientos.push({
            tipo: "INGRESO",
            titulo: `${cliente} — ${p.nombreMembresia || "Membresía"}`,
            fecha: p.fechaPago.substring(0, 10),
            monto: Number(p.costoTotal || 0)
        });
    });

    // Normalizar egresos pagados
    comprobantes.forEach((c) => {
        if (c.estado !== "Pagado" || !c.fechaDelComprobante) return;
        movimientos.push({
            tipo: "EGRESO",
            titulo: `${c.descripcion || "Gasto"} (${c.nombreCatGasto || "General"})`,
            fecha: c.fechaDelComprobante,
            monto: Number(c.monto || 0)
        });
    });

    // Ordenar por fecha más reciente y tomar los últimos 6
    movimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const recientes = movimientos.slice(0, 6);

    if (recientes.length === 0) {
        contenedor.innerHTML = `<p style="padding: 20px; color: var(--muted); font-size: 0.875rem;">No hay movimientos financieros registrados.</p>`;
        return;
    }

    contenedor.innerHTML = recientes.map((m) => {
        const esIngreso = m.tipo === "INGRESO";
        const signo = esIngreso ? "+" : "-";
        const colorMonto = esIngreso ? "var(--success, #16a34a)" : "#ef4444";
        const etiqueta = esIngreso ? "COBRO" : "GASTO";
        const fechaFormat = m.fecha.split("-").reverse().join("/");

        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 1px solid var(--line); gap: 12px;">
                <div style="min-width: 0;">
                    <strong style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.9rem;">
                        ${m.titulo}
                    </strong>
                    <small style="color: var(--muted); font-size: 0.78rem;">
                        ${etiqueta} · ${fechaFormat}
                    </small>
                </div>
                <strong style="color: ${colorMonto}; white-space: nowrap; font-size: 0.95rem;">
                    ${signo}${formateadorMoneda.format(m.monto)}
                </strong>
            </div>
        `;
    }).join("");
}

function renderizarDistribucionPlanes(pagos) {
    const contenedor = document.querySelector("[data-distribucion-planes]");
    const activas = pagos.filter((p) => p.estado === "ACTIVO");

    if (activas.length === 0) {
        contenedor.innerHTML = `<p style="padding: 20px; color: var(--muted); font-size: 0.875rem;">No hay membresías activas actualmente.</p>`;
        return;
    }

    // Agrupar por nombre de membresía
    const conteo = {};
    activas.forEach((p) => {
        const nombre = p.nombreMembresia || "Plan Base";
        conteo[nombre] = (conteo[nombre] || 0) + 1;
    });

    // Ordenar de mayor a menor cantidad de socios
    const ranking = Object.entries(conteo).sort((a, b) => b[1] - a[1]);
    const total = activas.length;

    contenedor.innerHTML = ranking.map(([nombre, cantidad]) => {
        const porcentaje = Math.round((cantidad / total) * 100);

        return `
            <div style="padding: 12px 20px; border-bottom: 1px solid var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 0.875rem;">
                    <strong>${nombre}</strong>
                    <span style="color: var(--muted);">${cantidad} (${porcentaje}%)</span>
                </div>
                <div style="width: 100%; height: 6px; background: #e5e7eb; border-radius: 999px; overflow: hidden;">
                    <div style="width: ${porcentaje}%; height: 100%; background: var(--lime); border-radius: 999px;"></div>
                </div>
            </div>
        `;
    }).join("");
}