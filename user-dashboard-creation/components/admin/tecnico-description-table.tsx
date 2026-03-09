"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarDays,
  UserCircle,
  X,
  Search
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

interface TecnicoDescriptionTableProps {
  data: {
    content: any[];
    totalPages: number;
    number: number;
    totalElements: number;
  };
  getProfesionalName: (id: string) => string;
  onPageChange: (newPage: number) => void;
  filtroDesde: string;
  filtroHasta: string;
  setFiltroDesde: (val: string) => void;
  setFiltroHasta: (val: string) => void;
}

export function TecnicoDescriptionTable({
  data,
  getProfesionalName,
  onPageChange,
  filtroDesde,
  filtroHasta,
  setFiltroDesde,
  setFiltroHasta
}: TecnicoDescriptionTableProps) {
  const descripciones = data.content || [];

  // --- LÓGICA DE PAGINACIÓN COMPACTA (4 NÚMEROS + PUNTITOS) ---
  const renderPageNumbers = () => {
    const pages = [];
    const totalPages = data.totalPages;
    const current = data.number;
    
    // Determinamos el rango de páginas centrales (queremos mostrar 4 números en total)
    // Mostramos la primera, la última y 2 más cerca de la actual
    const delta = 1; 

    for (let i = 0; i < totalPages; i++) {
      // Regla: Mostrar siempre la primera (0), la última (totalPages - 1)
      // y las páginas inmediatamente adyacentes a la actual
      if (
        i === 0 || 
        i === totalPages - 1 || 
        (i >= current - delta && i <= current + delta)
      ) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={current === i}
              onClick={(e) => { e.preventDefault(); onPageChange(i); }}
              className={`cursor-pointer h-8 w-8 text-xs ${
                current === i ? "bg-indigo-600 text-white hover:bg-indigo-700" : ""
              }`}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        );
      } 
      // Agregar elipsis si hay un hueco mayor a 1 entre los números
      else if (i === current - delta - 1 || i === current + delta + 1) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationEllipsis className="h-8 w-8 text-slate-400" />
          </PaginationItem>
        );
      }
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      {/* SECCIÓN DE FILTROS */}
      <div className="flex flex-wrap items-end gap-4 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase text-slate-500">Desde</Label>
          <Input
            type="date"
            value={filtroDesde}
            onChange={(e) => setFiltroDesde(e.target.value)}
            className="w-40 h-9 bg-white text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase text-slate-500">Hasta</Label>
          <Input
            type="date"
            value={filtroHasta}
            onChange={(e) => setFiltroHasta(e.target.value)}
            className="w-40 h-9 bg-white text-sm"
          />
        </div>
        {(filtroDesde || filtroHasta) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFiltroDesde("");
              setFiltroHasta("");
            }}
            className="h-9 text-slate-500 hover:text-red-600 gap-2"
          >
            <X className="h-4 w-4" /> Limpiar
          </Button>
        )}
        <div className="ml-auto flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase bg-white px-3 py-1.5 rounded-lg border shadow-sm">
          <Search className="w-3 h-3" />
          {data.totalElements} registros
        </div>
      </div>

      {/* TABLA SIN LEER MÁS (TEXTO FLUIDO COMPLETO) */}
      <div className="rounded-xl border border-border overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="w-[200px]">Profesional</TableHead>
              <TableHead className="w-[160px]">Fecha</TableHead>
              <TableHead>Descripción / Actividad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {descripciones.length > 0 ? (
              descripciones.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/30 transition-colors align-top">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 shrink-0">
                        <UserCircle className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span className="font-semibold text-xs text-slate-700">
                        {getProfesionalName(item.tecnicoId || item.userId)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className="font-bold text-[10px] bg-slate-50 border-slate-200 text-slate-600 whitespace-nowrap">
                      <CalendarDays className="h-3 w-3 mr-1 text-indigo-500" />
                      {format(new Date(item.fecha + "T00:00:00"), "dd MMM, yyyy", { locale: es })}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="pr-4">
                      {/* break-all: rompe palabras infinitas sin espacios.
                        whitespace-pre-wrap: mantiene los saltos de línea del usuario.
                        Sin line-clamp para mostrar todo el contenido.
                      */}
                      <p className="text-sm text-slate-600 leading-relaxed break-all whitespace-pre-wrap">
                        {item.description}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground italic text-sm">
                  No se encontraron registros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINACIÓN */}
      {data.totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if(data.number > 0) onPageChange(data.number - 1); 
                  }}
                  className={data.number === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {/* Invocamos la lógica de renderizado inteligente */}
              {renderPageNumbers()}

              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if(data.number < data.totalPages - 1) onPageChange(data.number + 1); 
                  }}
                  className={data.number === data.totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}