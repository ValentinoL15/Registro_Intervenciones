"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Calendar, User2, ClipboardCheck, X, Loader2 } from "lucide-react";
import { MantenimientoDto } from "@/lib/types";
import { EmpleadoApi } from "@/service/api";

export function MantenimientosTable() {
  const [tareas, setTareas] = useState<MantenimientoDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Quitamos el showLoader global para usar solo el local de la tabla
      const response = await EmpleadoApi.getAllMantenimientos(
        filtroDesde,
        filtroHasta,
        currentPage,
        itemsPerPage
      );
      
      setTareas(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Error al cargar mantenimientos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filtroDesde, filtroHasta]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(0);
  }, [filtroDesde, filtroHasta]);

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
          {totalElements} Registros Totales
        </div>
      </div>

      {/* CONTENEDOR DE TABLA AUTO-AJUSTABLE (Sin min-h) */}
      <div className="rounded-md border border-border overflow-hidden relative">
        
        {/* OVERLAY DE CARGA LOCAL */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[1px] transition-all duration-300">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-2 text-[10px] font-bold uppercase text-muted-foreground animate-pulse">
              Sincronizando tareas...
            </p>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[220px]">Técnico</TableHead>
              <TableHead className="w-[180px]">Fecha</TableHead>
              <TableHead>Descripción de la Tarea</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isLoading ? "opacity-30" : "opacity-100 transition-opacity"}>
            {tareas.length > 0 ? (
              tareas.map((tarea) => (
                <TableRow key={tarea.mantenimientoId} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <User2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-sm">{tarea.nombreEmpleado}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-semibold flex w-fit gap-1.5 bg-background border-blue-200 text-blue-800">
                      <Calendar className="h-3.5 w-3.5 text-blue-600" />
                      {new Date(tarea.fecha + "T00:00:00").toLocaleDateString("es-AR")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <ClipboardCheck className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <p className="max-w-[600px] break-words whitespace-normal leading-relaxed text-foreground text-sm">
                        {tarea.description}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              !isLoading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10 text-muted-foreground italic text-sm border-t border-dashed">
                    No hay tareas registradas en este periodo.
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(0, p - 1)); }} 
                  className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    href="#" 
                    isActive={currentPage === i}
                    onClick={(e) => { e.preventDefault(); setCurrentPage(i); }}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(p + 1, totalPages - 1)); }} 
                  className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <p className="text-center text-[10px] text-muted-foreground mt-2 uppercase font-medium">
            Página {currentPage + 1} de {totalPages}
          </p>
        </div>
      )}
    </div>
  );
}