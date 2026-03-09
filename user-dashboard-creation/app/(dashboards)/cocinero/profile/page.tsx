// profile/page.tsx - versión simplificada
"use client"

import { ProfileContent } from "@/components/shared/profile-content";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export default function CocineroProfile() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
            Obteniendo datos de cocina...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-10 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold text-foreground">Mi Perfil de Cocina</h1>
          <p className="text-sm text-muted-foreground">Gestiona tus datos de acceso y preferencias.</p>
        </div>
        <ProfileContent user={user} />
      </div>
    </main>
  );
}