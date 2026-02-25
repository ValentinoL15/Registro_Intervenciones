"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import { GlobalLoader } from "@/components/ui/global-loader";
import { Toaster } from "@/components/ui/toaster";
import { CocineroHeader } from "@/components/cocinero/cocinero-header";

export default function CocineroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si terminó de cargar y no está autenticado, al login
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // 1. Estado de carga inicial
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Protección de ruta si no hay sesión
  if (!isAuthenticated) return null;

  // 3. Validación estricta del Rol
  if (user?.role !== "COCINERO") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Acceso Denegado</h2>
        <p className="text-muted-foreground">No tienes permisos para acceder al panel de Nutricionista.</p>
        <button 
          onClick={() => router.push("/")}
          className="text-primary underline"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Reutilizamos el Header para mantener la estética */}
      <CocineroHeader userName={`${user.username}`} />
      
      {children}

      <GlobalLoader />
      <Toaster />
    </div>
  );
}