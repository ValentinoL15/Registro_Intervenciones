"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profesionalApi } from "@/service/api";
import { toast } from "@/hooks/use-toast";
import { Loader2, KeyRound, AlertTriangle } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenError, setTokenError] = useState(false);
  
  useEffect(() => {
    const validateToken = async () => {
      try {
        // Debes crear este endpoint en tu backend que solo verifique si el token existe y no está revocado
        await profesionalApi.validateResetToken(token); 
        setIsValidating(false);
      } catch (err) {
        setTokenError(true);
        setIsValidating(false);
        toast({ 
          title: "Enlace no válido", 
          description: "Este enlace ya fue utilizado o ha expirado.", 
          variant: "destructive" 
        });
      }
    };

    if (token) validateToken();
  }, [token]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" });
    }

    setIsSubmitting(true);
    try {
      await profesionalApi.changePasswordWithToken(token, password);
      toast({ title: "¡Contraseña actualizada!", description: "Serás redirigido al inicio de sesión." });
      
      setTimeout(() => {
        localStorage.clear();
        router.push("/");
      }, 3000); 
    } catch (err: any) {
      setTokenError(true); // Si falla aquí, también bloqueamos la vista
      toast({ title: "Error", description: "No se pudo procesar el cambio. El enlace ya no es válido.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Validando enlace de seguridad...</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30 text-center">
        <Card className="w-full max-w-md border-destructive/20 shadow-xl">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl">Enlace caducado</CardTitle>
            <CardDescription className="text-base pt-2">
              Este enlace de recuperación ya no es válido. Por razones de seguridad, los enlaces solo pueden usarse una vez.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full" onClick={() => router.push("/")}>
              Ir al Inicio de Sesión
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <KeyRound className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-center text-2xl">Nueva Contraseña</CardTitle>
          <CardDescription className="text-center">
            Ingresa tu nueva clave de acceso.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleReset}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="pass">Nueva Contraseña</Label>
              <Input
                id="pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm">Confirmar Contraseña</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Restablecer Contraseña"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}