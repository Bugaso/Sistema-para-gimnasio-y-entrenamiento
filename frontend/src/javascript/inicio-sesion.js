import "../css/index/index.css"
import { getToken, login, saveToken } from "./api.js"

const form = document.querySelector("[data-login-form]")
const identifier = document.querySelector("#identifier")
const password = document.querySelector("#login-password")
const passwordToggle = document.querySelector("[data-password-toggle]")
const authError = document.querySelector("[data-auth-error]")
const authErrorTitle = authError?.querySelector("strong")
const authErrorMessage = authError?.querySelector("[data-auth-error-message]")
const submitButton = form?.querySelector('button[type="submit"]')
const submitLabel = submitButton?.innerHTML

const setFieldError = (field, message) => {
  const error = document.querySelector(
    `#${field.id === "identifier" ? "identifier-error" : "password-error"}`,
  )
  field.setAttribute("aria-invalid", String(Boolean(message)))
  if (error) error.textContent = message
}

const isValidIdentifier = (value) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(value)
}

const validateIdentifier = () => {
  const value = identifier.value.trim()
  let message = ""

  if (!value) {
    message = "Introduce tu email."
  } else if (!isValidIdentifier(value)) {
    message = "El email introducido no tiene un formato válido."
  }

  setFieldError(identifier, message)
  return !message
}

const validatePassword = () => {
  const value = password.value
  let message = ""

  if (!value) {
    message = "Introduce tu contraseña."
  } else if (value.length < 8) {
    message = "La contraseña debe tener al menos 8 caracteres."
  }

  setFieldError(password, message)
  return !message
}

passwordToggle?.addEventListener("click", () => {
  const isVisible = password.type === "text"
  password.type = isVisible ? "password" : "text"
  passwordToggle.textContent = isVisible ? "Mostrar" : "Ocultar"
  passwordToggle.setAttribute(
    "aria-label",
    isVisible ? "Mostrar contraseña" : "Ocultar contraseña",
  )
  passwordToggle.setAttribute("aria-pressed", String(!isVisible))
})

identifier?.addEventListener("blur", validateIdentifier)
password?.addEventListener("blur", validatePassword)

identifier?.addEventListener("input", () => {
  if (identifier.getAttribute("aria-invalid") === "true") validateIdentifier()
  authError?.setAttribute("hidden", "")
})

password?.addEventListener("input", () => {
  if (password.getAttribute("aria-invalid") === "true") validatePassword()
  authError?.setAttribute("hidden", "")
})

form?.addEventListener("submit", async (event) => {
  event.preventDefault()
  const identifierIsValid = validateIdentifier()
  const passwordIsValid = validatePassword()

  if (!identifierIsValid || !passwordIsValid) {
    form.querySelector('[aria-invalid="true"]')?.focus()
    return
  }

  if (submitButton) {
    submitButton.disabled = true
    submitButton.textContent = "Iniciando sesión…"
  }
  authError?.setAttribute("hidden", "")

  try {
    const response = await login(
      identifier.value.trim().toLowerCase(),
      password.value,
    )

    if (!response?.token) {
      throw new Error("El servidor no devolvió un token de acceso.")
    }

    const remember = form.elements.namedItem("remember")?.checked
    saveToken(response.token, remember)
    window.location.href = "/"
  } catch (error) {
    if (authErrorTitle) {
      authErrorTitle.textContent =
        error.status === 401 || error.status === 403
          ? "Email o contraseña incorrectos."
          : "No pudimos iniciar tu sesión."
    }
    if (authErrorMessage) {
      authErrorMessage.textContent =
        error.status === 401 || error.status === 403
          ? "Revisa tus datos e inténtalo de nuevo."
          : error.message || "Inténtalo de nuevo en unos minutos."
    }
    authError?.removeAttribute("hidden")
    password.setAttribute("aria-invalid", "true")
    password.focus()
  } finally {
    if (submitButton) {
      submitButton.disabled = false
      submitButton.innerHTML = submitLabel
    }
  }
})

if (getToken()) window.location.replace("/")
