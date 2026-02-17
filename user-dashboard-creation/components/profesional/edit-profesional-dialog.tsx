"use client";

import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "../ui/field";
import { DestinyType, IntervencionDto, IntervencionType } from "@/lib/types";
import { AlertCircle, Building, Home, Loader2, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { RadioGroup } from "@/components/ui/radio-group";
import { profesionalApi } from "@/service/api";

interface EditProfesionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intervencion: IntervencionDto | null;
  onSuccess: () => void;
}

export function EditProfesionalDialog({ open, onOpenChange, intervencion, onSuccess }: EditProfesionalDialogProps) {

  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [tipo, setTipo] = useState<DestinyType>("FAMILIA");
  const [nombre, setNombre] = useState("");
  const [motivo, setMotivo] = useState("");
  const [tipoInter, setTipoIntervencion] = useState<IntervencionType>("INDIVIDUAL");
  const [observaciones, setObservaciones] = useState("");
  const [profesionalesIds, setProfesionalesIds] = useState<string[]>([])
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (intervencion) {
      setFecha(intervencion.fecha ? intervencion.fecha.split('T')[0] : "");
      setHora(intervencion.hora || "");
      setTipo(intervencion.tipo || "FAMILIA");
      setNombre(intervencion.nombre || "");
      setMotivo(intervencion.motivo || "");
      setTipoIntervencion(intervencion.intervencion || "INDIVIDUAL");
      setObservaciones(intervencion.observaciones || "");
      setProfesionalesIds(intervencion.profesionalesIds || [])
    }
  }, [intervencion, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      
      if(intervencion) {
      const fechaISO = `${fecha}T${hora.length === 5 ? hora + ":00" : hora}`;
      
      const updatedData = {
        ...intervencion,
        fecha: fechaISO,
        hora,
        tipo,
        nombre,
        motivo,
        intervencion: tipoInter,
        observaciones,
        profesionalesIds
      };

      await profesionalApi.editIntervencion(intervencion.intervencionId, updatedData);
      onSuccess();
      onOpenChange(false); 
      }
      
    } catch (err: any) {
      setError(err.message || "Error al actualizar la intervención");
      console.error(err.message)
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = fecha && hora && nombre && motivo;


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Intervención</DialogTitle>
          <DialogDescription>
            Modifica los datos de la intervención realizada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4">
          {/* FECHA Y HORA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-fecha">Fecha</Label>
              <Input
                id="edit-fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-hora">Hora</Label>
              <Input
                id="edit-hora"
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
              />
            </div>
          </div>

          {/* TIPO DESTINATARIO */}
          <div className="flex flex-col gap-3">
            <Label>Tipo de destinatario</Label>
            <RadioGroup
              value={tipo}
              onValueChange={(v) => setTipo(v as DestinyType)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="FAMILIA" id="edit-familia" />
                <Label htmlFor="edit-familia" className="flex items-center gap-2 font-normal">
                  <Home className="w-4 h-4" /> Familia
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="INSTITUCION" id="edit-institucion" />
                <Label htmlFor="edit-institucion" className="flex items-center gap-2 font-normal">
                  <Building className="w-4 h-4" /> Institución
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* NOMBRE */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="nombre">
              Nombre de la {tipo === "FAMILIA" ? "familia" : "institución"}
            </Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          {/* MOTIVO */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-motivo">Motivo de la intervención</Label>
            <Textarea
              id="edit-motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* TIPO INTERVENCION */}
          <div className="flex flex-col gap-3">
            <Label>Tipo de intervención</Label>
            <RadioGroup
              value={tipoInter}
              onValueChange={(v) => setTipoIntervencion(v as IntervencionType)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="INDIVIDUAL" id="edit-individual" />
                <Label htmlFor="edit-individual" className="flex items-center gap-2 font-normal">
                  <User className="w-4 h-4" /> Individual
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="EQUIPO" id="edit-equipo" />
                <Label htmlFor="edit-equipo" className="flex items-center gap-2 font-normal">
                  <Users className="w-4 h-4" /> En equipo
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* OBSERVACIONES */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-obs">Observaciones (opcional)</Label>
            <Textarea
              id="edit-obs"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* BOTONES */}
          <div className="flex justify-end gap-3 mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}