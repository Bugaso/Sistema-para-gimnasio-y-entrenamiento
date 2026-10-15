import "./index.css"
import { register, saveToken } from "./api.js"

const password = document.querySelector("#password")
const passwordToggle = document.querySelector("[data-password-toggle]")
const form = document.querySelector("[data-signup-form]")
const success = document.querySelector("[data-signup-success]")
const status = document.querySelector("[data-form-status]")
const submitButton = form?.querySelector('button[type="submit"]')
const submitLabel = submitButton?.innerHTML

passwordToggle?.addEventListener("click", () => {
  if (!password) return

  const isVisible = password.type === "text"
  password.type = isVisible ? "password" : "text"
  passwordToggle.textContent = isVisible ? "Mostrar" : "Ocultar"
  passwordToggle.setAttribute(
    "aria-label",
    isVisible ? "Mostrar contraseña" : "Ocultar contraseña",
  )
  passwordToggle.setAttribute("aria-pressed", String(!isVisible))
})

form?.addEventListener("submit", async (event) => {
  event.preventDefault()

  if (!form.checkValidity()) {
    form.reportValidity()
    if (status)
      status.textContent = "Revisa los campos marcados antes de continuar."
    return
  }

  const formData = new FormData(form)
  const onlyDigits = (value) => String(value).replace(/\D/g, "")
  const dni = onlyDigits(formData.get("dni"))
  const phone = onlyDigits(formData.get("phone"))

  if (!dni || !phone) {
    if (status)
      status.textContent = "El DNI y el teléfono deben contener números."
    return
  }

  if (submitButton) {
    submitButton.disabled = true
    submitButton.textContent = "Creando cuenta…"
  }
  if (status) status.textContent = "Conectando con Atlas Gym…"

  try {
    const response = await register({
      idUsuario: Number(0),
      nomApe: `${formData.get("firstName")} ${formData.get("lastName")}`.trim(),
      fechaNacimiento: formData.get("birthDate"),
      dniUs: Number(dni),
      mailUs: String(formData.get("email")).trim().toLowerCase(),
      telUs: Number(phone),
      numContacto: String(formData.get("emergencyContact")).trim(),
      password: formData.get("password"),
      idRol: Number(1)
    })

    if (!response?.token) {
      throw new Error("El servidor no devolvió un token de acceso.")
    }

    saveToken(response.token)
    form.hidden = true
    success?.removeAttribute("hidden")
    success?.querySelector("h2")?.focus()
  } catch (error) {
    if (status) {
      status.textContent =
        error.status === 409
          ? "Ya existe una cuenta con ese email o DNI."
          : error.message || "No se pudo crear la cuenta. Inténtalo de nuevo."
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false
      submitButton.innerHTML = submitLabel
    }
  }
})
