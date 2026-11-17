import { apiRequest, getToken, verificarAccesoRuta } from '../api.js';
import { renderCoachLayout } from '../layout-coach.js';

// Elementos DOM
const formRutina = document.getElementById('formRutina');
const tablaDetalles = document.getElementById('tablaDetalles');
const tablaListadoRutinas = document.getElementById('tablaListadoRutinas');
const btnAgregarEjercicio = document.getElementById('btnAgregarEjercicio');
const toast = document.getElementById('toast');

// Elementos Modal Buscador de Ejercicios
const modalBuscadorEjercicios = document.getElementById('modalBuscadorEjercicios');
const btnCerrarModalBuscadorEj = document.getElementById('btnCerrarModalBuscadorEj');
const filtroEjNombre = document.getElementById('filtroEjNombre');
const filtroEjMusculo = document.getElementById('filtroEjMusculo');
const filtroEjCategoria = document.getElementById('filtroEjCategoria');
const tbodyBuscadorEjercicios = document.getElementById('tbodyBuscadorEjercicios');

// Datos cacheados
let catalogoEjerciciosEnriquecido = [];
let filaEjercicioActiva = null;
let rutinaDetalleActual = null; // Para el modal de ver detalle

document.addEventListener('DOMContentLoaded', async () => {
    const tieneAcceso = await verificarAccesoRuta("/api/coach/validar", "/");
    if (!tieneAcceso) return;
    renderCoachLayout('rutinas');

    const token = getToken();
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    await cargarCatalogosEjercicios();
    await cargarTablaRutinas();

    btnAgregarEjercicio.addEventListener('click', () => agregarFilaEjercicio());
    agregarFilaEjercicio();

    // Eventos del Modal Buscador de Ejercicios
    btnCerrarModalBuscadorEj.addEventListener('click', cerrarModalBuscadorEjercicios);
    modalBuscadorEjercicios.addEventListener('click', (e) => {
        if (e.target === modalBuscadorEjercicios) cerrarModalBuscadorEjercicios();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalBuscadorEjercicios.classList.contains('active')) {
            cerrarModalBuscadorEjercicios();
        }
    });

    filtroEjNombre.addEventListener('input', aplicarFiltrosEjerciciosModal);
    filtroEjMusculo.addEventListener('change', aplicarFiltrosEjerciciosModal);
    filtroEjCategoria.addEventListener('change', aplicarFiltrosEjerciciosModal);

    // Delegación para abrir el modal al hacer clic sobre el campo Ejercicio de cualquier fila
    tablaDetalles.addEventListener('click', (e) => {
        const trigger = e.target.closest('.ej-trigger-input');
        if (trigger) {
            const fila = trigger.closest('tr');
            abrirModalBuscadorEjercicios(fila);
        }
    });

    // --- DELEGACIÓN DE EVENTOS PARA LOS BOTONES DE LA TABLA DE RUTINAS ---
    tablaListadoRutinas.addEventListener('click', async (e) => {
        const btnVer = e.target.closest('.btn-ver');
        const btnModificar = e.target.closest('.btn-modificar');
        const btnEliminar = e.target.closest('.btn-eliminar');

        if (btnVer) await verDetalleRutina(btnVer.dataset.id);
        if (btnModificar) await cargarParaModificar(btnModificar.dataset.id);
        if (btnEliminar) await eliminarRutina(btnEliminar.dataset.id);
    });

    // Cerrar modal de detalle
    document.getElementById('CerrarModal').addEventListener('click', () => {
        document.getElementById('modalDetalle').style.display = 'none';
    });

    // Cambiar día en el selector del modal de detalle
    document.getElementById('selectDiaFiltro').addEventListener('change', (e) => {
        renderizarEjerciciosPorDia(e.target.value);
    });
});

