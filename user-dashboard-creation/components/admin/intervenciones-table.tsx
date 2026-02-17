"use client";

import type { Intervencion } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, User, Home, Building } from "lucide-react";

interface IntervencionesTableProps {
  intervenciones: Intervencion[];
  getProfesionalName: (id: string) => string;
}

export function IntervencionesTable({
  intervenciones,
  getProfesionalName,
}: IntervencionesTableProps) {
  const formatDate = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (intervenciones.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No hay intervenciones registradas
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Fecha</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead>Profesional</TableHead>
            <TableHead>Destinatario</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead className="text-center">Tipo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {intervenciones.map((intervencion) => (
            <TableRow key={intervencion.id}>
              <TableCell className="font-medium">
                {formatDate(intervencion.fecha)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {intervencion.hora}
              </TableCell>
              <TableCell>
                {getProfesionalName(intervencion.profesionalUserId)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {intervencion.destinatario === "familia" ? (
                    <Home className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Building className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm">{intervencion.nombreDestinatario}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {intervencion.destinatario}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm line-clamp-2">{intervencion.motivo}</p>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={
                    intervencion.tipoIntervencion === "EQUIPO"
                      ? "default"
                      : "secondary"
                  }
                  className="gap-1"
                >
                  {intervencion.tipoIntervencion === "EQUIPO" ? (
                    <Users className="w-3 h-3" />
                  ) : (
                    <User className="w-3 h-3" />
                  )}
                  {intervencion.tipoIntervencion === "EQUIPO"
                    ? "Equipo"
                    : "Individual"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
