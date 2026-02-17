"use client";

import type { Intervencion, IntervencionDto } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, User, Home, Building, Eye } from "lucide-react";
import { profesionalApi } from "@/service/api";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ViewObs } from "./view-obs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";

interface IntervencionesTableProps {
  intervenciones: IntervencionDto[];
  getProfesionalName: (id: string) => string;
}

export function IntervencionesTable({
  intervenciones,
  getProfesionalName,
}: IntervencionesTableProps) {

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

const totalPages = Math.ceil(intervenciones.length / itemsPerPage);

const startIndex = (currentPage - 1) * itemsPerPage;
const currentIntervenciones = intervenciones.slice(
  startIndex,
  startIndex + itemsPerPage
);

const goToNextPage = () =>
  setCurrentPage((prev) => Math.min(prev + 1, totalPages));

const goToPreviousPage = () =>
  setCurrentPage((prev) => Math.max(prev - 1, 1));

  const formatDate = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
  if (currentPage > totalPages) {
    setCurrentPage(totalPages || 1);
  }
}, [intervenciones.length]);

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
            <TableHead className="text-center">Observaciones</TableHead>
            <TableHead className="text-center">Tipo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentIntervenciones.map((intervencion) => (
            <TableRow key={intervencion.intervencionId}>
              <TableCell className="font-medium">
                {formatDate(intervencion.fecha)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {intervencion.hora}
              </TableCell>
              <TableCell>
                {getProfesionalName(intervencion.creadorId)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {intervencion.tipo === "FAMILIA" ? (
                    <Home className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Building className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm">{intervencion.nombre}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm line-clamp-2">{intervencion.motivo}</p>
              </TableCell>
              <TableCell className="text-center">
                {intervencion.observaciones?.trim() ? (
                  <ViewObs intervencion={intervencion} />
                ) : (
                  <div className="flex items-center justify-center gap-1.5 text-muted-foreground/50 italic text-[13px]">
                    <span>Sin observaciones</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={
                    intervencion.intervencion === "EQUIPO"
                      ? "default"
                      : "secondary"
                  }
                  className="gap-1"
                >
                  {intervencion.intervencion === "EQUIPO" ? (
                    <Users className="w-3 h-3" />
                  ) : (
                    <User className="w-3 h-3" />
                  )}
                  {intervencion.intervencion === "EQUIPO"
                    ? "Equipo"
                    : "Individual"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
  <div className="mt-4">
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              goToPreviousPage();
            }}
            className={
              currentPage === 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>

        {[...Array(totalPages)].map((_, index) => {
          const pageNumber = index + 1;
          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#"
                isActive={currentPage === pageNumber}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(pageNumber);
                }}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              goToNextPage();
            }}
            className={
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>

    <p className="text-center text-xs text-muted-foreground mt-2">
      Página {currentPage} de {totalPages} ({intervenciones.length} registros)
    </p>
  </div>
)}

    </div>



  );
}