function normalizarTexto(texto) {
    return String(texto || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

// --- CARGAR EJERCICIOS + MÚSCULOS PRIMARIOS + CATEGORÍAS GENERALES ---
async function cargarCatalogosEjercicios() {
    const token = getToken();
    try {
        const [ejercicios, musculosAsociados, categorias] = await Promise.all([
            apiRequest('/api/admin/ejercicios', { token }),
            apiRequest('/api/admin/musculos-asociados', { token }).catch(() => []),
            apiRequest('/api/admin/categorias-ejercicios', { token }).catch(() => [])
        ]);

        // Mapa de idCatGen -> nombre de categoría (soporta distintas convenciones de DTO)
        const mapaCategorias = new Map();
        (categorias || []).forEach(c => {
            const idCat = c.idCatGen ?? c.idCategoria ?? c.id;
            const nomCat = c.nomCatGen ?? c.nombreCategoria ?? c.nombre ?? '';
            if (idCat != null && nomCat) {
                mapaCategorias.set(Number(idCat), nomCat);
            }
        });

        // Mapa de idEjercicio -> lista de grupos musculares primarios
        const mapaMusculosPrimarios = new Map();
        (musculosAsociados || []).forEach(rel => {
            const prioridad = normalizarTexto(rel.prioridadMusc);
            if (prioridad === 'primario') {
                const idEj = Number(rel.idEjercicio);
                if (!mapaMusculosPrimarios.has(idEj)) {
                    mapaMusculosPrimarios.set(idEj, []);
                }
                if (rel.nombreGrupo && !mapaMusculosPrimarios.get(idEj).includes(rel.nombreGrupo)) {
                    mapaMusculosPrimarios.get(idEj).push(rel.nombreGrupo);
                }
            }
        });

        catalogoEjerciciosEnriquecido = (ejercicios || []).map(ej => {
            const idEj = Number(ej.idEjercicio);
            const nombreEjercicio = ej.nomEjercicio || ej.nombre || '';
            const idCat = ej.idCatGen ?? ej.catGenEjer?.idCatGen ?? ej.categoria?.idCatGen;
            const nombreCategoria =
                ej.nomCatGen ||
                ej.nombreCategoria ||
                ej.catGenEjer?.nomCatGen ||
                (idCat != null ? mapaCategorias.get(Number(idCat)) : '') ||
                'Sin categoría';

            const musculosPrimarios = mapaMusculosPrimarios.get(idEj) || [];

            return {
                idEjercicio: idEj,
                nombre: nombreEjercicio,
                categoria: nombreCategoria,
                musculosPrimarios
            };
        });

        poblarSelectoresFiltroModal(categorias || [], musculosAsociados || []);
        renderizarTablaBuscadorEjercicios(catalogoEjerciciosEnriquecido);

    } catch (error) {
        console.warn("No se pudieron cargar los catálogos de ejercicios.", error);
        tbodyBuscadorEjercicios.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#ef4444;">Error al cargar ejercicios.</td></tr>';
    }
}

function poblarSelectoresFiltroModal(categorias, musculosAsociados) {
    // 1. Select de Categorías Generales
    const setCategorias = new Set();
    categorias.forEach(c => {
        const nom = c.nomCatGen ?? c.nombreCategoria ?? c.nombre;
        if (nom) setCategorias.add(nom);
    });
    catalogoEjerciciosEnriquecido.forEach(ej => {
        if (ej.categoria && ej.categoria !== 'Sin categoría') setCategorias.add(ej.categoria);
    });

    filtroEjCategoria.innerHTML = '<option value="">Todas las categorías</option>';
    Array.from(setCategorias).sort().forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        filtroEjCategoria.appendChild(opt);
    });

    // 2. Select de Grupos Musculares Primarios
    const setMusculos = new Set();
    musculosAsociados.forEach(rel => {
        if (normalizarTexto(rel.prioridadMusc) === 'primario' && rel.nombreGrupo) {
            setMusculos.add(rel.nombreGrupo);
        }
    });

    filtroEjMusculo.innerHTML = '<option value="">Todos los músculos</option>';
    Array.from(setMusculos).sort().forEach(musc => {
        const opt = document.createElement('option');
        opt.value = musc;
        opt.textContent = musc;
        filtroEjMusculo.appendChild(opt);
    });
}

