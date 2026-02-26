"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Calendar, Wrench, User2, ClipboardCheck } from "lucide-react";
import { MantenimientoDto } from "@/lib/types";

export function MantenimientosTable({ tareas }: { tareas: MantenimientoDto[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(tareas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTareas = tareas.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages || 1);
  }, [tareas.length, totalPages, currentPage]);

  if (tareas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay registros de mantenimiento</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[220px]">Técnico</TableHead>
              <TableHead className="w-[150px]">Fecha</TableHead>
              <TableHead>Descripción de la Tarea</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTareas.map((tarea) => (
              <TableRow key={tarea.mantenimientoId} className="hover:bg-muted/30 transition-colors">
                {/* Técnico */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <User2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-sm">{tarea.nombreEmpleado}</span>
                  </div>
                </TableCell>

                {/* Fecha */}
                <TableCell>
                  <Badge variant="outline" className="font-normal flex w-fit gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                    {tarea.fecha}
                  </Badge>
                </TableCell>

                {/* Descripción */}
                <TableCell>
                  <div className="flex items-start gap-2">
                    <ClipboardCheck className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tarea.description}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación idéntica a las anteriores */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(p - 1, 1)); }} 
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink 
                    href="#" 
                    isActive={currentPage === i + 1}
                    onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(p + 1, totalPages)); }} 
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}