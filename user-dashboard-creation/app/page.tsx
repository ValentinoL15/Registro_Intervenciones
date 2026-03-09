"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Añadimos Eye y EyeOff aquí
import { AlertCircle, Loader2, Heart, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { profesionalApi } from "@/service/api";
import Image from "next/image";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  // Estados
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Estado para el ojito
  const [emailRecovery, setEmailRecovery] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // ... (Efectos y handlers se mantienen igual)
  useEffect(() => {
    const errorType = searchParams.get("error");
    if (errorType === "session_expired") {
      setError("Sesión expirada. Por favor identifícate de nuevo.");
      const newUrl = window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const userData = await login(username, password);
      setIsRedirecting(true); 

      const role = userData?.role || localStorage.getItem("userRole");
      let targetPath = "/";

      switch (role) {
        case "ADMIN": targetPath = "/admin"; break;
        case "PROFESIONAL": targetPath = "/profesional"; break;
        case "NUTRICIONISTA": targetPath = "/nutricionista"; break;
        case "COCINERO": targetPath = "/cocinero"; break;
        case "MANTENIMIENTO": targetPath = "/mantenimiento"; break;
        case "TECNICO": targetPath = "/tecnico"; break;
        default: targetPath = "/";
      }

      router.push(targetPath);
    } catch (err: any) {
      setError(err.message || "Credenciales incorrectas");
      setIsSubmitting(false);
    }
  };

  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await profesionalApi.requestEmail(emailRecovery)
      toast({
        title: "Correo enviado",
        description: "Si el correo existe, recibirás instrucciones pronto.",
      });
      setIsForgotPassword(false);
    } catch (err: any) {
      setError("No se pudo procesar la solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">Iniciando sistema</h2>
            <p className="text-muted-foreground">Preparando tu panel de control...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative flex items-center justify-center w-24 h-24"> 
            <Image
              src="/logo-escuela.jpeg"
              alt="Logo Escuela"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Escuela los Buenos Hijos</h1>
            <p className="text-muted-foreground mt-1">Sistema de Gestión de Intervenciones</p>
          </div>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {isForgotPassword ? "Recuperar Contraseña" : "Iniciar Sesión"}
            </CardTitle>
            <CardDescription>
              {isForgotPassword 
                ? "Ingresa tu correo para recibir un enlace de acceso" 
                : "Ingresa tus credenciales para acceder al sistema"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isForgotPassword ? (
              <form onSubmit={handleRecoverPassword} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="recovery-email">Correo Electrónico</Label>
                  <Input
                    id="recovery-email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={emailRecovery}
                    onChange={(e) => setEmailRecovery(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  Enviar enlace
                </Button>
                <Button 
                  variant="ghost" 
                  type="button" 
                  onClick={() => setIsForgotPassword(false)}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver al login
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Username o Email</Label>
                  <Input
                    id="email"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Contraseña</Label>
                    <button 
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs text-primary hover:underline cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  
                  {/* CONTENEDOR DEL INPUT CON OJITO */}
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"} // Alterna tipo
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10" // Espacio para que el texto no se tape con el icono
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                  {isSubmitting ? "Ingresando..." : "Ingresar"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginContent />
    </Suspense>
  )
}