// --- LÓGICA DEL MODAL BUSCADOR DE EJERCICIOS ---
function abrirModalBuscadorEjercicios(fila) {
    filaEjercicioActiva = fila;
    filtroEjNombre.value = '';
    filtroEjMusculo.value = '';
    filtroEjCategoria.value = '';
    renderizarTablaBuscadorEjercicios(catalogoEjerciciosEnriquecido);
    modalBuscadorEjercicios.classList.add('active');
    setTimeout(() => filtroEjNombre.focus(), 50);
}

function cerrarModalBuscadorEjercicios() {
    modalBuscadorEjercicios.classList.remove('active');
    filaEjercicioActiva = null;
}

function aplicarFiltrosEjerciciosModal() {
    const queryNombre = normalizarTexto(filtroEjNombre.value);
    const musculoSel = filtroEjMusculo.value;
    const categoriaSel = filtroEjCategoria.value;

    const filtrados = catalogoEjerciciosEnriquecido.filter(ej => {
        const coincideNombre = !queryNombre || normalizarTexto(ej.nombre).includes(queryNombre);
        const coincideMusculo = !musculoSel || ej.musculosPrimarios.includes(musculoSel);
        const coincideCategoria = !categoriaSel || ej.categoria === categoriaSel;
        return coincideNombre && coincideMusculo && coincideCategoria;
    });

    renderizarTablaBuscadorEjercicios(filtrados);
}

function renderizarTablaBuscadorEjercicios(lista) {
    tbodyBuscadorEjercicios.innerHTML = '';

    if (!lista || lista.length === 0) {
        tbodyBuscadorEjercicios.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #666; padding: 20px;">No se encontraron ejercicios con los filtros aplicados.</td></tr>';
        return;
    }

    lista.forEach(ej => {
        const tr = document.createElement('tr');
        const musculosHtml = ej.musculosPrimarios.length > 0
            ? ej.musculosPrimarios.map(m => `<span class="badge-musculo">${m}</span>`).join('')
            : '<span style="color: #999; font-size: 0.85rem;">-</span>';

        tr.innerHTML = `
            <td><strong>${ej.nombre}</strong></td>
            <td>${musculosHtml}</td>
            <td>${ej.categoria}</td>
            <td style="text-align: center;">
                <button type="button" class="admin-primary-action btn-seleccionar-ej" style="min-height: 32px; padding: 0 14px; font-size: 0.75rem;">
                    Seleccionar
                </button>
            </td>
        `;

        tr.querySelector('.btn-seleccionar-ej').addEventListener('click', () => {
            if (filaEjercicioActiva) {
                filaEjercicioActiva.querySelector('.ej-sel').value = ej.idEjercicio;
                filaEjercicioActiva.querySelector('.ej-trigger-input').value = ej.nombre;
            }
            cerrarModalBuscadorEjercicios();
        });

        tbodyBuscadorEjercicios.appendChild(tr);
    });
}

