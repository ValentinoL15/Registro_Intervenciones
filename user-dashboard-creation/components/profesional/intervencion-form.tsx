"use client";

import React from "react"

import { useState } from "react";
import type { DestinyType, IntervencionType, TipoDestinatario, TipoIntervencion } from "@/lib/types";
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
import { Loader2, Home, Building, User, Users, AlertCircle } from "lucide-react";
import { useLoader } from "@/lib/spinnerService";

interface createProfesionalDTO {
  onSubmit: (data: {
    tipo: DestinyType,
    nombre: string
    fecha: string,
    hora: string,
    motivo: string,
    intervencion: IntervencionType
    observaciones: string,
    profesionalesIds: string[]
  }) => void;
}

export function IntervencionForm({ onSubmit }: createProfesionalDTO) {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [tipo, setTipo] = useState<DestinyType>("FAMILIA");
  const [nombre, setNombre] = useState("");
  const [motivo, setMotivo] = useState("");
  const [intervencion, setTipoIntervencion] = useState<IntervencionType>("INDIVIDUAL");
  const [observaciones, setObservaciones] = useState("");
  const [profesionalesIds, setProfesionalesIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const { showLoader, hideLoader } = useLoader();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {

      showLoader()

      const fechaCompleta = `${fecha}T${hora}${hora.length === 5 ? ":00" : ""}`;

      await onSubmit({
        fecha: fechaCompleta,
        hora,
        tipo,
        nombre,
        motivo,
        intervencion,
        observaciones,
        profesionalesIds
      });

      // Reset form
      setFecha("");
      setHora("");
      setTipo("FAMILIA");
      setNombre("");
      setMotivo("");
      setTipoIntervencion("INDIVIDUAL");
      setObservaciones("");
      setProfesionalesIds([])
      setIsSubmitting(false);

    } catch (err: any) {
      console.error(err.message)
      setError(err.message || "No se pudo realizar el registro")
      setIsSubmitting(false)
    } finally {
      hideLoader()
    }

  };

  const isValid = fecha && hora && nombre && motivo && tipo && intervencion;

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
          value={tipo}
          onValueChange={(v) => setTipo(v as DestinyType)}
          className="flex gap-4"
          disabled={isSubmitting}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="FAMILIA" id="familia" />
            <Label
              htmlFor="familia"
              className="flex items-center gap-2 font-normal cursor-pointer"
            >
              <Home className="w-4 h-4 text-muted-foreground" />
              Familia
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="INSTITUCION" id="institucion" />
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nombre">
          Nombre de la {tipo === "FAMILIA" ? "familia" : "institución"}
        </Label>

        <Input
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder={
            tipo === "FAMILIA"
              ? "Ej: Familia García"
              : "Ej: Escuela San Martín"
          }
          required
          disabled={isSubmitting}
          maxLength={30} // Límite de caracteres
          className={nombre.length >= 30 ? "border-destructive focus-visible:ring-destructive" : ""}
        />

        <div className="flex justify-end px-1">
          <span
            className={`text-[10px] font-medium transition-colors ${nombre.length >= 30
                ? "text-destructive"
                : "text-muted-foreground/60"
              }`}
          >
            {nombre.length} / 30
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="motivo">Motivo de la intervención</Label>

        <div className="relative">
          <Textarea
            id="motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Describe el motivo o propósito de la intervención..."
            rows={4}
            required
            disabled={isSubmitting}
            maxLength={60}
            className="resize-none pb-8" // Añadimos padding abajo para que el texto no pise el contador
          />

          <div className="absolute bottom-2 right-3">
            <span
              className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-background/80 backdrop-blur-sm ${motivo.length >= 60 ? 'text-destructive' : 'text-muted-foreground'
                }`}
            >
              {motivo.length} / 60
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Label>Tipo de intervención</Label>
        <RadioGroup
          value={intervencion}
          onValueChange={(v) => setTipoIntervencion(v as IntervencionType)}
          className="flex gap-4"
          disabled={isSubmitting}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="INDIVIDUAL" id="individual" />
            <Label
              htmlFor="individual"
              className="flex items-center gap-2 font-normal cursor-pointer"
            >
              <User className="w-4 h-4 text-muted-foreground" />
              Individual
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="EQUIPO" id="equipo" />
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

        <div className="relative">
          <Textarea
            id="observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Notas adicionales sobre la intervención..."
            rows={3}
            disabled={isSubmitting}
            maxLength={200}
            className="resize-none pb-7" // Espacio inferior para que el texto no se solape con el contador
          />

          <div className="absolute bottom-2 right-3 pointer-events-none">
            <span
              className={`text-[10px] font-mono font-medium px-1 rounded ${observaciones.length >= 200
                ? 'text-destructive'
                : 'text-muted-foreground/70'
                }`}
            >
              {observaciones.length}/200
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
