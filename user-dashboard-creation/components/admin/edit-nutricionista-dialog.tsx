"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, HorarioAsistenciaDto } from "@/lib/types";

const DIAS = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onConfirm: (data: any) => Promise<void>;
}

export function EditNutricionistaDialog({ open, onOpenChange, user, onConfirm }: Props) {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [hourly, setHourly] = useState("");
  const [horarios, setHorarios] = useState<HorarioAsistenciaDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
  let isMounted = true;

  if (open && user && isMounted) {
    // RESET TOTAL ANTES DE CARGAR
    setName(user.name || "");
    setLastname(user.lastname || "");
    setHourly(user.hourly || "");
    
    // Extraemos solo los datos necesarios y nos aseguramos de que sea una lista nueva
    const horariosOriginales = user.horarioAsistencias || (user as any).horarioAsistenciaDtos || [];
    
    // IMPORTANTE: Mapeamos a un objeto limpio para que el estado de React sea independiente
    setHorarios(horariosOriginales.map(h => ({
      id: h.id, // Mantenemos el ID para que el back sepa cuál es cuál
      dia: h.dia,
      inicio: h.inicio,
      fin: h.fin
    })));
  }

  return () => {
    isMounted = false;
    // Limpieza al desmontar
    if (!open) setHorarios([]); 
  };
}, [open, user?.userId]);

  const addHorario = () => {
    setHorarios([...horarios, { dia: "LUNES", inicio: "08:00", fin: "12:00" }]);
  };

  const updateHorario = (index: number, field: keyof HorarioAsistenciaDto, value: string) => {
    const newHorarios = [...horarios];
    newHorarios[index] = { ...newHorarios[index], [field]: value };
    setHorarios(newHorarios);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm({
        name,
        lastname,
        hourly,
        horarioAsistencias: horarios 
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Nutricionista</DialogTitle>
          <DialogDescription>Ajusta el perfil y horarios de {user?.name}.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos de Nombre y Apellido */}
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

          <div className="space-y-1">
            <Label>Carga Horaria Semanal</Label>
            <Input type="number" value={hourly} onChange={(e) => setHourly(e.target.value)} required />
          </div>

          {/* Listado de Horarios */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <Label className="font-bold text-green-700 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Horarios de Asistencia
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={addHorario}>
                <Plus className="w-3 h-3 mr-1" /> Añadir
              </Button>
            </div>

            <div className="space-y-3">
              {horarios.map((h, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end bg-slate-50 p-2 rounded border">
                  <div className="col-span-4">
                    <Label className="text-[10px] uppercase">Día</Label>
                    <Select value={h.dia} onValueChange={(v) => updateHorario(i, "dia", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DIAS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Label className="text-[10px] uppercase">Inicio</Label>
                    <Input type="time" value={h.inicio} onChange={(e) => updateHorario(i, "inicio", e.target.value)} className="h-8 text-xs" />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-[10px] uppercase">Fin</Label>
                    <Input type="time" value={h.fin} onChange={(e) => updateHorario(i, "fin", e.target.value)} className="h-8 text-xs" />
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
            <Button type="submit" disabled={isSubmitting} className="bg-green-700 hover:bg-green-800 text-white font-bold">
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}