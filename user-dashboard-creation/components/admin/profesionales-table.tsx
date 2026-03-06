"use client";

import React, { useState, useMemo } from "react";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { 
  Trash2, Sun, Moon, UserPlus, UserMinus, 
  Edit, UserCircle, Clock 
} from "lucide-react";

interface ProfesionalesTableProps {
  profesionales: User[]; // La lista completa que ya traes
  onDelete: (id: string) => void;
  altaBaja: (id: string) => void;
  onEdit: (user: User) => void;
  isLoading?: boolean;
}

export function ProfesionalesTable({ 
  profesionales, 
  onDelete, 
  altaBaja, 
  onEdit,
  isLoading 
}: ProfesionalesTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  const diasAbreviados: Record<string, string> = {
    LUNES: "Lun", MARTES: "Mar", MIÉRCOLES: "Mie",
    JUEVES: "Jue", VIERNES: "Vie", SABADO: "Sab", DOMINGO: "Dom"
  };

  // LÓGICA DE PAGINACIÓN EN FRONTEND
  const totalPages = Math.ceil(profesionales.length / itemsPerPage);
  
  const profesionalesPaginados = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return profesionales.slice(start, start + itemsPerPage);
  }, [profesionales, currentPage]);

  if (!isLoading && profesionales.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl border-dashed bg-muted/5 italic text-sm text-muted-foreground">
        No hay registros encontrados
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border overflow-hidden relative bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="py-4 pl-6 font-semibold">Profesional</TableHead>
              <TableHead className="font-semibold">Contacto</TableHead>
              <TableHead className="text-center font-semibold">Carga Horaria</TableHead>
              <TableHead className="min-w-[200px] font-semibold">Disponibilidad</TableHead>
              <TableHead className="text-center font-semibold">Condición</TableHead>
              <TableHead className="text-right pr-6 font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profesionalesPaginados.map((prof: User) => (
              <TableRow key={prof.userId} className="transition-colors hover:bg-muted/20">
                <TableCell className="py-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center border border-teal-200 shrink-0">
                      <UserCircle className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm leading-tight text-slate-800">
                        {prof.name} {prof.lastname}
                      </span>
                      {prof.degree && (
                        <span className="text-[11px] text-teal-600 italic font-medium mt-0.5">
                          {prof.degree}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-xs text-muted-foreground font-medium">
                  {prof.email}
                </TableCell>

                <TableCell className="text-center">
                  <Badge variant="outline" className="gap-1 font-medium border-slate-200 bg-background">
                    <Clock className="w-3 h-3 opacity-60" /> {prof.hourly}hs
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {prof.disponibilidades?.map((disp: any, idx: number) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="flex items-center gap-1.5 bg-background border-slate-200 py-0.5 px-2 text-[10px] font-semibold"
                      >
                        <span className="text-slate-700">{diasAbreviados[disp.dia] || disp.dia}</span>
                        <div className="w-px h-3 bg-slate-200" />
                        {disp.turno === "MAÑANA" ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-indigo-500" />}
                        <span className="text-slate-500 lowercase">{disp.turno.toLowerCase()}</span>
                      </Badge>
                    ))}
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <Badge 
                    className={`rounded-full px-2.5 py-0.5 font-semibold text-[11px] border-none shadow-sm ${
                      prof.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {prof.active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>

                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(prof)}
                      className="h-8 w-8 text-blue-600 hover:bg-blue-50 border border-slate-100"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => altaBaja(prof.userId.toString())}
                      className={`h-8 w-8 border border-slate-100 ${prof.active ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                    >
                      {prof.active ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-red-50 border border-slate-100">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-3xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción borrará a <strong>{prof.name} {prof.lastname}</strong>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDelete(prof.userId.toString())} 
                            className="bg-destructive text-white rounded-xl hover:bg-destructive/90"
                          >
                            Eliminar ahora
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* RENDERIZADO DE LA PAGINACIÓN */}
      {totalPages > 1 && (
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
                onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages - 1, p + 1)); }}
                className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}