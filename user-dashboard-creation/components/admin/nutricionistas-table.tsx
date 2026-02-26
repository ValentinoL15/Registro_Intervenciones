"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { FileText, CalendarDays, User2, ExternalLink } from "lucide-react";

export function NutricionistasTable({ posteos }: { posteos: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 1. ORDENAMIENTO: Invertimos el array para que la fechaInicio más reciente (o futura) esté arriba
  const sortedPosteos = [...posteos].sort((a, b) => {
    return new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime();
  });

  // 2. LÓGICA DE PAGINACIÓN
  const totalPages = Math.ceil(sortedPosteos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPosteos = sortedPosteos.slice(startIndex, startIndex + itemsPerPage);

  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [posteos.length, totalPages, currentPage]);

  if (posteos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay reportes semanales registrados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nutricionista</TableHead>
              <TableHead className="text-center">Periodo Semanal</TableHead>
              <TableHead className="text-right">Reporte</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPosteos.map((reporte) => {
              // Verificamos si la fecha es futura para cambiar el color
              const esFuturo = new Date(reporte.fechaInicio) > new Date();
              
              return (
                <TableRow key={reporte.id}>
                  {/* COLUMNA NUTRICIONISTA */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <User2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-sm">{reporte.nombreNutricionista}</span>
                    </div>
                  </TableCell>

                  {/* COLUMNA PERIODO (DESDE / HASTA) */}
                  <TableCell>
                    <div className="flex items-center justify-center gap-4">
                      {/* Fecha Inicio */}
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Desde</span>
                        <Badge 
                          variant="secondary" 
                          className={`font-normal ${
                            esFuturo 
                              ? "bg-purple-50 text-purple-700 border-purple-200" 
                              : "bg-teal-50 text-teal-700 border-teal-200"
                          }`}
                        >
                          <CalendarDays className="mr-1.5 h-3 w-3" />
                          {new Date(reporte.fechaInicio).toLocaleDateString("es-AR")}
                        </Badge>
                      </div>

                      {/* Fecha Final */}
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Hasta</span>
                        <Badge 
                          variant="secondary" 
                          className={`font-normal ${
                            esFuturo 
                              ? "bg-purple-50 text-purple-700 border-purple-200" 
                              : "bg-teal-50 text-teal-700 border-teal-200"
                          }`}
                        >
                          <CalendarDays className="mr-1.5 h-3 w-3" />
                          {new Date(reporte.fechaFinal).toLocaleDateString("es-AR")}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>

                  {/* COLUMNA ACCIONES (PDF) */}
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                          <FileText className="mr-2 h-4 w-4" /> Ver Reporte
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                        <DialogHeader className="flex flex-row items-center justify-between border-b pb-2">
                          <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-red-500" />
                            Reporte Semanal: {reporte.nombreNutricionista}
                          </DialogTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(reporte.archivo, "_blank")}
                            className="mr-6"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" /> Expandir
                          </Button>
                        </DialogHeader>
                        
                        {/* Visualizador Adaptado */}
                        <div className="flex-1 w-full bg-muted rounded-md overflow-hidden mt-4 relative">
                          {reporte.archivo.match(/\.(jpeg|jpg|gif|png)$/) ? (
                            <div className="w-full h-full overflow-auto flex justify-center bg-black/5 p-4">
                              <img
                                src={reporte.archivo}
                                alt="Reporte"
                                className="max-w-full h-auto object-contain shadow-lg"
                              />
                            </div>
                          ) : (
                            <iframe
                              src={`${reporte.archivo}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                              className="w-full h-full border-none"
                              title="Vista previa"
                            />
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              );
            })}
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
                  onClick={(e) => { e.preventDefault(); goToPreviousPage(); }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index + 1}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === index + 1}
                    onClick={(e) => { e.preventDefault(); setCurrentPage(index + 1); }}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); goToNextPage(); }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Página {currentPage} de {totalPages} ({posteos.length} registros)
          </p>
        </div>
      )}
    </div>
  );
}