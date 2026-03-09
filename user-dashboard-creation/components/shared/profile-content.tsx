"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { UserApi, profesionalApi } from "@/service/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  User as UserIcon, 
  AlertCircle, 
  HardHat, 
  Utensils, 
  Salad, 
  ClipboardCheck, 
  Wrench,
  ShieldCheck
} from "lucide-react";
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
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState("");

  // Estados del formulario
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // 1. CONFIGURACIÓN DINÁMICA POR ROL
  const roleConfig = useMemo(() => {
    switch (user?.role) {
      case "TECNICO":
        return {
          color: "text-indigo-600",
          bgColor: "bg-indigo-600",
          borderColor: "border-indigo-600",
          lightBg: "bg-indigo-50",
          icon: <Wrench className="w-5 h-5 text-indigo-600" />,
          label: "Cuerpo Técnico"
        };
      case "NUTRICIONISTA":
        return {
          color: "text-green-600",
          bgColor: "bg-green-600",
          borderColor: "border-green-600",
          lightBg: "bg-green-50",
          icon: <Salad className="w-5 h-5 text-green-600" />,
          label: "Departamento de Nutrición"
        };
      case "COCINERO":
        return {
          color: "text-orange-600",
          bgColor: "bg-orange-600",
          borderColor: "border-orange-600",
          lightBg: "bg-orange-50",
          icon: <Utensils className="w-5 h-5 text-orange-600" />,
          label: "Personal de Cocina"
        };
      case "MANTENIMIENTO":
        return {
          color: "text-blue-600",
          bgColor: "bg-blue-600",
          borderColor: "border-blue-600",
          lightBg: "bg-blue-50",
          icon: <HardHat className="w-5 h-5 text-blue-600" />,
          label: "Servicios Generales"
        };
      case "PROFESIONAL":
        return {
          color: "text-teal-600",
          bgColor: "bg-teal-600",
          borderColor: "border-teal-600",
          lightBg: "bg-teal-50",
          icon: <ClipboardCheck className="w-5 h-5 text-teal-600" />,
          label: "Staff Profesional"
        };
      case "ADMIN":
        return {
          color: "text-red-600",
          bgColor: "bg-red-600",
          borderColor: "border-red-600",
          lightBg: "bg-red-50",
          icon: <ShieldCheck className="w-5 h-5 text-red-600" />,
          label: "Administración Central"
        };
      default:
        return {
          color: "text-primary",
          bgColor: "bg-primary",
          borderColor: "border-primary",
          lightBg: "bg-muted",
          icon: <UserIcon className="w-5 h-5 text-primary" />,
          label: `Perfil de ${user?.role || 'Usuario'}`
        };
    }
  }, [user?.role]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setLastname(user.lastname || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
      setLoading(false);
    }
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
      setIsPasswordModalOpen(false);
      setIsRedirecting(true);
      setCountdown(5);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev !== null && prev <= 1) {
            clearInterval(interval);
            logout();
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
      <Card className={`w-full max-w-lg mx-auto border-t-4 ${roleConfig.borderColor} shadow-lg`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${roleConfig.lightBg}`}>
              {roleConfig.icon}
            </div>
            <div>
              <CardTitle className="text-xl">{roleConfig.label}</CardTitle>
              <CardDescription>
                Gestiona tu información básica y seguridad de cuenta.
              </CardDescription>
            </div>
          </div>
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
              <Label>Email Corporativo</Label>
              <Input value={email} disabled className="bg-muted italic" />
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                Solicitar Cambio de Contraseña
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
              className={`w-full text-white font-bold transition-all ${roleConfig.bgColor} hover:opacity-90`}
              disabled={!hasChanges || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* MODAL DE CONFIRMACIÓN PASSWORD */}
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
            <Button 
              className={roleConfig.bgColor} 
              onClick={handleRequestPasswordReset} 
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar envío
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE REDIRECCIÓN Y CUENTA REGRESIVA */}
      <Dialog open={isRedirecting} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[400px] flex flex-col items-center py-10 text-center">
          <div className="relative flex items-center justify-center w-20 h-20 mb-4">
            <div className={`absolute inset-0 border-4 ${roleConfig.borderColor} opacity-20 rounded-full`} />
            <div 
              className={`absolute inset-0 border-4 ${roleConfig.borderColor} rounded-full animate-spin`} 
              style={{ clipPath: 'polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 0)', animationDuration: '3s' }}
            />
            <span className={`text-3xl font-bold ${roleConfig.color}`}>{countdown}</span>
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