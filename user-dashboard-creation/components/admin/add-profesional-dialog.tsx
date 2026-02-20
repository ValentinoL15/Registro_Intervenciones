"use client";

import React from "react"

import { useState } from "react";
import { DisponibilidadDto, UserRole, type createProfesionalDTO, type DiaSemana, type Turno } from "@/lib/types";
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
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Badge, Plus, Trash2, X } from "lucide-react";
import { useLoader } from "@/lib/spinnerService";

interface AddProfesionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: createProfesionalDTO) => void;
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
}: AddProfesionalDialogProps) {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>("PROFESIONAL");
  const [hourly, setHourly] = useState("40");
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadDto[]>([
    { dia: "LUNES", turno: "MAÑANA" }
  ]);
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false); // Nuevo estado
  const { showLoader, hideLoader } = useLoader()

  const addDisponibilidad = () => {
    // Simplemente agregamos una fila nueva. 
    setDisponibilidad([...disponibilidad, { dia: "LUNES", turno: "MAÑANA" }]);
  };

  const updateDisponibilidad = (index: number, field: keyof DisponibilidadDto, value: string) => {
    const nuevas = [...disponibilidad];
    nuevas[index] = { ...nuevas[index], [field]: value };
    setDisponibilidad(nuevas);
  };

  const removeDisponibilidad = (index: number) => {
    setDisponibilidad(disponibilidad.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => { // Agregamos async
    e.preventDefault();

    const strings = disponibilidad.map(d => `${d.dia}-${d.turno}`);
    const tieneDuplicados = strings.some((item, index) => strings.indexOf(item) !== index);

    if (tieneDuplicados) {
      setError("No puedes repetir el mismo turno para un mismo día.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      showLoader()
      // 1. Esperamos a que la función del padre termine
      await onSubmit({ name, lastname, email, username, hourly, disponibilidad, role });

      setName("");
      setLastname("");
      setEmail("");
      setUsername("");
      setHourly("40");
      setDisponibilidad([])
      setRole("PROFESIONAL");

    } catch (err: any) {
      // 3. Ahora sí capturará el error de validación de Spring Boot
      console.error("Error capturado en el Dialog:", err);
      setError(err.message || "Error al cargar los datos");
    } finally {
      setIsSubmitting(false);
      hideLoader()
    }
  }

  const isValid =
    name && lastname && email && hourly && disponibilidad.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Profesional</DialogTitle>
          <DialogDescription>
            Ingresa los datos del nuevo profesional
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastname">Apellido</Label>
              <Input
                id="lastname"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                placeholder="Pérez"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Juan05"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan.perez@institucion.com"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Carga Horaria (Campo Único) */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="hourly">Carga Horaria (hs/semana)</Label>
            <Input
              id="hourly"
              type="number"
              value={hourly}
              onChange={(e) => setHourly(e.target.value)}
              placeholder="Ej: 40"
              className="w-full"
            />
          </div>



          {/* Selector de Disponibilidad (Día + Turno + Botón) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Label>Días y Turnos Asignados</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDisponibilidad}
                className="gap-2"
              >
                <Plus className="w-4 h-4" /> Agregar Día
              </Button>
            </div>

            <div className="flex flex-col gap-3 p-3 border rounded-md bg-slate-50/50 max-h-[200px] overflow-y-auto">
              {disponibilidad.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No has asignado días todavía.
                </p>
              ) : (
                disponibilidad.map((disp, index) => (
                  <div key={index} className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                    {/* Selector de Día */}
                    <Select
                      value={disp.dia}
                      onValueChange={(v) => updateDisponibilidad(index, "dia", v)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIAS_OPTIONS.map((d) => (
                          <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Selector de Turno */}
                    <Select
                      value={disp.turno}
                      onValueChange={(v) => updateDisponibilidad(index, "turno", v)}
                    >
                      <SelectTrigger className="bg-white w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MAÑANA">Mañana</SelectItem>
                        <SelectItem value="TARDE">Tarde</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Botón Eliminar Fila */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDisponibilidad(index)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Agregar Profesional
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
