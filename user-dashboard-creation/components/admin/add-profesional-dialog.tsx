"use client";

import React, { useState, useEffect } from "react";
import { DisponibilidadDto, UserRole, type createProfesionalDTO, type DiaSemana } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { useLoader } from "@/lib/spinnerService";

interface AddProfesionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: createProfesionalDTO) => void;
  role: UserRole; // Recibimos el rol desde el Dashboard
}

const DIAS_OPTIONS: { value: DiaSemana; label: string }[] = [
  { value: "LUNES", label: "Lunes" },
  { value: "MARTES", label: "Martes" },
  { value: "MIÉRCOLES", label: "Miércoles" },
  { value: "JUEVES", label: "Jueves" },
  { value: "VIERNES", label: "Viernes" },
];

export function AddProfesionalDialog({
  open,
  onOpenChange,
  onSubmit,
  role = "PROFESIONAL"
}: AddProfesionalDialogProps) {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [hourly, setHourly] = useState("40");
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadDto[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showLoader, hideLoader } = useLoader();

  // Flag para saber si mostrar campos extra
  const isProfesional = role === "PROFESIONAL";

  // Limpiar formulario al cerrar/abrir
  useEffect(() => {
    if (open) {
      setName("");
      setLastname("");
      setEmail("");
      setUsername("");
      setHourly("40");
      setDisponibilidad(isProfesional ? [{ dia: "LUNES", turno: "MAÑANA" }] : []);
      setError("");
    }
  }, [open, isProfesional]);

  const addDisponibilidad = () => {
    setDisponibilidad([...disponibilidad, { dia: "LUNES", turno: "MAÑANA" }]);
  };

  const updateDisponibilidad = (index: number, field: keyof DisponibilidadDto, value: string) => {
    const nuevas = [...disponibilidad];
    nuevas[index] = { ...nuevas[index], [field]: value as any };
    setDisponibilidad(nuevas);
  };

  const removeDisponibilidad = (index: number) => {
    setDisponibilidad(disponibilidad.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de duplicados solo para profesionales
    if (isProfesional) {
      const strings = disponibilidad.map((d) => `${d.dia}-${d.turno}`);
      if (strings.some((item, index) => strings.indexOf(item) !== index)) {
        setError("No puedes repetir el mismo turno para un mismo día.");
        return;
      }
      if (disponibilidad.length === 0) {
        setError("Debes asignar al menos un día de disponibilidad.");
        return;
      }
    }

    setError("");
    setIsSubmitting(true);

    try {
      showLoader();
      await onSubmit({ 
        name, 
        lastname, 
        email, 
        username, 
        hourly, 
        disponibilidad: isProfesional ? disponibilidad : [], 
        role 
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Error al cargar los datos");
    } finally {
      setIsSubmitting(false);
      hideLoader();
    }
  };

  useEffect(() => {
  if (role === "PROFESIONAL" && disponibilidad.length === 0) {
    setDisponibilidad([{ dia: "LUNES", turno: "MAÑANA" }]);
  } else if (role !== "PROFESIONAL") {
    // Si no es profesional, limpiamos la disponibilidad para evitar basura en el state
    setDisponibilidad([]);
  }
}, [role, open]); // Se ejecuta al cambiar el rol o al abrir el modal

const roleNames: Record<string, string> = {
  PROFESIONAL: "Profesional",
  NUTRICIONISTA: "Nutricionista",
  COCINERO: "Cocinero",
  MANTENIMIENTO: "Personal Técnico", // Aquí cambiamos el nombre
};

const friendlyRole = roleNames[role] || role;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar {friendlyRole}</DialogTitle>
          <DialogDescription>
  Completa los datos para el nuevo perfil de {friendlyRole.toLowerCase()}.
</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastname">Apellido</Label>
              <Input id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} required disabled={isSubmitting} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isSubmitting} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="hourly">Carga Horaria (hs/semana)</Label>
            <Input id="hourly" type="number" value={hourly} onChange={(e) => setHourly(e.target.value)} required disabled={isSubmitting} />
          </div>

          {/* RENDERIZADO CONDICIONAL: Solo si es PROFESIONAL */}
          {isProfesional && (
            <div className="flex flex-col gap-4 pt-2 border-t mt-2">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-primary">Disponibilidad Horaria</Label>
                <Button type="button" variant="outline" size="sm" onClick={addDisponibilidad} className="h-8 gap-1">
                  <Plus className="w-3 h-3" /> Añadir
                </Button>
              </div>

              <div className="flex flex-col gap-3 p-3 border rounded-md bg-slate-50/50">
                {disponibilidad.map((disp, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select value={disp.dia} onValueChange={(v) => updateDisponibilidad(index, "dia", v)}>
                      <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DIAS_OPTIONS.map((d) => (
                          <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={disp.turno} onValueChange={(v) => updateDisponibilidad(index, "turno", v)}>
                      <SelectTrigger className="bg-white w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MAÑANA">Mañana</SelectItem>
                        <SelectItem value="TARDE">Tarde</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button type="button" variant="ghost" size="icon" onClick={() => removeDisponibilidad(index)} className="text-destructive h-8 w-8">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
  Guardar {friendlyRole}
</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}