import api from '@/app/interceptors/axios.interceptor';
import { AuthResponse, CreateIntervencionDto, createProfesionalDTO, EditIntervencionDto, EmailDto, GeneralResponse, IntervencionDto, User } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

async function apiCall<T>(endpoint: string, options: any = {}): Promise<T> {
  try {
    const { method = 'GET', body, headers } = options;
    
    const response = await api({
      url: endpoint,
      method: method,
      data: body ? (typeof body === 'string' ? JSON.parse(body) : body) : undefined,
      headers: headers
    });
    
    return response.data;
  } catch (error: any) {
    // Manejo de errores robusto para Spring Boot
    const status = error.response?.status;
    const responseData = error.response?.data;
    
    // VALIDAR que responseData sea JSON (no HTML)
    let parsedData: any = {};
    if (typeof responseData === 'object' && responseData !== null) {
      parsedData = responseData;
    } else if (typeof responseData === 'string') {
      // Si es HTML o string inválido, intentar parsear
      try {
        parsedData = JSON.parse(responseData);
      } catch {
        // No es JSON válido - mantener como string
        parsedData = { message: responseData };
      }
    }

    const backendError = parsedData?.message || parsedData?.error;
    const validationErrors = parsedData?.errors;

    // SANITIZAR errorMessage - asegurar que NUNCA sea undefined
    let errorMessage = "Error en la petición";
    if (backendError && typeof backendError === 'string') {
      errorMessage = backendError;
    } else if (error.message && typeof error.message === 'string' && !error.message.includes('<!')) {
      // error.message puede ser HTML, excluirlo si tiene tags
      errorMessage = error.message;
    }

    // Si hay errores de validación, construir un mensaje amigable
    let validationMessage = "";
    if (validationErrors && typeof validationErrors === 'object') {
      const errorDetails = Object.values(validationErrors)
        .flat()
        .map((v: any) => String(v))
        .join(', ');
      validationMessage = `Revise los siguientes campos: ${errorDetails}`;
      if (!errorMessage.includes(errorDetails)) {
        errorMessage = errorMessage + ` - ${errorDetails}`;
      }
    }

    // Mapear códigos HTTP a mensajes comprensibles para el usuario
    let userMessage = "Ocurrió un error. Intenta nuevamente.";
    if (!status) {
      // Problema de red o servidor inaccesible
      userMessage = "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.";
    } else if (status === 409) {
      userMessage = "El usuario o correo ya existe.";
    } else if (status === 401) {
      userMessage = "No autorizado. Por favor inicia sesión.";
    } else if (status === 403) {
      userMessage = "Acceso denegado.";
    } else if (status === 404) {
      userMessage = "Recurso no encontrado.";
    } else if (status === 422 || status === 400) {
      userMessage = validationMessage || backendError || "Datos inválidos. Revise los campos e inténtelo de nuevo.";
    } else if (status === 500) {
      userMessage = "Error del servidor. Inténtalo más tarde.";
    } else if (backendError) {
      // Si el backend envía un mensaje legible, úsalo
      userMessage = String(backendError);
    }

    console.warn("DETALLE DEL ERROR DESDE EL BACKEND:", { status, responseData, errorMessage });

    // Adjuntar información útil al error para que el caller pueda decidir qué mostrar
    // IMPORTANTE: errorMessage aquí NUNCA será undefined (está garantizado arriba)
    const errToThrow: any = new Error(errorMessage);
    errToThrow.status = status;
    errToThrow.response = parsedData;
    errToThrow.userMessage = userMessage;
    throw errToThrow;
  }
}

export const authAPI = {

    login: async (username: string, password: string): Promise<AuthResponse> => {
    // El backend acepta username (puede ser email o username)
    const response = await apiCall<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ 
        username,
        password 
      }),
    })
    
    // Extract user ID from token if needed or from response
    if (response.access_token && !response.userId) {
      try {
        const decoded = JSON.parse(atob(response.access_token.split('.')[1]))
        response.userId = decoded.sub || decoded.userId || decoded.user_id
      } catch (e) {
        console.log("Could not decode token")
      }
    }
    return response
  },

    getUser: async (userId: number): Promise<User> => {
    return apiCall<User>(`/auth/user/${userId}`, {
      method: "GET",
    })
  },
  
  requestPasswordReset: async (email: string): Promise<GeneralResponse> => {
    return apiCall<GeneralResponse>("/password/request-password-reset", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },

  resetPassword: async (token: string, password: string): Promise<GeneralResponse> => {
    return apiCall<GeneralResponse>(`/password/reset-password?token=${encodeURIComponent(token)}`, {
      method: "POST",
      body: JSON.stringify({ password }),
    })
  },

  getEmail: async(token: string): Promise<EmailDto> => {
    return apiCall<EmailDto>(`/email/verification/${token}`, {
      method: "GET",
    })
  },

}


export const profesionalApi = {
  getProfesionales: async(): Promise<User[]> => {
    return apiCall<User[]>(`/profesional`, {
      method: "GET",
    })
  },

  getProfesional: async(userId: string): Promise<User> => {
    return apiCall<User>(`/profesional/${userId}`, {
      method: "GET"
    })
  },

  /////////////////INTERVENCIONES/////////////////////

  createIntervencion: async(intervencion:CreateIntervencionDto): Promise<GeneralResponse> => {
    return apiCall<GeneralResponse>(`/intervenciones/create`, {
      method: "POST",
      body: JSON.stringify(intervencion)
    })
  },

  getIntervenciones: async(): Promise<IntervencionDto[]> => {
    return apiCall<IntervencionDto[]>(`/intervenciones`, {
      method: "GET"
    })
  },

  getIntervencion: async(intervencionId: string): Promise<IntervencionDto> => {
    return apiCall<IntervencionDto>(`/intervenciones/${intervencionId}`, {
      method: "GET"
    })
  },

  editIntervencion: async(intervencionId: string, intervencion: EditIntervencionDto): Promise<GeneralResponse> => {
    return apiCall<GeneralResponse>(`/intervenciones/edit/${intervencionId}`, {
      method: "PUT",
      body: JSON.stringify(intervencion)
    })
  },

  delteIntervencion: async(intervencionId: string): Promise<GeneralResponse> => {
    return apiCall<GeneralResponse>(`/intervenciones/${intervencionId}`, {
      method: "DELETE"
    })
  }

}

export const AdminApi = {
  getAdmin: async(userId: string): Promise<User> => {
    return apiCall<User>(`/admin/${userId}`, {
      method: "GET"
    })
  },

  getAdmins: async(): Promise<User[]> => {
    return apiCall<User[]>(`/admin`, {
      method: "GET"
    })
  },

  createProfesional: async(profesionalData: createProfesionalDTO): Promise<GeneralResponse> => {
    return apiCall<GeneralResponse>(`/admin/create-profesional`, {
      method: "POST",
      body: JSON.stringify(profesionalData)
    })
  },

  deleteProfesional: async(userId: string): Promise<GeneralResponse> => {
    return apiCall<GeneralResponse>(`/admin/delete-profesional/${userId}`, {
      method: "DELETE",
    })
  },

  altaBajaProfesional: async(userId: string): Promise<GeneralResponse> => {
    return apiCall<GeneralResponse>(`/admin/altaBaja/${userId}`, {
      method: "PUT"
    })
  }

}

export default apiCall
