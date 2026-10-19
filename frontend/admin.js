import "./admin.css"
import "./src/api.js"
import { apiRequest, clearToken, getProfile, getToken } from "./src/api.js"

const ENDPOINTS = {
    roles: "/admin/roles",
    personnel: "/endpoint/personal",
}

const USE_MOCKS = import.meta.env.VITE_ADMIN_MOCKS !== "false"
const MOCK_STORAGE_KEY = "atlas_admin_mock_data"
const delay = (duration = 220) =>
    new Promise((resolve) => setTimeout(resolve, duration))

const initialData = {
    roles: [
        {
            id: 0,
            name: "Admin",
            permissions: 0,
            status: "ACTIVO",
        },
        {
            id: 2,
            name: "Entrenador",
            description: "Seguimiento de clientes, rutinas y progreso.",
            permissions: ["usuarios", "rutinas"],
            status: "Activo",
        },
        {
            id: 3,
            name: "Recepcionista",
            description: "Altas, pagos, membresías y atención diaria.",
            permissions: ["usuarios", "membresias"],
            status: "Activo",
        },
    ],
    personnel: [
        {
            id: 1,
            nomApe: "Laura Méndez",
            mailUs: "laura@atlasgym.com",
            dniUs: "36580142",
            telUs: "1156209841",
            roleId: 2,
            status: "Activo",
            createdAt: "2026-03-10",
        },
        {
            id: 2,
            nomApe: "Marco Silva",
            mailUs: "marco@atlasgym.com",
            dniUs: "34220871",
            telUs: "1144851370",
            roleId: 2,
            status: "Activo",
            createdAt: "2026-02-21",
        },
        {
            id: 3,
            nomApe: "Camila Torres",
            mailUs: "camila@atlasgym.com",
            dniUs: "38992146",
            telUs: "1169047721",
            roleId: 3,
            status: "Activo",
            createdAt: "2026-03-18",
        },
        {
            id: 4,
            nomApe: "Nicolás Ríos",
            mailUs: "nicolas@atlasgym.com",
            dniUs: "40117762",
            telUs: "1124503966",
            roleId: 2,
            status: "Inactivo",
            createdAt: "2026-01-15",
        },
    ],
}

const clone = (value) => JSON.parse(JSON.stringify(value))

const readMockData = () => {
    const stored = localStorage.getItem(MOCK_STORAGE_KEY)
    if (!stored) {
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initialData))
        return clone(initialData)
    }
    try {
        return JSON.parse(stored)
    } catch {
        return clone(initialData)
    }
}

const writeMockData = (data) =>
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data))

const mockRequest = async (resource, method = "GET", payload, id) => {
    await delay()
    const database = readMockData()
    const collection = database[resource]

    if (method === "GET") return clone(collection)
    if (method === "POST") {
        const record = {
            ...payload,
            id: Date.now(),
            createdAt: new Date().toISOString().slice(0, 10),
        }
        collection.push(record)
        writeMockData(database)
        return clone(record)
    }

    const index = collection.findIndex((item) => String(item.id) === String(id))
    if (index === -1) throw new Error("No se encontró el registro solicitado.")

    if (method === "PUT") {
        collection[index] = {
            ...collection[index],
            ...payload,
            id: collection[index].id,
        }
        writeMockData(database)
        return clone(collection[index])
    }

    if (method === "DELETE") {
        collection.splice(index, 1)
        writeMockData(database)
        return null
    }
}

const adminRequest = (resource, method = "GET", payload, id) => {
    if (USE_MOCKS) return mockRequest(resource, method, payload, id)

    const path = `${ENDPOINTS[resource]}${id ? `/${id}` : ""}`
    return apiRequest(path, {
        method,
        token: getToken(),
        ...(payload ? { body: JSON.stringify(payload) } : {}),
    })
}

const state = {
    roles: [],
    personnel: [],
    roleSearch: "",
    personnelSearch: "",
    roleFilter: "",
    pendingDelete: null,
}

const elements = {
    access: document.querySelector("[data-access-message]"),
    accessCopy: document.querySelector("[data-access-copy]"),
    accessAction: document.querySelector("[data-access-action]"),
    shell: document.querySelector("[data-admin-shell]"),
    roleTable: document.querySelector("[data-role-table]"),
    personnelTable: document.querySelector("[data-personnel-table]"),
    recentPersonnel: document.querySelector("[data-recent-personnel]"),
    roleSummary: document.querySelector("[data-role-summary]"),
    roleDialog: document.querySelector("[data-role-dialog]"),
    personnelDialog: document.querySelector("[data-personnel-dialog]"),
    confirmDialog: document.querySelector("[data-confirm-dialog]"),
    roleForm: document.querySelector("[data-role-form]"),
    personnelForm: document.querySelector("[data-personnel-form]"),
    roleFilter: document.querySelector("[data-role-filter]"),
    toast: document.querySelector("[data-toast]"),
}

