"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { FileText, CalendarDays, User2, ExternalLink, X, Loader2 } from "lucide-react";
import { NutricionistaApi } from "@/service/api";

export function NutricionistasTable() {
  const [reportes, setReportes] = useState<any[]>([]);
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
      const response = await NutricionistaApi.getReportes(
        filtroDesde,
        filtroHasta,
        currentPage,
        itemsPerPage
      );
      
      setReportes(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Error cargando reportes:", error);
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

  // --- LÓGICA DE PAGINACIÓN TRUNCADA (MÁXIMO 4-5 NÚMEROS) ---
  const renderPageNumbers = () => {
    const pages = [];
    const delta = 1; // Páginas a los lados de la actual

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

  return (
    <div className="space-y-4">
      {/* SECCIÓN DE FILTROS (Se mantiene igual) */}
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
          {totalElements} Reportes Totales
        </div>
      </div>

      {/* TABLA (Se mantiene igual) */}
      <div className="rounded-md border border-border overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[1px]">
            <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nutricionista</TableHead>
              <TableHead className="text-center">Periodo Semanal</TableHead>
              <TableHead className="text-right">Reporte</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isLoading ? "opacity-30" : "opacity-100"}>
            {reportes.length > 0 ? (
              reportes.map((reporte) => (
                <TableRow key={reporte.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <User2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-sm">{reporte.nombreNutricionista}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-4">
                      <Badge variant="secondary" className="bg-teal-50 text-teal-700 font-normal">
                        {new Date(reporte.fechaInicio + "T00:00:00").toLocaleDateString("es-AR")}
                      </Badge>
                      <span className="text-muted-foreground text-xs">→</span>
                      <Badge variant="secondary" className="bg-teal-50 text-teal-700 font-normal">
                        {new Date(reporte.fechaFinal + "T00:00:00").toLocaleDateString("es-AR")}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                          <FileText className="mr-2 h-4 w-4" /> Ver Reporte
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
                        <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                          <DialogTitle className="text-sm font-bold flex items-center gap-2">
                            <FileText className="h-4 w-4 text-red-500" />
                            Reporte: {reporte.nombreNutricionista}
                          </DialogTitle>
                          <Button variant="ghost" size="sm" onClick={() => window.open(reporte.archivo, "_blank")} className="mr-8">
                            <ExternalLink className="h-4 w-4 mr-2" /> Expandir
                          </Button>
                        </div>
                        <div className="flex-1 bg-muted relative">
                          <iframe 
                            src={`${reporte.archivo}#toolbar=0&view=FitH`} 
                            className="w-full h-full border-none" 
                            title="PDF Preview" 
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              !isLoading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-20 text-muted-foreground italic">
                    No se encontraron reportes.
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