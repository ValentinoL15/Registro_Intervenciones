"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog"; 
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, AlertCircle, Loader2, GraduationCap, User } from "lucide-react";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { DisponibilidadDto } from "@/lib/types";
import { useLoader } from "@/lib/spinnerService";

const DIAS_OPTIONS = [
  { label: "Lunes", value: "LUNES" },
  { label: "Martes", value: "MARTES" },
  { label: "Miércoles", value: "MIÉRCOLES" },
  { label: "Jueves", value: "JUEVES" },
  { label: "Viernes", value: "VIERNES" },
  { label: "Sábado", value: "SABADO" },
];

const ORDEN_DIAS: Record<string, number> = {
  "LUNES": 1, "MARTES": 2, "MIÉRCOLES": 3, "JUEVES": 4, "VIERNES": 5, "SABADO": 6, "DOMINGO": 7
};

export function AddProfesionalDialog({
  open,
  onOpenChange,
  onSubmit,
  role = "PROFESIONAL"
}: any) {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [hourly, setHourly] = useState("40");
  const [degree, setDegree] = useState(""); 
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadDto[]>([]);
  const [horarios, setHorarios] = useState<{ dia: string; inicio: string; fin: string }[]>([]); 
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showLoader, hideLoader } = useLoader();

  const isProfesional = role === "PROFESIONAL";
  const requiereHorarios = role === "TECNICO" || role === "NUTRICIONISTA";

  useEffect(() => {
    if (open) {
      setName("");
      setLastname("");
      setEmail("");
      setUsername("");
      setHourly("40");
      setDegree("");
      setDisponibilidad(isProfesional ? [{ dia: "LUNES", turno: "MAÑANA" }] : []);
      setHorarios(requiereHorarios ? [{ dia: "LUNES", inicio: "08:30", fin: "12:30" }] : []);
      setError("");
    }
  }, [open, role, isProfesional, requiereHorarios]);

  const addDisponibilidad = () => setDisponibilidad([...disponibilidad, { dia: "LUNES", turno: "MAÑANA" as any }]);
  const updateDisponibilidad = (index: number, field: keyof DisponibilidadDto, value: string) => {
    const nuevas = [...disponibilidad];
    nuevas[index] = { ...nuevas[index], [field]: value as any };
    setDisponibilidad(nuevas);
  };
  const removeDisponibilidad = (index: number) => setDisponibilidad(disponibilidad.filter((_, i) => i !== index));

  const agregarDia = () => setHorarios([...horarios, { dia: "LUNES", inicio: "08:30", fin: "12:30" }]);
  const eliminarHorario = (index: number) => setHorarios(horarios.filter((_, i) => i !== index));
  const actualizarCampoHorario = (index: number, field: string, value: string) => {
    const nuevosHorarios = horarios.map((h, i) => i === index ? { ...h, [field]: value } : h);
    setHorarios(nuevosHorarios);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalHorarios = [...horarios];

    if (requiereHorarios) {
      if (finalHorarios.length === 0) return setError("Debes asignar al menos un horario.");
      finalHorarios.sort((a, b) => ORDEN_DIAS[a.dia] - ORDEN_DIAS[b.dia]);
      for (const h of finalHorarios) {
        if (h.inicio >= h.fin) return setError(`Error en ${h.dia}: el inicio debe ser previo al fin.`);
      }
    }

    setError("");
    setIsSubmitting(true);

    try {
      showLoader("Creando usuario...");
      await onSubmit({ 
        name, 
        lastname, 
        email, 
        username, 
        hourly, 
        degree: (isProfesional || role === "TECNICO") ? degree : "", 
        disponibilidad: isProfesional ? disponibilidad : [], 
        horarioAsistencia: requiereHorarios ? finalHorarios : [], 
        role,
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Error al cargar los datos");
    } finally {
      setIsSubmitting(false);
      hideLoader();
    }
  };

  const roleNames: Record<string, string> = {
    PROFESIONAL: "Profesional",
    NUTRICIONISTA: "Nutricionista",
    COCINERO: "Cocinero",
    TECNICO: "Técnico",
    MANTENIMIENTO: "Personal de Mantenimiento"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Plus className="w-6 h-6 text-primary" /> Agregar {roleNames[role] || role}
          </DialogTitle>
          <DialogDescription>Completa los datos para el acceso del nuevo personal.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase text-slate-500">Nombre</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="rounded-xl h-11" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastname" className="text-xs font-bold uppercase text-slate-500">Apellido</Label>
              <Input id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} required className="rounded-xl h-11" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username" className="text-xs font-bold uppercase text-slate-500">Username</Label>
              <div className="relative">
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="rounded-xl h-11 pl-10" placeholder="Nombre de usuario" />
                <User className="w-4 h-4 absolute left-3 top-3.5 opacity-40" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="hourly" className="text-xs font-bold uppercase text-slate-500">Carga Horaria</Label>
              <Input id="hourly" type="number" value={hourly} onChange={(e) => setHourly(e.target.value)} required className="rounded-xl h-11" placeholder="hs/semana" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-xs font-bold uppercase text-slate-500">Email Profesional</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl h-11" />
          </div>

          {/* CAMPO DEGREE: Visible para TÉCNICO y PROFESIONAL */}
          {(isProfesional || role === "TECNICO") && (
            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="degree" className={`text-xs font-bold uppercase ${isProfesional ? 'text-teal-700' : 'text-indigo-700'}`}>
                Título / Especialidad
              </Label>
              <div className="relative">
                <Input 
                  id="degree" 
                  value={degree} 
                  onChange={(e) => setDegree(e.target.value)} 
                  placeholder={isProfesional ? "Ej: Kinesiólogo, Psicólogo..." : "Ej: Electromecánico..."} 
                  required 
                  className="rounded-xl h-11 pl-10"
                />
                <GraduationCap className="w-4 h-4 absolute left-3 top-3.5 opacity-50" />
              </div>
            </div>
          )}

          {/* DISPONIBILIDAD (PROFESIONAL) */}
          {isProfesional && (
            <div className="flex flex-col gap-4 pt-4 border-t mt-2">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-teal-700 uppercase text-[11px]">Disponibilidad (Turnos)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addDisponibilidad} className="h-7 gap-1 rounded-lg text-teal-700 border-teal-200 hover:bg-teal-50">
                  <Plus className="w-3 h-3" /> Añadir
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {disponibilidad.map((disp, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select value={disp.dia} onValueChange={(v) => updateDisponibilidad(index, "dia", v)}>
                      <SelectTrigger className="h-9 rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DIAS_OPTIONS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={disp.turno} onValueChange={(v) => updateDisponibilidad(index, "turno", v)}>
                      <SelectTrigger className="h-9 rounded-xl border-slate-200 w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MAÑANA">Mañana</SelectItem>
                        <SelectItem value="TARDE">Tarde</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeDisponibilidad(index)} className="text-destructive h-9 w-9">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CRONOGRAMA (TÉCNICO / NUTRICIONISTA) */}
          {requiereHorarios && (
            <div className="flex flex-col gap-4 pt-4 border-t mt-2">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-indigo-700 uppercase text-[11px]">Cronograma de Asistencia</Label>
                <Button type="button" variant="outline" size="sm" onClick={agregarDia} className="h-7 gap-1 rounded-lg text-indigo-700 border-indigo-200">
                  <Plus className="w-3 h-3" /> Añadir Día
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {horarios.map((h, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <Select value={h.dia} onValueChange={(v) => actualizarCampoHorario(index, "dia", v)}>
                        <SelectTrigger className="h-9 rounded-xl text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{DIAS_OPTIONS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3"><Input type="time" value={h.inicio} onChange={(e) => actualizarCampoHorario(index, "inicio", e.target.value)} className="h-9 rounded-xl text-xs px-2" /></div>
                    <div className="col-span-3"><Input type="time" value={h.fin} onChange={(e) => actualizarCampoHorario(index, "fin", e.target.value)} className="h-9 rounded-xl text-xs px-2" /></div>
                    <div className="col-span-1"><Button type="button" variant="ghost" size="icon" onClick={() => eliminarHorario(index)} className="text-destructive h-8 w-8"><Trash2 className="w-4 h-4" /></Button></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter className="mt-4 gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl h-11 flex-1">Cancelar</Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className={`rounded-xl h-11 flex-[2] font-bold shadow-lg ${isProfesional ? 'bg-teal-600 hover:bg-teal-700' : requiereHorarios ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Crear {roleNames[role] || role}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}