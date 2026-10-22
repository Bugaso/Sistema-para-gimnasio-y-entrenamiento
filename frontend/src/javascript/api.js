const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/$/, "")
const TOKEN_KEY = "jwt_token"

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

const getErrorMessage = (data, fallback) => {
  if (typeof data === "string" && data.trim()) {
    // Si la respuesta empieza con "<", es un HTML de error de Spring.
    // Lo bloqueamos y devolvemos el mensaje genérico.
    if (data.trim().startsWith("<")) return fallback;
    return data;
  }
  if (data && typeof data === "object") {
    return data.message || data.error || data.detail || fallback;
  }
  return fallback;
}

export const apiRequest = async (path, { token, ...options } = {}) => {
  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Comprueba que la API esté ejecutándose en localhost:8080.",
    )
  }

  const contentType = response.headers.get("content-type") || ""
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "")

  if (!response.ok) {
    // NUEVO CÓDIGO: Si el servidor responde 401 (Token expirado o inválido)
    if (response.status === 401) {
      clearToken(); // Borramos el token vencido del navegador
      window.location.href = "/inicio-sesion.html"; // Redirigimos al login
    }
    throw new ApiError(
        getErrorMessage(data, "El servidor no pudo completar la solicitud."),
        response.status,
    )
  }

  return data
}

export const register = (payload) =>
  apiRequest("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })

export const login = (email, password) =>
  apiRequest("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

export const getProfile = (token = getToken()) =>
  apiRequest("/me", {
    token,
  })

export const saveToken = (token, persistent = true) => {
  clearToken()
  const storage = persistent ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, token)
}

export const getToken = () =>
  localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}


/*****************************************************/
export const registerEmployee = (payload) =>
    apiRequest("/api/admin/empleados", {
      method: "POST",
      body: JSON.stringify(payload),
      token: getToken() // Enviamos el token automáticamente usando tu función existente
    })