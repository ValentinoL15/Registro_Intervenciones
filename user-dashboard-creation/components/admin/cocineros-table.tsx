"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Calendar, User2, Ban, CheckCircle2, X, Loader2 } from "lucide-react";
import { CocineroApi } from "@/service/api";

export function CocinerosTable() {
  const [menus, setMenus] = useState<any[]>([]);
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
      const response = await CocineroApi.getMenus(
        filtroDesde,
        filtroHasta,
        currentPage,
        itemsPerPage
      );

      setMenus(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Error cargando menús:", error);
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

  // --- LÓGICA DE PAGINACIÓN COMPACTA ---
  const renderPageNumbers = () => {
    const pages = [];
    const delta = 1; // Páginas visibles a los lados de la actual

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
              className={`cursor-pointer h-8 w-8 text-xs ${
                currentPage === i ? "bg-orange-600 text-white hover:bg-orange-700 hover:text-white" : ""
              }`}
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
      {/* PANEL DE FILTROS (Se mantiene igual) */}
      <div className="flex flex-wrap items-end gap-4 bg-muted/20 p-4 rounded-lg border border-dashed border-border">
        {/* ... (código de inputs) */}
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
          {totalElements} Menús Totales
        </div>
      </div>

      {/* TABLA (Se mantiene igual) */}
      <div className="rounded-md border border-border overflow-hidden relative bg-card">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[200px]">Cocinero</TableHead>
              <TableHead className="w-[150px]">Fecha</TableHead>
              <TableHead>Menú del Día</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isLoading ? "opacity-30" : "opacity-100 transition-opacity"}>
            {/* ... (mapeo de menus igual) */}
            {menus.length > 0 ? (
              menus.map((menu) => (
                <TableRow key={menu.menuId} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="align-top">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                        <User2 className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="font-medium text-sm">{menu.nombreCocinero}</span>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge variant="outline" className="font-normal flex w-fit gap-1.5 bg-background">
                      <Calendar className="h-3.5 w-3.5 text-orange-600" />
                      {new Date(menu.fecha + "T00:00:00").toLocaleDateString("es-AR")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {menu.cocina?.map((plato: any) => (
                        <div 
                          key={plato.id} 
                          className={`p-2 rounded-lg border text-xs shadow-sm flex flex-col gap-1 ${
                            plato.tipoComida === 'CELIACO' ? 'bg-orange-50/40 border-orange-100' : 'bg-green-50/40 border-green-100'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] opacity-70">
                            {plato.tipoComida === 'CELIACO' ? <><Ban className="w-3 h-3 text-orange-600" /> Celiaco</> : <><CheckCircle2 className="w-3 h-3 text-green-600" /> General</>}
                          </div>
                          <p className="italic text-muted-foreground line-clamp-2 leading-relaxed">"{plato.description}"</p>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              !isLoading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12 text-muted-foreground italic text-sm border rounded-md border-dashed">
                    No se encontraron menús para este periodo.
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINACIÓN COMPACTA */}
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