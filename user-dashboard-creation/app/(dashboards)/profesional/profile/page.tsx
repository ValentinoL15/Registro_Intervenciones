"use client"

import { ProfesionalHeader } from "@/components/profesional/profesional-header";
import { Profile } from "@/components/profesional/profile";
import { useAuth } from "@/lib/auth-context";
import { useLoader } from "@/lib/spinnerService";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  
  useEffect(() => {
    if (isLoading) {
      showLoader("Cargando perfil...");
    } else {
      hideLoader();
    }

    // Limpieza al desmontar el componente
    return () => hideLoader();
  }, [isLoading, showLoader, hideLoader]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Verificando credenciales...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ProfesionalHeader userName={`${user?.name} ${user?.lastname}`} />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="flex w-full max-w-4xl justify-center">
          <Profile user={user}/>
        </div>
      </main>
    </div>
  );
}