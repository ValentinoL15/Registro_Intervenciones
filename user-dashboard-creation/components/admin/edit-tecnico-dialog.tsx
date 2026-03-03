"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, CalendarClock, GraduationCap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, HorarioAsistenciaDto } from "@/lib/types";

const DIAS = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SABADO"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onConfirm: (data: any) => Promise<void>;
}

export function EditTecnicoDialog({ open, onOpenChange, user, onConfirm }: Props) {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [degree, setDegree] = useState(""); // <--- Nuevo campo
  const [hourly, setHourly] = useState("");
  const [horarios, setHorarios] = useState<HorarioAsistenciaDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && user) {
      setName(user.name || "");
      setLastname(user.lastname || "");
      setDegree(user.degree || ""); // <--- Cargar degree inicial
      setHourly(user.hourly || "");
      const hBackend = user.horarioAsistencias || (user as any).horarioAsistenciaDtos || [];
      setHorarios(hBackend.map(h => ({ ...h })));
    } else if (!open) {
      setHorarios([]);
    }
  }, [open, user]);

  const updateHorario = (index: number, field: keyof HorarioAsistenciaDto, value: string) => {
    const newH = [...horarios];
    newH[index] = { ...newH[index], [field]: value };
    setHorarios(newH);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm({
        name,
        lastname,
        degree, // <--- Enviar degree al backend
        hourly,
        horarioAsistencias: horarios
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto border-indigo-200">
        <DialogHeader>
          <DialogTitle className="text-indigo-700 flex items-center gap-2">
            <CalendarClock className="w-5 h-5" /> Editar Personal Técnico
          </DialogTitle>
          <DialogDescription>Ajusta los datos, título y cronograma de {user?.name}.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Apellido</Label>
              <Input value={lastname} onChange={(e) => setLastname(e.target.value)} required />
            </div>
          </div>

          {/* CAMPO DEGREE AÑADIDO */}
          <div className="space-y-1">
            <Label className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" /> Título / Especialidad
            </Label>
            <Input 
              value={degree} 
              onChange={(e) => setDegree(e.target.value)} 
              placeholder="Ej: Técnico Electromecánico"
            />
          </div>

          <div className="space-y-1">
            <Label>Carga Horaria Semanal</Label>
            <Input type="number" value={hourly} onChange={(e) => setHourly(e.target.value)} required />
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <Label className="font-bold text-indigo-700">Cronograma de Asistencia</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setHorarios([...horarios, { dia: "LUNES", inicio: "08:00", fin: "12:00" }])}
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <Plus className="w-3 h-3 mr-1" /> Añadir Día
              </Button>
            </div>

            <div className="space-y-3">
              {horarios.map((h, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end bg-indigo-50/30 p-2 rounded border border-indigo-100">
                  <div className="col-span-4">
                    <Select value={h.dia} onValueChange={(v) => updateHorario(i, "dia", v)}>
                      <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DIAS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Input type="time" value={h.inicio} onChange={(e) => updateHorario(i, "inicio", e.target.value)} className="h-8 text-xs bg-white" />
                  </div>
                  <div className="col-span-3">
                    <Input type="time" value={h.fin} onChange={(e) => updateHorario(i, "fin", e.target.value)} className="h-8 text-xs bg-white" />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <Button type="button" variant="ghost" size="icon" onClick={() => setHorarios(horarios.filter((_, idx) => idx !== i))} className="h-8 w-8 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold">
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}