const escapeHtml = (value = "") =>
    String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")

const getInitials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()

const getRole = (roleId) =>
    state.roles.find((role) => String(role.id) === String(roleId))

const hasAdminRole = (token) => {
    try {
        const payload = JSON.parse(
            atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
        )
        const claims = [payload.role, payload.roles, payload.authorities]
            .flat()
            .filter(Boolean)
            .map((claim) =>
                typeof claim === "string" ? claim : claim.authority || claim.name,
            )
        return claims.some((claim) => String(claim).toUpperCase().includes("ADMIN"))
    } catch {
        return false
    }
}

const showToast = (message) => {
    elements.toast.textContent = message
    elements.toast.hidden = false
    window.clearTimeout(showToast.timeout)
    showToast.timeout = window.setTimeout(() => {
        elements.toast.hidden = true
    }, 3200)
}

const renderRoleOptions = () => {
    const options = state.roles
        .map(
            (role) => `<option value="${role.id}">${escapeHtml(role.name)}</option>`,
        )
        .join("")
    elements.roleFilter.innerHTML = `<option value="">Todos los roles</option>${options}`
    elements.personnelForm.elements.roleId.innerHTML = `<option value="">Seleccionar rol</option>${options}`
}

const renderMetrics = () => {
    const activePersonnel = state.personnel.filter(
        (person) => person.status === "Activo",
    )
    const trainerRole = state.roles.find((role) =>
        role.name.toLowerCase().includes("entrenador"),
    )
    document.querySelector("[data-active-count]").textContent =
        activePersonnel.length
    document.querySelector("[data-role-count]").textContent = state.roles.length
    document.querySelector("[data-trainer-count]").textContent = trainerRole
        ? activePersonnel.filter(
            (person) => String(person.roleId) === String(trainerRole.id),
        ).length
        : 0
}

const renderOverview = () => {
    const recent = [...state.personnel]
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
        .slice(0, 4)

    elements.recentPersonnel.innerHTML = recent
        .map((person) => {
            const role = getRole(person.roleId)
            return `
        <article>
          <span class="person-avatar">${escapeHtml(getInitials(person.nomApe))}</span>
          <div><strong>${escapeHtml(person.nomApe)}</strong><small>${escapeHtml(role?.name || "Sin rol")}</small></div>
          <span class="status-dot ${
                person.status === "Activo" ? "is-active" : ""
            }">${escapeHtml(person.status)}</span>
        </article>`
        })
        .join("")

    const maximum = Math.max(
        1,
        ...state.roles.map(
            (role) =>
                state.personnel.filter(
                    (person) => String(person.roleId) === String(role.id),
                ).length,
        ),
    )
    elements.roleSummary.innerHTML = state.roles
        .map((role) => {
            const count = state.personnel.filter(
                (person) => String(person.roleId) === String(role.id),
            ).length
            return `
        <article>
          <div><strong>${escapeHtml(role.name)}</strong><span>${count}</span></div>
          <div class="role-meter"><span style="width: ${(count / maximum) * 100}%"></span></div>
        </article>`
        })
        .join("")
}

const renderRoles = () => {
    const query = state.roleSearch.toLowerCase()
    const roles = state.roles.filter(
        (role) =>
            role.name.toLowerCase().includes(query) ||
            role.description.toLowerCase().includes(query),
    )

    document.querySelector("[data-role-results]").textContent =
        `${roles.length} roles`
    elements.roleTable.innerHTML = roles
        .map((role) => {
            const personnelCount = state.personnel.filter(
                (person) => String(person.roleId) === String(role.id),
            ).length
            return `
        <tr>
          <td><strong>${escapeHtml(role.name)}</strong><small>${escapeHtml(role.description)}</small></td>
          <td><span class="permission-count">${role.permissions.length}</span> permisos</td>
          <td>${personnelCount} personas</td>
          <td><span class="table-status is-active">${escapeHtml(role.status)}</span></td>
          <td>
            <div class="table-actions">
              <button type="button" data-edit-role="${role.id}">Editar</button>
              <button type="button" class="is-danger" data-delete-role="${role.id}">Eliminar</button>
            </div>
          </td>
        </tr>`
        })
        .join("")
}

