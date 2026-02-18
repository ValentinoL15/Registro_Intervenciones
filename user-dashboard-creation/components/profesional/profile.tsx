

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
import { Turno, User } from "@/lib/types";
import { Loader2, User as UserIcon } from "lucide-react";
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

interface ProfileInterface {
  user: User
}

export function Profile({
  user
}: ProfileInterface) {

  const { checkAuth } = useAuth();

  const router = useRouter();
  const [profesional, setProfesional] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<string[]>([]);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [hourly, setHourly] = useState("")
  const [turno, setTurno] = useState<Turno>("MAÑANA");
  const [isSubmitting, setIsSubmitting] = useState(false)


  const DIAS_OPTIONS = [
    { label: "Lunes", value: "LUNES" },
    { label: "Martes", value: "MARTES" },
    { label: "Miércoles", value: "MIERCOLES" },
    { label: "Jueves", value: "JUEVES" },
    { label: "Viernes", value: "VIERNES" },
    { label: "Sábado", value: "SABADO" },
  ];

  const hasChanges =
  name !== profesional?.name ||
  lastname !== profesional?.lastname ||
  username !== profesional?.username ||
  hourly !== profesional?.hourly ||
  turno !== profesional?.turno ||
  days.length !== profesional?.days?.length ||
  !days.every(d => profesional?.days?.includes(d));

  const isButtonDisabled = !hasChanges || isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isButtonDisabled) return;

    setIsSubmitting(true);
    
    // Construimos el objeto con los datos actualizados
    const updatedData = {
      name,
      lastname,
      username,
      hourly,
      turno,
      days
    };

    try {
      const updatedProf = await profesionalApi.editProfesional(updatedData);
      
      setProfesional(updatedProf);

      await checkAuth();

      toast({
        title: "Éxitoso",
        description: "Perfil actualizado correctamente"
      })
    } catch (err: any) {
      console.error("Error al actualizar:", err);
      // Opcional: Mostrar error al usuario
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    const loadProfesional = async () => {
      try {
        const prof = await profesionalApi.getProfesional(user.userId);
        setProfesional(prof);
        // Sincronizamos todos los estados locales
        setName(prof.name);
        setLastname(prof.lastname);
        setUsername(prof.username);
        setHourly(prof.hourly);
        setTurno(prof.turno);
        setDays(prof.days || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfesional();
  }, [user, router]);

  const handleDiaToggle = (dia: string) => {
    setDays((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  useEffect(() => {
    // 1. Redirección si no hay usuario
    if (!user) {
      router.push("/");
      return;
    }

    const loadProfesional = async () => {
      try {
        const prof = await profesionalApi.getProfesional(user.userId);
        setProfesional(prof);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfesional();
  }, [user, router]);

  if (loading || !profesional) {
    return (
      <Card className="w-full max-w-lg flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </Card>
    );
  }

  return (
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
        <form onSubmit={handleSubmit}>
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
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Cambiar contraseña
                </a>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CARGA HORARIA */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="hourly">Carga Horaria (hs/semana)</Label>
                <Input
                  id="hourly"
                  type="number"
                  value={hourly}
                  onChange={(e) => setHourly(e.target.value)}
                  required
                />
              </div>

              {/* TURNO */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="turno">Turno</Label>
                <Select value={turno} onValueChange={(v: any) => setTurno(v)}>
                  <SelectTrigger id="turno">
                    <SelectValue placeholder="Seleccionar turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAÑANA">Mañana</SelectItem>
                    <SelectItem value="TARDE">Tarde</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3">
              <Label className="text-base">Días de trabajo</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-lg border bg-muted/20">
                {DIAS_OPTIONS.map((dia) => (
                  <div key={dia.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${dia.value}`}
                      checked={days.includes(dia.value)}
                      onCheckedChange={() => handleDiaToggle(dia.value)}
                    />
                    <Label
                      htmlFor={`edit-${dia.value}`}
                      className="text-sm font-normal cursor-pointer select-none"
                    >
                      {dia.label}
                    </Label>
                  </div>
                ))}
              </div>
              {days.length === 0 && (
                <p className="text-xs text-destructive">Selecciona al menos un día.</p>
              )}
            </div>
          </div>
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
  )
}