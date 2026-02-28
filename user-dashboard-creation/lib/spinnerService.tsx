import { create } from 'zustand'; 

interface LoaderState {
  isLoading: boolean;
  message: string | null; // Nuevo campo para el texto
  showLoader: (message?: string) => void; // Acepta mensaje opcional
  hideLoader: () => void;
}

export const useLoader = create<LoaderState>((set) => ({
  isLoading: false,
  message: null,
  showLoader: (message) => set({ 
    isLoading: true, 
    message: message || "Cargando..." // Si no hay mensaje, pone uno por defecto
  }),
  hideLoader: () => set({ 
    isLoading: false, 
    message: null 
  }),
}))