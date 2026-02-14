"use client";

import React from "react"

import { useState } from "react";
import { UserRole, type createProfesionalDTO, type DiaSemana, type Turno } from "@/lib/types";
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
import { AlertCircle } from "lucide-react";
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
  const [days, setDays] = useState<DiaSemana[]>([]);
  const [turno, setTurno] = useState<Turno>("MAÑANA");
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false); // Nuevo estado
  const { showLoader, hideLoader } = useLoader()

  const handleDiaToggle = (dia: DiaSemana) => {
    setDays((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => { // Agregamos async
  e.preventDefault();
  setError("");
  setIsSubmitting(true);

  try {
    showLoader()
    // 1. Esperamos a que la función del padre termine
    await onSubmit({ name, lastname, email, username, hourly, days, turno, role });
    
    setName("");
    setLastname("");
    setEmail("");
    setUsername(""); 
    setHourly("40");
    setDays([]);
    setTurno("MAÑANA");
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
    name && lastname && email && hourly && days.length > 0 && turno;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="hourly">Carga Horaria (hs/semana)</Label>
              <Input
                id="hourly"
                type="number"
                min="1"
                max="48"
                value={hourly}
                onChange={(e) => setHourly(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="turno">Turno</Label>
              <Select value={turno} onValueChange={(v) => setTurno(v as Turno)}>
                <SelectTrigger id="turno">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAÑANA">Mañana</SelectItem>
                  <SelectItem value="TARDE">Tarde</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Días de trabajo</Label>
            <div className="flex flex-wrap gap-4">
              {DIAS_OPTIONS.map((dia) => (
                <div key={dia.value} className="flex items-center gap-2">
                  <Checkbox
                    id={dia.value}
                    checked={days.includes(dia.value)}
                    onCheckedChange={() => handleDiaToggle(dia.value)}
                  />
                  <Label
                    htmlFor={dia.value}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {dia.label}
                  </Label>
                </div>
              ))}
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
            <Button  type="submit" disabled={isSubmitting}>
              Agregar Profesional
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
