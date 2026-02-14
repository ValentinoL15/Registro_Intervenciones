"use client";

import { useLoader } from "@/lib/spinnerService";
import { Spinner } from "./spinner";

export const GlobalLoader = () => {
  const isLoading = useLoader((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/20 backdrop-blur-md transition-all">
      {/* Contenedor sin fondo ni bordes */}
      <div className="flex flex-col items-center gap-4">
        <Spinner className="size-12 text-primary" /> 
        <p className="text-sm font-medium text-white drop-shadow-md animate-pulse">
          Cargando...
        </p>
      </div>
    </div>
  );
};