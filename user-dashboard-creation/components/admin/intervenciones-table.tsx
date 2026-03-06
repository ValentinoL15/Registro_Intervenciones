"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { IntervencionDto, User } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, User as UserIcon, Home, Building, Calendar, X, Loader2 } from "lucide-react";
import { profesionalApi } from "@/service/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ViewObs } from "./view-obs";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "../ui/pagination";

export function IntervencionesTable() {
  const [intervenciones, setIntervenciones] = useState<IntervencionDto[]>([]);
  const [profesionales, setProfesionales] = useState<User[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  const getProfesionalName = (profesionalId: any) => {
    if (!profesionalId) return "Desconocido";
    const prof = profesionales.find((p) => String(p.userId) === String(profesionalId));
    return prof ? `${prof.name} ${prof.lastname}` : "Desconocido";
  };

  const loadInitialData = useCallback(async () => {
    try {
      const dataProfs = await profesionalApi.getProfesionales();
      // Asumimos que getProfesionales devuelve un array directo o un content
      setProfesionales(Array.isArray(dataProfs) ? dataProfs : dataProfs.content || []);
    } catch (err) {
      console.error("Error cargando profesionales en tabla:", err);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await profesionalApi.getIntervenciones(
        filtroDesde || undefined,
        filtroHasta || undefined,
        currentPage,
        itemsPerPage
      );

      setIntervenciones(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Error al cargar intervenciones:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filtroDesde, filtroHasta, currentPage]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(0);
  }, [filtroDesde, filtroHasta]);

  // --- LÓGICA DE PAGINACIÓN TRUNCADA ---
  const renderPageNumbers = () => {
    const pages = [];
    const delta = 1; 

    for (let i = 0; i < totalPages; i++) {
      if (
        i === 0 || 
        i === totalPages - 1 || 
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={currentPage === i}
              onClick={(e) => { e.preventDefault(); setCurrentPage(i); }}
              className="cursor-pointer h-8 w-8 text-xs"
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (i === currentPage - delta - 1 || i === currentPage + delta + 1) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationEllipsis className="h-8 w-8" />
          </PaginationItem>
        );
      }
    }
    return pages;
  };

  const formatDate = (fecha: any) => {
    if (!fecha) return "-";
    const fechaLimpia = typeof fecha === 'string' && fecha.includes("T") ? fecha.split("T")[0] : fecha;
    return new Date(fechaLimpia + "T00:00:00").toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* SECCIÓN DE FILTROS */}
      <div className="flex flex-wrap items-end gap-4 bg-muted/20 p-4 rounded-lg border border-dashed border-border">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Desde</Label>
          <Input 
            type="date" 
            value={filtroDesde} 
            onChange={(e) => setFiltroDesde(e.target.value)} 
            className="w-40 h-9 bg-background text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Hasta</Label>
          <Input 
            type="date" 
            value={filtroHasta} 
            onChange={(e) => setFiltroHasta(e.target.value)} 
            className="w-40 h-9 bg-background text-sm"
          />
        </div>
        {(filtroDesde || filtroHasta) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { setFiltroDesde(""); setFiltroHasta(""); }}
            className="h-9 text-muted-foreground hover:text-destructive gap-2"
          >
            <X className="h-4 w-4" /> Limpiar
          </Button>
        )}
        <div className="ml-auto text-[10px] font-bold text-muted-foreground uppercase bg-background px-2 py-1 rounded border">
          {totalElements} Intervenciones
        </div>
      </div>

      <div className="rounded-md border border-border overflow-hidden relative bg-card">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[1px] transition-opacity duration-300">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold">Fecha</TableHead>
              <TableHead className="font-bold">Hora</TableHead>
              <TableHead className="font-bold">Profesional</TableHead>
              <TableHead className="font-bold">Destinatario</TableHead>
              <TableHead className="font-bold">Motivo</TableHead>
              <TableHead className="text-center font-bold">Observaciones</TableHead>
              <TableHead className="text-center font-bold">Tipo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isLoading ? "opacity-30" : "opacity-100 transition-opacity"}>
            {intervenciones.length > 0 ? (
              intervenciones.map((intervencion) => (
                <TableRow key={intervencion.intervencionId} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium whitespace-nowrap text-xs">
                    {formatDate(intervencion.fecha)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {intervencion.hora}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate text-blue-700 font-medium text-xs">
                    {getProfesionalName(intervencion.creadorId)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {intervencion.tipo === "FAMILIA" ? (
                        <Home className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <Building className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      <span className="text-xs">{intervencion.nombre}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs line-clamp-1 max-w-[200px]">{intervencion.motivo}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    {intervencion.observaciones?.trim() ? (
                      <ViewObs intervencion={intervencion} />
                    ) : (
                      <span className="text-muted-foreground/30 italic text-[10px]">Sin obs.</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={intervencion.intervencion === "EQUIPO" ? "default" : "secondary"}
                      className="text-[9px] uppercase font-bold px-2 py-0"
                    >
                      {intervencion.intervencion === "EQUIPO" ? "Equipo" : "Indiv."}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              !isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground italic text-sm">
                    No se encontraron intervenciones.
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINACIÓN TRUNCADA */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(0, p - 1)); }}
                  className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {renderPageNumbers()}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages - 1, p + 1)); }}
                  className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}