"use client";

import React from "react"

import { useState } from "react";
import type { TipoDestinatario, TipoIntervencion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Home, Building, User, Users } from "lucide-react";

interface IntervencionFormProps {
  onSubmit: (data: {
    fecha: string;
    hora: string;
    destinatario: TipoDestinatario;
    nombreDestinatario: string;
    motivo: string;
    tipoIntervencion: TipoIntervencion;
    observaciones?: string;
  }) => void;
}

export function IntervencionForm({ onSubmit }: IntervencionFormProps) {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [destinatario, setDestinatario] = useState<TipoDestinatario>("familia");
  const [nombreDestinatario, setNombreDestinatario] = useState("");
  const [motivo, setMotivo] = useState("");
  const [tipoIntervencion, setTipoIntervencion] = useState<TipoIntervencion>("individual");
  const [observaciones, setObservaciones] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    onSubmit({
      fecha,
      hora,
      destinatario,
      nombreDestinatario,
      motivo,
      tipoIntervencion,
      observaciones: observaciones || undefined,
    });

    // Reset form
    setFecha("");
    setHora("");
    setDestinatario("familia");
    setNombreDestinatario("");
    setMotivo("");
    setTipoIntervencion("individual");
    setObservaciones("");
    setIsSubmitting(false);
  };

  const isValid = fecha && hora && nombreDestinatario && motivo;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fecha">Fecha de la intervención</Label>
          <Input
            id="fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="hora">Hora</Label>
          <Input
            id="hora"
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Label>Tipo de destinatario</Label>
        <RadioGroup
          value={destinatario}
          onValueChange={(v) => setDestinatario(v as TipoDestinatario)}
          className="flex gap-4"
          disabled={isSubmitting}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="familia" id="familia" />
            <Label
              htmlFor="familia"
              className="flex items-center gap-2 font-normal cursor-pointer"
            >
              <Home className="w-4 h-4 text-muted-foreground" />
              Familia
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="institución" id="institucion" />
            <Label
              htmlFor="institucion"
              className="flex items-center gap-2 font-normal cursor-pointer"
            >
              <Building className="w-4 h-4 text-muted-foreground" />
              Institución
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="nombreDestinatario">
          Nombre de la {destinatario === "familia" ? "familia" : "institución"}
        </Label>
        <Input
          id="nombreDestinatario"
          value={nombreDestinatario}
          onChange={(e) => setNombreDestinatario(e.target.value)}
          placeholder={
            destinatario === "familia"
              ? "Ej: Familia García"
              : "Ej: Escuela San Martín"
          }
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="motivo">Motivo de la intervención</Label>
        <Textarea
          id="motivo"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Describe el motivo o propósito de la intervención..."
          rows={3}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-3">
        <Label>Tipo de intervención</Label>
        <RadioGroup
          value={tipoIntervencion}
          onValueChange={(v) => setTipoIntervencion(v as TipoIntervencion)}
          className="flex gap-4"
          disabled={isSubmitting}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="individual" id="individual" />
            <Label
              htmlFor="individual"
              className="flex items-center gap-2 font-normal cursor-pointer"
            >
              <User className="w-4 h-4 text-muted-foreground" />
              Individual
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="equipo" id="equipo" />
            <Label
              htmlFor="equipo"
              className="flex items-center gap-2 font-normal cursor-pointer"
            >
              <Users className="w-4 h-4 text-muted-foreground" />
              En equipo
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="observaciones">Observaciones (opcional)</Label>
        <Textarea
          id="observaciones"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Notas adicionales sobre la intervención..."
          rows={2}
          disabled={isSubmitting}
        />
      </div>

      <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Registrando...
          </>
        ) : (
          "Registrar Intervención"
        )}
      </Button>
    </form>
  );
}
