"use client"

import { ProfileContent } from "@/components/shared/profile-content";
import { useAuth } from "@/lib/auth-context";
import { useLoader } from "@/lib/spinnerService";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function MantenimientoProfile() {
  const { user, isLoading } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  // 1. Control del Spinner Global (Texto en pantalla)
  useEffect(() => {
    if (isLoading) {
      showLoader("Cargando perfil técnico...");
    } else {
      hideLoader();
    }

    // Limpieza al desmontar para evitar que el loader quede pegado
    return () => hideLoader();
  }, [isLoading, showLoader, hideLoader]);

  // 2. EL "GUARD" VISUAL: 
  // Si está cargando o el usuario aún no existe en el context,
  // mostramos el loader centrado para evitar el parpadeo del formulario vacío.
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          {/* Usamos AZUL para mantenimiento (coherente con su dashboard) */}
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
            Sincronizando credenciales...
          </p>
        </div>
      </div>
    );
  }

  // 3. Renderizado final: Solo ocurre cuando isLoading es false y user existe
  return (
    <main className="container mx-auto p-10 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold text-foreground">Mi Perfil Técnico</h1>
          <p className="text-sm text-muted-foreground">Gestiona tus datos de acceso y personal.</p>
        </div>
        
        {/* Pasamos el usuario verificado al componente compartido */}
        <ProfileContent user={user} />
      </div>
    </main>
  );
}