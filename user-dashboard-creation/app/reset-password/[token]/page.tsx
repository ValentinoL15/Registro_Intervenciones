"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profesionalApi } from "@/service/api";
import { toast } from "@/hooks/use-toast";
import { Loader2, KeyRound } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" });
    }

    setIsSubmitting(true);
    try {
      // Enviamos el token Y la nueva contraseña al backend
      await profesionalApi.changePasswordWithToken(token, password);
      toast({
        title: "¡Contraseña actualizada!",
        description: "Serás redirigido al inicio de sesión.",
      });
      sessionStorage.setItem("toast_message", "password_changed");

      setTimeout(() => {
        localStorage.clear();
        router.push("/");
      }, 3000); 
    } catch (err: any) {
      toast({ title: "Error", description: "El enlace ha expirado o es inválido", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

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