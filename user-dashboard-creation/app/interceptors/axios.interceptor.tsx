import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL
});

// Interceptor de Petición: Envía el token si existe
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor de Respuesta: Maneja el error 401 (Sesión expirada)
api.interceptors.response.use(
  (response) => response, // Si la respuesta es OK, solo la pasamos
  async (error) => {
    // Si el error es 401 (No autorizado), significa que el token no sirve
    if (error.response?.status === 401) {
      console.warn("Sesión expirada o token inválido. Redirigiendo al login...");
      
      // Limpiamos los datos del usuario
      localStorage.removeItem("authToken");
      // Si usas el AuthContext, aquí también deberías resetearlo, pero
      // esta redirección forzada limpiará el estado de la app:
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;