"use client"

import { ProfileContent } from "@/components/shared/profile-content";
import { useAuth } from "@/lib/auth-context";
import { useLoader } from "@/lib/spinnerService";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function NutricionistaProfile() {
  const { user, isLoading } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    // Solo mostramos el loader de texto si el context dice que está cargando
    if (isLoading) {
      showLoader("Cargando perfil de nutricionista...");
    } else {
      hideLoader();
    }
    return () => hideLoader();
  }, [isLoading, showLoader, hideLoader]);

  // ESTA ES LA CLAVE: Si no hay usuario o está cargando, 
  // mostramos el mismo loader visual que en Profesional
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-green-600" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Verificando credenciales...
          </p>
        </div>
      </div>
    );
  }

  // Solo llegamos aquí cuando isLoading es false y user existe
  return (
    <div className="min-h-screen bg-background flex flex-col">
       <main className="container mx-auto p-10 max-w-2xl animate-in fade-in duration-500">
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h1 className="text-2xl font-bold text-foreground">Mi Perfil Nutricional</h1>
            <p className="text-sm text-muted-foreground">Gestiona tus datos personales.</p>
          </div>
          <ProfileContent user={user} />
        </div>
      </main>
    </div>
  );
}