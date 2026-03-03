"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, DisponibilidadDto } from "@/lib/types";

const DIAS_OPTIONS = [
  { label: "Lunes", value: "LUNES" },
  { label: "Martes", value: "MARTES" },
  { label: "Miércoles", value: "MIÉRCOLES" },
  { label: "Jueves", value: "JUEVES" },
  { label: "Viernes", value: "VIERNES" },
];

interface EditProfesionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onConfirm: (data: any) => Promise<void>;
}

export function EditProfesionalDialog({ open, onOpenChange, user, onConfirm }: EditProfesionalDialogProps) {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [hourly, setHourly] = useState("");
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Precargar datos cuando se abre el modal
  useEffect(() => {
    if (user && open) {
      setName(user.name);
      setLastname(user.lastname);
      setHourly(user.hourly);
      // Importante: Hacemos una copia profunda para no editar el original por error
      setDisponibilidades(user.disponibilidades ? [...user.disponibilidades] : []);
    }
  }, [user, open]);

  const addDisponibilidad = () => {
    setDisponibilidades([...disponibilidades, { dia: "LUNES", turno: "MAÑANA" as any }]);
  };

  const removeDisponibilidad = (index: number) => {
    setDisponibilidades(disponibilidades.filter((_, i) => i !== index));
  };

  const updateDisponibilidad = (index: number, field: keyof DisponibilidadDto, value: string) => {
    const nuevas = [...disponibilidades];
    nuevas[index] = { ...nuevas[index], [field]: value as any };
    setDisponibilidades(nuevas);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm({
        name,
        lastname,
        hourly,
        disponibilidades: disponibilidades // Enviamos la lista completa para el clear/addAll del back
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Profesional</DialogTitle>
          <DialogDescription>Modifica los datos de {user?.name} {user?.lastname}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Apellido</Label>
              <Input value={lastname} onChange={(e) => setLastname(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Carga Horaria</Label>
            <Input type="number" value={hourly} onChange={(e) => setHourly(e.target.value)} required />
          </div>

          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="font-bold">Disponibilidad</Label>
              <Button type="button" variant="outline" size="sm" onClick={addDisponibilidad} className="h-8">
                <Plus className="w-3 h-3 mr-1" /> Añadir
              </Button>
            </div>

            {disponibilidades.map((disp, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted/30 p-2 rounded-md">
                <Select value={disp.dia} onValueChange={(v) => updateDisponibilidad(index, "dia", v)}>
                  <SelectTrigger className="bg-background h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIAS_OPTIONS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={disp.turno} onValueChange={(v) => updateDisponibilidad(index, "turno", v)}>
                  <SelectTrigger className="bg-background h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAÑANA">Mañana</SelectItem>
                    <SelectItem value="TARDE">Tarde</SelectItem>
                  </SelectContent>
                </Select>

                <Button type="button" variant="ghost" size="icon" onClick={() => removeDisponibilidad(index)} className="h-8 w-8 text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}