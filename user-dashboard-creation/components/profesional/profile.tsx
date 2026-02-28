

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DisponibilidadDto, Turno, User } from "@/lib/types";
import { AlertCircle, Loader2, Plus, Trash2, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { profesionalApi } from "@/service/api";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLoader } from "@/lib/spinnerService";

interface ProfileInterface {
  user: User
}

export function Profile({
  user
}: ProfileInterface) {

  const { checkAuth, logout } = useAuth();

  const router = useRouter();
  const [profesional, setProfesional] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [hourly, setHourly] = useState("")
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [error, setError] = useState("");
  const { showLoader, hideLoader } = useLoader();


  const DIAS_OPTIONS = [
    { label: "Lunes", value: "LUNES" },
    { label: "Martes", value: "MARTES" },
    { label: "Miércoles", value: "MIÉRCOLES" },
    { label: "Jueves", value: "JUEVES" },
    { label: "Viernes", value: "VIERNES" },
    { label: "Sábado", value: "SABADO" },
  ];

  const hasChanges =
    name !== profesional?.name ||
    lastname !== profesional?.lastname ||
    username !== profesional?.username ||
    hourly !== profesional?.hourly ||
    JSON.stringify(disponibilidades) !== JSON.stringify(profesional?.disponibilidades);

  const isButtonDisabled = !hasChanges || isSubmitting || disponibilidades.length === 0;

  useEffect(() => {
    const loadProfesional = async () => {
      try {
        const prof = await profesionalApi.getProfesional(user.userId);
        console.log("MI PROF: " + JSON.stringify(prof, null, 2));
        setProfesional(prof);
        setName(prof.name);
        setLastname(prof.lastname);
        setUsername(prof.username);
        setHourly(prof.hourly);
        // Mapeamos el array de objetos que viene del backend
        setDisponibilidades(prof.disponibilidades || [{ dia: "LUNES", turno: "MAÑANA" }]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadProfesional();
    else router.push("/")
  }, [user]);

  const addDisponibilidad = () => {
    setDisponibilidades([...disponibilidades, { dia: "LUNES", turno: "MAÑANA" }]);
  };

  const updateDisponibilidad = (index: number, field: keyof DisponibilidadDto, value: string) => {
    const nuevas = [...disponibilidades];
    nuevas[index] = { ...nuevas[index], [field]: value as any };
    setDisponibilidades(nuevas);
  };

  const removeDisponibilidad = (index: number) => {
    setDisponibilidades(disponibilidades.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (isButtonDisabled) return;

  setError(""); 
  setIsSubmitting(true);
  showLoader("Actualizando perfil...");

  const combos = disponibilidades.map(d => `${d.dia}-${d.turno}`);
  const tieneDuplicados = combos.some((item, index) => combos.indexOf(item) !== index);

  if (tieneDuplicados) {
    setError("No puedes repetir el mismo turno para un mismo día.");
    setIsSubmitting(false);
    hideLoader();
    return;
  }

  const updatedData = { name, lastname, username, hourly, disponibilidades };

  try {
    const response = await profesionalApi.editProfesional(updatedData);

    if (response.token) {
    localStorage.setItem("authToken", response.token); 
  }

    setProfesional(response.data || response); 
    
    await checkAuth(); 

    toast({ title: "Éxito", description: "Perfil actualizado correctamente" });
  } catch (err: any) {
    setError(err.message || "Error al actualizar el perfil");
  } finally {
    setIsSubmitting(false);
    hideLoader();
  }
};

  const handleRequestPasswordReset = async () => {
    setIsSubmitting(true);
    try {
      await profesionalApi.requestEmail(profesional!.email);

      toast({
        title: "Correo enviado",
        description: `Se ha enviado un enlace a ${profesional!.email}. Tu sesión se cerrará por seguridad.`,
      });

      setTimeout(() => {
        logout(); // Esto debería limpiar localStorage y redirigir a "/"
      }, 3000);

    } catch (err: any) {
      toast({
        title: "Error",
        description: "No se pudo enviar el correo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsPasswordModalOpen(false);
    }
  };

  if (loading || !profesional) {
    return (
      <Card className="w-full max-w-lg flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-lg ">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary" />
            <CardTitle className="text-2xl">Mi Perfil</CardTitle>
          </div>
          <CardDescription>
            Gestiona tu información personal y preferencias de cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* NOMBRE */}
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name} // Usamos el estado 'name', no 'profesional.name'
                    onChange={(e) => setName(e.target.value)} // Esto permite escribir
                    placeholder="Tu nombre"
                    required
                  />
                </div>

                {/* APELLIDO */}
                <div className="grid gap-2">
                  <Label htmlFor="lastname">Apellido</Label>
                  <Input
                    id="lastname"
                    type="text"
                    value={lastname} // Usamos el estado 'lastname'
                    onChange={(e) => setLastname(e.target.value)} // Esto permite escribir
                    placeholder="Tu apellido"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profesional.email}
                  disabled={true}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="ml-auto inline-block text-sm font-medium text-primary underline-offset-4 hover:underline cursor-pointer"
                  >
                    Cambiar contraseña
                  </button>
                </div>
                <Input id="password" type="password" value={"********"} disabled={true} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)} // Esto permite escribir
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hourly">Carga Horaria (hs/semana)</Label>
              <Input id="hourly" type="number" value={hourly} onChange={(e) => setHourly(e.target.value)} />
            </div>

            {/* --- NUEVA SECCIÓN DE DISPONIBILIDAD DINÁMICA --- */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Mis Horarios</Label>
                <Button type="button" variant="outline" size="sm" onClick={addDisponibilidad}>
                  <Plus className="w-4 h-4 mr-2" /> Añadir
                </Button>
              </div>

              <div className="flex flex-col gap-3 p-4 rounded-lg border bg-muted/20">
                {disponibilidades.map((disp, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={disp.dia}
                      onValueChange={(v) => updateDisponibilidad(index, "dia", v)}
                    >
                      <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DIAS_OPTIONS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                      </SelectContent>
                    </Select>

                    <Select
                      value={disp.turno}
                      onValueChange={(v) => updateDisponibilidad(index, "turno", v)}
                    >
                      <SelectTrigger className="bg-background w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MAÑANA">Mañana</SelectItem>
                        <SelectItem value="TARDE">Tarde</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDisponibilidad(index)}
                      disabled={disponibilidades.length <= 1}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 mt-4 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}


            <CardFooter className="flex flex-col gap-3 border-t pt-6">
              <Button
                type="submit"
                className="w-full"
                disabled={isButtonDisabled}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>

              {!hasChanges && !isSubmitting && (
                <p className="text-[11px] text-muted-foreground text-center">
                  No se han detectado cambios para guardar.
                </p>
              )}
            </CardFooter>
          </form>
        </CardContent>
      </Card>
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restablecer contraseña</DialogTitle>
            <DialogDescription>
              Se enviará un correo electrónico a <strong>{profesional?.email}</strong> con un enlace seguro para que puedas crear una nueva contraseña.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsPasswordModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRequestPasswordReset}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar correo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}