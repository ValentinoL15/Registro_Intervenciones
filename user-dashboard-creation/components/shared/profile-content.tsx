"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { UserApi, profesionalApi } from "@/service/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User as UserIcon, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ProfileContent() {
  const { user, checkAuth, logout } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null); // Estado para el contador
const [isRedirecting, setIsRedirecting] = useState(false); // Estado para mostrar el modal final
  const [error, setError] = useState("");

  // Estados del formulario
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setLastname(user.lastname || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
      setLoading(false);
    }
    console.log("MI USER" , user)
  }, [user]);

  const hasChanges =
    name !== user?.name ||
    lastname !== user?.lastname ||
    username !== user?.username;

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!hasChanges || isSubmitting) return;

  setIsSubmitting(true);
  setError("");

  try {
    const response = await UserApi.editUser({
      name,
      lastname,
      username,
    });
    
    if (response.token) {
      localStorage.setItem("authToken", response.token); 
      console.log("Token actualizado con el nuevo username");
    }

    await checkAuth(); 
    
    toast({ title: "Éxito", description: "Perfil actualizado correctamente" });
  } catch (err: any) {
    setError(err.response?.data?.message || err.message || "Error al actualizar");
  } finally {
    setIsSubmitting(false);
  }
};

  const handleRequestPasswordReset = async () => {
  setIsSubmitting(true);
  try {
    await profesionalApi.requestEmail(user!.email);
    
    setIsPasswordModalOpen(false); // Cerramos el modal de confirmación
    setIsRedirecting(true); // Abrimos el modal de "Sesión cerrándose"
    setCountdown(5); // Iniciamos en 5 segundos

    // Iniciamos el intervalo del contador
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev !== null && prev <= 1) {
          clearInterval(interval);
          logout(); // Cerramos sesión al llegar a 0
          return 0;
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);

  } catch (err) {
    toast({
      title: "Error",
      description: "No se pudo enviar el correo.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  return (
    <>
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary" />
            <CardTitle>Perfil de {user?.role}</CardTitle>
          </div>
          <CardDescription>
            Gestiona tu información básica y seguridad.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname">Apellido</Label>
                <Input
                  id="lastname"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email} disabled className="bg-muted" />
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                Cambiar Contraseña
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!hasChanges || isSubmitting}
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Guardar Cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* MODAL DE PASSWORD */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restablecer contraseña</DialogTitle>
            <DialogDescription>
              Enviaremos un enlace de recuperación a <strong>{user?.email}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPasswordModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleRequestPasswordReset} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar envío
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isRedirecting} onOpenChange={() => {}}>
  <DialogContent className="sm:max-w-[400px] flex flex-col items-center py-10 text-center">
    <div className="relative flex items-center justify-center w-20 h-20 mb-4">
      <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
      <div 
        className="absolute inset-0 border-4 border-primary rounded-full animate-spin" 
        style={{ clipPath: 'polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 0)', animationDuration: '3s' }}
      />
      <span className="text-3xl font-bold text-primary">{countdown}</span>
    </div>
    
    <DialogHeader>
      <DialogTitle className="text-2xl text-center">¡Correo Enviado!</DialogTitle>
      <DialogDescription className="text-center text-base pt-2">
        Por seguridad, tu sesión se cerrará automáticamente en unos segundos. 
        Revisa tu bandeja de entrada para restablecer tu contraseña.
      </DialogDescription>
    </DialogHeader>

    <div className="mt-4 flex items-center gap-2 text-muted-foreground text-sm italic">
      <Loader2 className="w-4 h-4 animate-spin" />
      Redirigiendo al login...
    </div>
  </DialogContent>
</Dialog>
    </>
  );
}