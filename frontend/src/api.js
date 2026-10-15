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
  if (typeof data === "string" && data.trim()) return data
  if (data && typeof data === "object") {
    return data.message || data.error || data.detail || fallback
  }
  return fallback
}

const request = async (path, { token, ...options } = {}) => {
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
    throw new ApiError(
      getErrorMessage(data, "El servidor no pudo completar la solicitud."),
      response.status,
    )
  }

  return data
}

export const register = (payload) =>
  request("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })

export const login = (email, password) =>
  request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

export const getProfile = (token = getToken()) =>
  request("/me", {
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
