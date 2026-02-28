"use client"

import { ProfileContent } from "@/components/shared/profile-content";
import { useAuth } from "@/lib/auth-context";
import { useLoader } from "@/lib/spinnerService";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function MantenimientoProfile() {
  const { user, isLoading } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  // 1. Sincronización con el Spinner Service (Texto en el medio de la pantalla)
  useEffect(() => {
    if (isLoading) {
      showLoader("Cargando perfil técnico...");
    } else {
      hideLoader();
    }
    return () => hideLoader();
  }, [isLoading, showLoader, hideLoader]);

  // 2. LA CLAVE: El "Guard" visual. 
  // Si no hay usuario o el context está cargando, mostramos el loader centrado.
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          {/* Usamos AZUL para mantenimiento para diferenciarlo de Nutri y Prof */}
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
            Sincronizando credenciales...
          </p>
        </div>
      </div>
    );
  }

  // 3. Renderizado final una vez que user existe
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