"use client";

import React, { useEffect, useState } from "react";
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
import { AlertCircle, Loader2, Heart, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { profesionalApi } from "@/service/api";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  // Estados
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emailRecovery, setEmailRecovery] = useState(""); // Nuevo: para recuperación
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false); // Switch de vista

  // Efectos existentes...
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
    // 1. Ejecutar el login
    const userData = await login(username, password);
    
    // 2. Determinar la ruta según el rol
    // Es mejor usar el rol que viene del backend/contexto
    const role = userData?.role || localStorage.getItem("userRole");

    let targetPath = "/";

    switch (role) {
      case "ADMIN":
        targetPath = "/admin";
        break;
      case "PROFESIONAL":
        targetPath = "/profesional";
        break;
      case "NUTRICIONISTA":
        targetPath = "/nutricionista";
        break;
      case "COCINERO":
        targetPath = "/cocinero";
        break;
      case "MANTENIMIENTO":
        targetPath = "/mantenimiento";
        break;
      default:
        targetPath = "/"; // O una página de "pendiente de activación"
    }

    router.push(targetPath);
  } catch (err: any) {
    setError(err.message || "Credenciales incorrectas");
  } finally {
    setIsSubmitting(false);
  }
};

  // Nueva función para recuperar contraseña
  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Simulación de llamada a API
      console.log("Enviando correo a:", emailRecovery);
      await profesionalApi.requestEmail(emailRecovery)
      
      toast({
        title: "Correo enviado",
        description: "Si el correo existe, recibirás instrucciones pronto.",
      });
      setIsForgotPassword(false); // Volver al login
    } catch (err: any) {
      setError("No se pudo procesar la solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header con Logo */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Centro de Atención Integral</h1>
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
              /* FORMULARIO DE RECUPERACIÓN */
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
              /* FORMULARIO DE LOGIN ORIGINAL */
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Username</Label>
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
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
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
    </>
  );
}
