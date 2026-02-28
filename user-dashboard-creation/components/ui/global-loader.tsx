"use client";

import { useLoader } from "@/lib/spinnerService";
import { Spinner } from "./spinner";

export const GlobalLoader = () => {
  // Extraemos el estado y el mensaje opcional
  const { isLoading, message } = useLoader();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="size-14 text-white" /> 
        <p className="text-lg font-semibold text-white drop-shadow-lg animate-pulse">
          {message || "Cargando..."}
        </p>
      </div>
    </div>
  );
};