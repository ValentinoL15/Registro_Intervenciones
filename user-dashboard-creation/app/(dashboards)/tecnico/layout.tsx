"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import { GlobalLoader } from "@/components/ui/global-loader";
import { Toaster } from "@/components/ui/toaster";
import { TecnicoHeader } from "@/components/tecnico/tecnico-header";

export default function TecnicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirigir si no está cargando y no está autenticado
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // 1. Estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Si no está autenticado, no renderizar nada mientras redirige
  if (!isAuthenticated) {
    return null;
  }

  // 3. Validar el rol específico
  if (user?.role !== "TECNICO") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">Acceso no autorizado para este rol.</p>
      </div>
    );
  }

  // 4. Renderizado final si todo está OK
  return (
    <>
      <TecnicoHeader userName={`${user.username}`}/>
      {children}
      <GlobalLoader />
      <Toaster />
    </>
  );
}