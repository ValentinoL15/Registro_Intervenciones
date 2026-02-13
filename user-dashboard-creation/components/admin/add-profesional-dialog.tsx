"use client";

import React from "react"

import { useState } from "react";
import type { DiaSemana, Turno } from "@/lib/types";
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

interface AddProfesionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    nombre: string;
    apellido: string;
    email: string;
    cargaHoraria: number;
    dias: DiaSemana[];
    turno: Turno;
  }) => void;
}

const DIAS_OPTIONS: { value: DiaSemana; label: string }[] = [
  { value: "lunes", label: "Lunes" },
  { value: "martes", label: "Martes" },
  { value: "miércoles", label: "Miércoles" },
  { value: "jueves", label: "Jueves" },
  { value: "viernes", label: "Viernes" },
];

export function AddProfesionalDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddProfesionalDialogProps) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [cargaHoraria, setCargaHoraria] = useState("40");
  const [dias, setDias] = useState<DiaSemana[]>([]);
  const [turno, setTurno] = useState<Turno>("mañana");

  const handleDiaToggle = (dia: DiaSemana) => {
    setDias((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nombre,
      apellido,
      email,
      cargaHoraria: Number.parseInt(cargaHoraria),
      dias,
      turno,
    });
    // Reset form
    setNombre("");
    setApellido("");
    setEmail("");
    setCargaHoraria("40");
    setDias([]);
    setTurno("mañana");
  };

  const isValid =
    nombre && apellido && email && cargaHoraria && dias.length > 0 && turno;

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
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Juan"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Pérez"
                required
              />
            </div>
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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cargaHoraria">Carga Horaria (hs/semana)</Label>
              <Input
                id="cargaHoraria"
                type="number"
                min="1"
                max="48"
                value={cargaHoraria}
                onChange={(e) => setCargaHoraria(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="turno">Turno</Label>
              <Select value={turno} onValueChange={(v) => setTurno(v as Turno)}>
                <SelectTrigger id="turno">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mañana">Mañana</SelectItem>
                  <SelectItem value="tarde">Tarde</SelectItem>
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
                    checked={dias.includes(dia.value)}
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

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid}>
              Agregar Profesional
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