// --- CARGAR TABLA DE RUTINAS ---
async function cargarTablaRutinas() {
    try {
        const rutinas = await apiRequest('/api/coach/rutina/listado', { token: getToken() });
        tablaListadoRutinas.innerHTML = '';

        if (rutinas.length === 0) {
            tablaListadoRutinas.innerHTML = '<tr><td colspan="5">No hay rutinas registradas.</td></tr>';
            return;
        }

        rutinas.forEach(r => {
            const tipoRutina = r.esPlantilla ?
                '<span style="color: var(--lime); font-weight: bold;">Plantilla General</span>' :
                '<span style="color: #666;">Personalizada</span>';

            const estiloBotonBase = "background: transparent; border: 1px solid #d1d5d2; color: #555; padding: 6px 12px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.5px; cursor: pointer; border-radius: 4px; transition: all 0.2s;";
            const estiloVer = estiloBotonBase + " margin-right: 8px;";
            const estiloModificar = estiloBotonBase + " margin-right: 8px; border-color: var(--lime); color: var(--lime);";
            const estiloEliminarHover = "onmouseover=\"this.style.borderColor='#ef7e64'; this.style.color='#ef7e64'\" onmouseout=\"this.style.borderColor='#d1d5d2'; this.style.color='#555'\"";

            tablaListadoRutinas.innerHTML += `
                <tr>
                    <td><strong>${r.nombreRutina}</strong></td>
                    <td>${r.descripcion || '-'}</td>
                    <td>${tipoRutina}</td>
                    <td>${r.fechaCreacion || '-'}</td>
                    <td style="display: flex; gap: 8px;">
                        <button type="button" class="btn-ver" data-id="${r.idRutina}" style="${estiloVer}" onmouseover="this.style.background='#f7f9f9'" onmouseout="this.style.background='transparent'">VER</button>
                        <button type="button" class="btn-modificar" data-id="${r.idRutina}" style="${estiloModificar}" onmouseover="this.style.background='rgb(217 4 41 / 5%'" onmouseout="this.style.background='transparent'">MODIFICAR</button>
                        <button type="button" class="btn-eliminar" data-id="${r.idRutina}" style="${estiloBotonBase}" ${estiloEliminarHover}>ELIMINAR</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tablaListadoRutinas.innerHTML = '<tr><td colspan="5">Error al cargar las rutinas.</td></tr>';
        console.error(error);
    }
}

// --- LÓGICA DEL MODAL "VER" ---
async function verDetalleRutina(id) {
    try {
        const rutina = await apiRequest(`/api/coach/rutina/${id}`, { token: getToken() });
        rutinaDetalleActual = rutina;

        document.getElementById('modalTituloRutina').textContent = rutina.nombreRutina;
        document.getElementById('modalDescRutina').textContent = rutina.descripcion || 'Sin descripción';
        document.getElementById('modalTipoRutina').innerHTML = rutina.esPlantilla ?
            'Tipo: <span style="color: var(--lime);">Plantilla General</span>' :
            'Tipo: <span style="color: #666;">Personalizada</span>';

        const diasDisponibles = [...new Set(rutina.detalles.map(d => d.diaSemana))];
        const selectDia = document.getElementById('selectDiaFiltro');
        selectDia.innerHTML = '';

        if (diasDisponibles.length === 0) {
            selectDia.innerHTML = '<option value="">Sin días registrados</option>';
            document.getElementById('tablaModalDetalles').innerHTML = '<tr><td colspan="7">No hay ejercicios asignados.</td></tr>';
        } else {
            diasDisponibles.forEach(dia => {
                selectDia.innerHTML += `<option value="${dia}">${dia}</option>`;
            });
            renderizarEjerciciosPorDia(diasDisponibles[0]);
        }

        document.getElementById('modalDetalle').style.display = 'flex';
    } catch (error) {
        alert('Error al cargar el detalle de la rutina.');
        console.error(error);
    }
}

function renderizarEjerciciosPorDia(diaSeleccionado) {
    const tbodyModal = document.getElementById('tablaModalDetalles');
    tbodyModal.innerHTML = '';

    const ejerciciosFiltrados = rutinaDetalleActual.detalles.filter(d => d.diaSemana === diaSeleccionado);

    if (ejerciciosFiltrados.length === 0) {
        tbodyModal.innerHTML = `<tr><td colspan="7">No hay ejercicios para el día ${diaSeleccionado}.</td></tr>`;
        return;
    }

    ejerciciosFiltrados.forEach(d => {
        let minutosTexto = '-';
        if (d.tiempoEstimado) {
            const partes = d.tiempoEstimado.split(':');
            minutosTexto = ((parseInt(partes[0]) * 60) + parseInt(partes[1])) + ' min';
        }

        tbodyModal.innerHTML += `
            <tr>
                <td><strong>${d.nombreEjercicio}</strong></td>
                <td>${d.rangoSeries || '-'}</td>
                <td>${d.rangoRep || '-'}</td>
                <td>${d.rangoPeso || '-'}</td>
                <td>${d.medidaEsfuerzo || '-'}</td>
                <td>${d.cantMedida || '-'}</td>
                <td>${minutosTexto}</td>
            </tr>
        `;
    });
}

// --- CREAR HTML DE FILA DE EJERCICIO ---
function crearElementoFilaEjercicio(detalle = null) {
    const tr = document.createElement('tr');
    const dia = detalle?.diaSemana || 'Lunes';
    const esfuerzo = detalle?.medidaEsfuerzo || '';

    let idEj = detalle?.idEjercicio || '';
    let nombreEj = detalle?.nombreEjercicio || '';
    if (!idEj && nombreEj) {
        const encontrado = catalogoEjerciciosEnriquecido.find(e => e.nombre === nombreEj);
        if (encontrado) idEj = encontrado.idEjercicio;
    }

    let minutosTotales = '';
    if (detalle?.tiempoEstimado) {
        const partes = detalle.tiempoEstimado.split(':');
        minutosTotales = (parseInt(partes[0]) * 60) + parseInt(partes[1]);
    }

    tr.innerHTML = `
        <td>
            <select class="table-input dia-sel" required>
                <option value="Lunes" ${dia === 'Lunes' ? 'selected' : ''}>Lunes</option>
                <option value="Martes" ${dia === 'Martes' ? 'selected' : ''}>Martes</option>
                <option value="Miércoles" ${dia === 'Miércoles' ? 'selected' : ''}>Miércoles</option>
                <option value="Jueves" ${dia === 'Jueves' ? 'selected' : ''}>Jueves</option>
                <option value="Viernes" ${dia === 'Viernes' ? 'selected' : ''}>Viernes</option>
                <option value="Sábado" ${dia === 'Sábado' ? 'selected' : ''}>Sábado</option>
                <option value="Domingo" ${dia === 'Domingo' ? 'selected' : ''}>Domingo</option>
            </select>
        </td>
        <td>
            <div class="ej-trigger-wrap">
                <input type="hidden" class="ej-sel" value="${idEj}" />
                <input type="text" class="table-input ej-trigger-input" value="${nombreEj}" placeholder="Seleccione..." readonly required />
                <span class="ej-trigger-caret" aria-hidden="true">▼</span>
            </div>
        </td>
        <td><input type="number" class="table-input ser-inp" value="${detalle?.rangoSeries || ''}" placeholder="Ej: 4" min="1" max="20" required /></td>
        <td><input type="text" class="table-input rep-inp" value="${detalle?.rangoRep || ''}" placeholder="Ej: 8-12" required /></td>
        <td><input type="number" class="table-input pes-inp" value="${detalle?.rangoPeso || ''}" placeholder="Ej: 20" min="0" step="any" /></td>
        <td>
            <select class="table-input esf-sel">
                <option value="">N/A</option>
                <option value="RIR" ${esfuerzo === 'RIR' ? 'selected' : ''}>RIR</option>
                <option value="RPE" ${esfuerzo === 'RPE' ? 'selected' : ''}>RPE</option>
            </select>
        </td>
        <td><input type="number" class="table-input cant-esf-inp" value="${detalle?.cantMedida || ''}" min="0" max="10" placeholder="Ej: 2" /></td>
        <td><input type="number" class="table-input tiempo-inp" value="${minutosTotales}" min="1" max="180" placeholder="Ej: 15" /></td>
        <td>
            <button type="button" class="is-danger remove-btn" style="padding: 4px 10px;">X</button>
        </td>
    `;

    tr.querySelector('.remove-btn').addEventListener('click', () => tr.remove());
    return tr;
}

function agregarFilaEjercicio() {
    tablaDetalles.appendChild(crearElementoFilaEjercicio(null));
}

// --- LÓGICA PARA MODIFICAR RUTINA ---
async function cargarParaModificar(id) {
    try {
        const rutina = await apiRequest(`/api/coach/rutina/${id}`, { token: getToken() });

        document.getElementById('rutinaIdEdit').value = rutina.idRutina;
        document.getElementById('nombreRutina').value = rutina.nombreRutina;
        document.getElementById('descripcionRutina').value = rutina.descripcion || '';
        document.getElementById('esPlantilla').checked = rutina.esPlantilla;

        tablaDetalles.innerHTML = '';
        if (rutina.detalles && rutina.detalles.length > 0) {
            rutina.detalles.forEach(d => {
                tablaDetalles.appendChild(crearElementoFilaEjercicio(d));
            });
        } else {
            agregarFilaEjercicio();
        }

        document.getElementById('btnGuardarRutina').textContent = 'Actualizar Rutina';
        document.getElementById('btnCancelarEdicion').style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        alert('Error al cargar la rutina para modificar.');
        console.error(error);
    }
}

document.getElementById('btnCancelarEdicion')?.addEventListener('click', () => {
    formRutina.reset();
    document.getElementById('rutinaIdEdit').value = '';
    tablaDetalles.innerHTML = '';
    agregarFilaEjercicio();
    document.getElementById('btnGuardarRutina').textContent = 'Guardar Rutina Completa';
    document.getElementById('btnCancelarEdicion').style.display = 'none';
});

// --- ENVÍO DE FORMULARIO ---
formRutina.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('formStatusCreate');
    status.textContent = '';

    const detalles = [];
    const filas = tablaDetalles.querySelectorAll('tr');

    if (filas.length === 0) {
        status.textContent = 'Debe agregar al menos un ejercicio.';
        return;
    }

    const regexReps = /^\d+-\d+$/;

    for (let i = 0; i < filas.length; i++) {
        const fila = filas[i];
        const series = fila.querySelector('.ser-inp').value.trim();
        const reps = fila.querySelector('.rep-inp').value.trim();
        const ejercicio = fila.querySelector('.ej-sel').value;

        if (!ejercicio) {
            status.textContent = `Fila ${i + 1}: Debe seleccionar un ejercicio válido.`;
            fila.querySelector('.ej-trigger-input').focus();
            return;
        }

        if (!series || parseInt(series) <= 0) {
            status.textContent = `Fila ${i + 1}: El número de series debe ser mayor a 0.`;
            return;
        }

        if (!reps) {
            status.textContent = `Fila ${i + 1}: El campo de repeticiones no puede estar vacío.`;
            return;
        }

        if (!regexReps.test(reps)) {
            status.textContent = `Fila ${i + 1}: El formato de repeticiones debe ser estricto "xx-xx" (ej. 8-12 o 10-10).`;
            fila.querySelector('.rep-inp').focus();
            return;
        }
    }

    filas.forEach(fila => {
        const valorEsfuerzo = fila.querySelector('.esf-sel').value;
        const cantEsfuerzo = fila.querySelector('.cant-esf-inp').value;
        const tiempoMinutos = fila.querySelector('.tiempo-inp').value;

        let tiempoEstimadoFormat = null;
        if (tiempoMinutos && !isNaN(tiempoMinutos)) {
            const horas = Math.floor(tiempoMinutos / 60).toString().padStart(2, '0');
            const minutos = (tiempoMinutos % 60).toString().padStart(2, '0');
            tiempoEstimadoFormat = `${horas}:${minutos}:00`;
        }

        detalles.push({
            idEjercicio: parseInt(fila.querySelector('.ej-sel').value),
            diaSemana: fila.querySelector('.dia-sel').value,
            rangoSeries: fila.querySelector('.ser-inp').value.trim(),
            rangoRep: fila.querySelector('.rep-inp').value.trim(),
            rangoPeso: fila.querySelector('.pes-inp').value.trim() ? parseFloat(fila.querySelector('.pes-inp').value.trim()) : null,
            medidaEsfuerzo: valorEsfuerzo ? valorEsfuerzo : null,
            cantMedida: cantEsfuerzo ? parseInt(cantEsfuerzo) : null,
            tiempoEstimado: tiempoEstimadoFormat
        });
    });

    const payload = {
        nombreRutina: document.getElementById('nombreRutina').value.trim(),
        descripcion: document.getElementById('descripcionRutina').value.trim(),
        esPlantilla: document.getElementById('esPlantilla').checked,
        detalles: detalles
    };

    const idEdit = document.getElementById('rutinaIdEdit').value;
    const isUpdate = idEdit !== '';
    const url = isUpdate ? `/api/coach/rutina/actualizar/${idEdit}` : '/api/coach/rutina/crear';
    const method = isUpdate ? 'PUT' : 'POST';

    try {
        await apiRequest(url, {
            method: method,
            body: JSON.stringify(payload),
            token: getToken()
        });

        mostrarToast(isUpdate ? 'Rutina actualizada con éxito' : 'Rutina guardada con éxito');

        if (isUpdate) {
            document.getElementById('btnCancelarEdicion').click();
        } else {
            formRutina.reset();
            tablaDetalles.innerHTML = '';
            agregarFilaEjercicio();
        }

        await cargarTablaRutinas();
    } catch (error) {
        status.textContent = error.message;
    }
});

// --- UTILIDADES ---
function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.hidden = false;
    setTimeout(() => { toast.hidden = true; }, 3500);
}

// --- LÓGICA DEL MODAL DE ELIMINACIÓN ---
let idRutinaAEliminar = null;
const modalEliminar = document.getElementById('confirmDialogEliminar');
const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');

async function eliminarRutina(id) {
    idRutinaAEliminar = id;

    try {
        const rutina = await apiRequest(`/api/coach/rutina/${id}`, { token: getToken() });

        document.getElementById('modalEliminarNombre').textContent = rutina.nombreRutina;

        let fechaFormat = '-';
        if (rutina.fechaCreacion) {
            const partes = rutina.fechaCreacion.split('-');
            if (partes.length === 3) {
                fechaFormat = `${partes[2]}/${partes[1]}/${partes[0]}`;
            } else {
                fechaFormat = rutina.fechaCreacion;
            }
        }
        document.getElementById('modalEliminarFecha').textContent = fechaFormat;

        const advertencia = document.getElementById('mensajeAdvertenciaAsignacion');
        if (rutina.enUso || (rutina.asignaciones && rutina.asignaciones.length > 0)) {
            advertencia.style.display = 'block';
        } else {
            advertencia.style.display = 'none';
        }

        modalEliminar.showModal();

    } catch (error) {
        alert('Error al cargar la información de la rutina para eliminar.');
        console.error(error);
    }
}

btnCancelarEliminar.addEventListener('click', () => {
    modalEliminar.close();
    idRutinaAEliminar = null;
});

btnConfirmarEliminar.addEventListener('click', async () => {
    if (!idRutinaAEliminar) return;

    btnConfirmarEliminar.textContent = 'Eliminando...';
    btnConfirmarEliminar.disabled = true;

    try {
        await apiRequest(`/api/coach/rutina/${idRutinaAEliminar}`, { method: 'DELETE', token: getToken() });
        mostrarToast('Rutina eliminada con éxito');
        modalEliminar.close();
        await cargarTablaRutinas();
    } catch (error) {
        alert('No se pudo eliminar la rutina: ' + error.message);
    } finally {
        btnConfirmarEliminar.textContent = 'ELIMINAR RUTINA';
        btnConfirmarEliminar.disabled = false;
        idRutinaAEliminar = null;
    }
});