const renderPersonnel = () => {
    const query = state.personnelSearch.toLowerCase()
    const people = state.personnel.filter((person) => {
        const matchesSearch = [person.nomApe, person.mailUs, person.dniUs].some(
            (value) => String(value).toLowerCase().includes(query),
        )
        const matchesRole =
            !state.roleFilter || String(person.roleId) === state.roleFilter
        return matchesSearch && matchesRole
    })

    document.querySelector("[data-personnel-results]").textContent =
        `${people.length} personas`
    elements.personnelTable.innerHTML = people
        .map((person) => {
            const role = getRole(person.roleId)
            return `
        <tr>
          <td>
            <div class="person-cell"><span class="person-avatar">${escapeHtml(getInitials(person.nomApe))}</span>
            <div><strong>${escapeHtml(person.nomApe)}</strong><small>DNI ${escapeHtml(person.dniUs)}</small></div></div>
          </td>
          <td><span class="role-label">${escapeHtml(role?.name || "Sin rol")}</span></td>
          <td><strong>${escapeHtml(person.mailUs)}</strong><small>${escapeHtml(person.telUs)}</small></td>
          <td><span class="table-status ${
                person.status === "Activo" ? "is-active" : ""
            }">${escapeHtml(person.status)}</span></td>
          <td>
            <div class="table-actions">
              <button type="button" data-edit-person="${person.id}">Editar</button>
              <button type="button" class="is-danger" data-delete-person="${person.id}">Eliminar</button>
            </div>
          </td>
        </tr>`
        })
        .join("")
}

const render = () => {
    renderRoleOptions()
    renderMetrics()
    renderOverview()
    renderRoles()
    renderPersonnel()
}

const setView = (viewName) => {
    document.querySelectorAll("[data-view]").forEach((view) => {
        view.hidden = view.dataset.view !== viewName
    })
    document.querySelectorAll("[data-view-target]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.viewTarget === viewName)
    })
    document.querySelector(".admin-sidebar").classList.remove("is-open")
    document
        .querySelector("[data-admin-menu]")
        .setAttribute("aria-expanded", "false")
}

const openRoleDialog = (role) => {
    elements.roleForm.reset()
    elements.roleForm.elements.id.value = role?.id || ""
    elements.roleForm.elements.name.value = role?.name || ""
    elements.roleForm.elements.description.value = role?.description || ""
    elements.roleForm.querySelector("[data-role-dialog-title]").textContent = role
        ? "Editar rol"
        : "Crear rol"
    elements.roleForm.querySelector("[data-role-kicker]").textContent = role
        ? "Actualizar perfil"
        : "Nuevo perfil"
    elements.roleForm.querySelector("[data-role-form-status]").textContent = ""
    role?.permissions.forEach((permission) => {
        const input = elements.roleForm.querySelector(`[value="${permission}"]`)
        if (input) input.checked = true
    })
    elements.roleDialog.showModal()
}

const openPersonnelDialog = (person) => {
    elements.personnelForm.reset()
    renderRoleOptions()
    ;["id", "nomApe", "mailUs", "dniUs", "telUs", "roleId", "status"].forEach(
        (field) => {
            elements.personnelForm.elements[field].value = person?.[field] || ""
        },
    )
    elements.personnelForm.elements.password.required = !person
    elements.personnelForm.querySelector(
        "[data-personnel-dialog-title]",
    ).textContent = person ? "Editar personal" : "Añadir personal"
    elements.personnelForm.querySelector("[data-personnel-kicker]").textContent =
        person ? "Actualizar integrante" : "Nuevo integrante"
    elements.personnelForm.querySelector(
        "[data-personnel-form-status]",
    ).textContent = ""
    elements.personnelDialog.showModal()
}

const requestDelete = (resource, id, name) => {
    state.pendingDelete = { resource, id }
    document.querySelector("[data-confirm-copy]").textContent =
        `Se eliminará “${name}”. Esta acción no se puede deshacer.`
    elements.confirmDialog.showModal()
}

const loadData = async () => {
    ;[state.roles, state.personnel] = await Promise.all([
        adminRequest("roles"),
        adminRequest("personnel"),
    ])
    render()
}

document.querySelectorAll("[data-view-target]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.viewTarget))
})

document
    .querySelector("[data-admin-menu]")
    .addEventListener("click", (event) => {
        const open = event.currentTarget.getAttribute("aria-expanded") === "true"
        event.currentTarget.setAttribute("aria-expanded", String(!open))
        document.querySelector(".admin-sidebar").classList.toggle("is-open", !open)
    })

document
    .querySelectorAll("[data-open-role]")
    .forEach((button) => button.addEventListener("click", () => openRoleDialog()))
document
    .querySelectorAll("[data-open-personnel]")
    .forEach((button) =>
        button.addEventListener("click", () => openPersonnelDialog()),
    )
document
    .querySelectorAll("[data-close-dialog]")
    .forEach((button) =>
        button.addEventListener("click", () => button.closest("dialog").close()),
    )

document
    .querySelector("[data-role-search]")
    .addEventListener("input", (event) => {
        state.roleSearch = event.target.value
        renderRoles()
    })
