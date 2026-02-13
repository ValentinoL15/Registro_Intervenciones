"use client";

import type { Intervencion } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Users, User, Home, Building, Calendar, Clock } from "lucide-react";

interface MisIntervencionesProps {
  intervenciones: Intervencion[];
}

export function MisIntervenciones({ intervenciones }: MisIntervencionesProps) {
  const formatDate = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (intervenciones.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No tienes intervenciones registradas
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Registra tu primera intervención en la pestaña anterior
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {intervenciones.map((intervencion) => (
        <div
          key={intervencion.id}
          className="p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
        >
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge
              variant={
                intervencion.tipoIntervencion === "equipo"
                  ? "default"
                  : "secondary"
              }
              className="gap-1"
            >
              {intervencion.tipoIntervencion === "equipo" ? (
                <Users className="w-3 h-3" />
              ) : (
                <User className="w-3 h-3" />
              )}
              {intervencion.tipoIntervencion === "equipo"
                ? "Equipo"
                : "Individual"}
            </Badge>
            <Badge variant="outline" className="gap-1">
              {intervencion.destinatario === "familia" ? (
                <Home className="w-3 h-3" />
              ) : (
                <Building className="w-3 h-3" />
              )}
              {intervencion.destinatario === "familia"
                ? "Familia"
                : "Institución"}
            </Badge>
          </div>

          <h3 className="font-semibold text-foreground mb-1">
            {intervencion.nombreDestinatario}
          </h3>

          <p className="text-sm text-muted-foreground mb-3">
            {intervencion.motivo}
          </p>

          {intervencion.observaciones && (
            <p className="text-sm text-muted-foreground italic mb-3 p-2 rounded bg-muted/50">
              {intervencion.observaciones}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(intervencion.fecha)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {intervencion.hora}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