document
    .querySelector("[data-personnel-search]")
    .addEventListener("input", (event) => {
        state.personnelSearch = event.target.value
        renderPersonnel()
    })
elements.roleFilter.addEventListener("change", (event) => {
    state.roleFilter = event.target.value
    renderPersonnel()
})

elements.roleTable.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-role]")
    const deleteButton = event.target.closest("[data-delete-role]")
    if (editButton) {
        openRoleDialog(
            state.roles.find(
                (role) => String(role.id) === editButton.dataset.editRole,
            ),
        )
    }
    if (deleteButton) {
        const role = state.roles.find(
            (item) => String(item.id) === deleteButton.dataset.deleteRole,
        )
        requestDelete("roles", role.id, role.name)
    }
})

elements.personnelTable.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-person]")
    const deleteButton = event.target.closest("[data-delete-person]")
    if (editButton) {
        openPersonnelDialog(
            state.personnel.find(
                (person) => String(person.id) === editButton.dataset.editPerson,
            ),
        )
    }
    if (deleteButton) {
        const person = state.personnel.find(
            (item) => String(item.id) === deleteButton.dataset.deletePerson,
        )
        requestDelete("personnel", person.id, person.nomApe)
    }
})

elements.roleForm.addEventListener("submit", async (event) => {
    event.preventDefault()
    const formData = new FormData(elements.roleForm)
    const id = formData.get("id")
    const payload = {
        name: formData.get("name").trim(),
        description: formData.get("description").trim(),
        permissions: formData.getAll("permissions"),
        status: "Activo",
    }
    const status = elements.roleForm.querySelector("[data-role-form-status]")
    status.textContent = "Guardando cambios…"
    try {
        await adminRequest("roles", id ? "PUT" : "POST", payload, id)
        await loadData()
        elements.roleDialog.close()
        showToast(
            id ? "Rol actualizado correctamente." : "Rol creado correctamente.",
        )
    } catch (error) {
        status.textContent = error.message || "No se pudo guardar el rol."
    }
})

elements.personnelForm.addEventListener("submit", async (event) => {
    event.preventDefault()
    const formData = new FormData(elements.personnelForm)
    const id = formData.get("id")
    const payload = {
        nomApe: formData.get("nomApe").trim(),
        mailUs: formData.get("mailUs").trim().toLowerCase(),
        dniUs: formData.get("dniUs").replace(/\D/g, ""),
        telUs: formData.get("telUs").replace(/\D/g, ""),
        roleId: Number(formData.get("roleId")),
        status: formData.get("status"),
        ...(formData.get("password") ? { password: formData.get("password") } : {}),
    }
    const status = elements.personnelForm.querySelector(
        "[data-personnel-form-status]",
    )
    status.textContent = "Guardando cambios…"
    try {
        await adminRequest("personnel", id ? "PUT" : "POST", payload, id)
        await loadData()
        elements.personnelDialog.close()
        showToast(
            id
                ? "Personal actualizado correctamente."
                : "Personal añadido correctamente.",
        )
    } catch (error) {
        status.textContent = error.message || "No se pudo guardar el registro."
    }
})

document
    .querySelector("[data-confirm-delete]")
    .addEventListener("click", async () => {
        if (!state.pendingDelete) return
        const { resource, id } = state.pendingDelete
        try {
            await adminRequest(resource, "DELETE", null, id)
            await loadData()
            elements.confirmDialog.close()
            state.pendingDelete = null
            showToast("Registro eliminado correctamente.")
        } catch (error) {
            elements.confirmDialog.close()
            showToast(error.message || "No se pudo eliminar el registro.")
        }
    })

document.querySelector("[data-logout]").addEventListener("click", () => {
    clearToken()
    window.location.href = "/inicio-sesion.html"
})

const initialize = async () => {
    const token = getToken()
    if (!token) {
        elements.accessCopy.textContent =
            "Inicia sesión con una cuenta de administrador para continuar."
        elements.accessAction.hidden = false
        return
    }
    if (!hasAdminRole(token)) {
        elements.accessCopy.textContent =
            "Tu cuenta no tiene permisos para acceder a esta sección."
        elements.accessAction.hidden = false
        return
    }

    try {
        if (token) {
            const profile = await getProfile(token).catch(() => null)
            if (profile?.nomApe) {
                document.querySelector("[data-admin-name]").textContent = profile.nomApe
                document.querySelector("[data-admin-initials]").textContent =
                    getInitials(profile.nomApe)
            }
        }
        await loadData()
        elements.access.hidden = true
        elements.shell.hidden = false
    } catch (error) {
        elements.accessCopy.textContent =
            error.message || "No fue posible cargar el panel."
        elements.accessAction.hidden = false
    }
}

initialize()
