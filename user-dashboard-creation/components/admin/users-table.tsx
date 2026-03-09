"use client";

import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis,
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, UserPlus, UserMinus, Loader2, Edit, UserCircle, Clock } from "lucide-react";
import type { User, HorarioAsistenciaDto } from "@/lib/types";

interface UsersTableProps {
  users: User[];
  onDelete: (id: string) => void;
  altaBaja: (id: string) => void;
  onEdit: (user: User) => void;
  isLoading?: boolean;
}

const RenderHorarios = ({ horarios }: { horarios?: HorarioAsistenciaDto[] }) => {
  if (!horarios || horarios.length === 0) return null;

  const diasOrden: Record<string, number> = {
    "LUNES": 1, "MARTES": 2, "MIERCOLES": 3, "MIÉRCOLES": 3,
    "JUEVES": 4, "VIERNES": 5, "SABADO": 6, "SÁBADO": 6, "DOMINGO": 7
  };

  const sortedHorarios = [...horarios].sort(
    (a, b) => (diasOrden[a.dia.toUpperCase()] || 99) - (diasOrden[b.dia.toUpperCase()] || 99)
  );

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1 justify-center max-w-[220px] mx-auto">
        {sortedHorarios.map((h, idx) => (
          <Tooltip key={`${h.dia}-${idx}`}>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-center min-w-[38px] px-1 py-0.5 rounded border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 transition-colors cursor-help shadow-sm">
                <span className="text-[8px] font-black text-indigo-700 leading-none mb-0.5">
                  {h.dia.substring(0, 3).toUpperCase()}
                </span>
                <span className="text-[9px] text-indigo-500 font-bold leading-none">{h.inicio}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-indigo-950 text-white border-none shadow-xl">
              <p className="text-xs font-bold">{h.dia}: {h.inicio}hs a {h.fin}hs</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export function UsersTable({ users, onDelete, altaBaja, onEdit, isLoading }: UsersTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(users.length / itemsPerPage);
  
  const paginatedUsers = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return users.slice(start, start + itemsPerPage);
  }, [users, currentPage]);

  // CLAVE: Detectar si debemos mostrar la columna de asistencia
  const tieneAsistenciasEnLaLista = useMemo(() => {
    return users.some(u => u.horarioAsistencias && u.horarioAsistencias.length > 0);
  }, [users]);

  const renderPageNumbers = () => {
    const pages = [];
    const delta = 1; 
    for (let i = 0; i < totalPages; i++) {
      if (i === 0 || i === totalPages - 1 || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink href="#" isActive={currentPage === i} onClick={(e) => { e.preventDefault(); setCurrentPage(i); }} className="cursor-pointer h-8 w-8 text-xs">
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (i === currentPage - delta - 1 || i === currentPage + delta + 1) {
        pages.push(<PaginationItem key={i}><PaginationEllipsis className="h-8 w-8" /></PaginationItem>);
      }
    }
    return pages;
  };

  if (!isLoading && users.length === 0) {
    return <div className="text-center py-12 border rounded-xl border-dashed bg-muted/5 italic text-sm text-muted-foreground">No hay usuarios registrados.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border overflow-hidden relative bg-card shadow-sm">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}
        
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="py-4 pl-6 font-semibold">Personal</TableHead>
              <TableHead className="font-semibold">Contacto</TableHead>
              <TableHead className="text-center font-semibold">Carga Horaria</TableHead>
              
              {/* Renderizado Condicional de Cabecera */}
              {tieneAsistenciasEnLaLista && (
                <TableHead className="text-center font-semibold animate-in fade-in">Asistencia</TableHead>
              )}

              <TableHead className="text-center font-semibold">Estado</TableHead>
              <TableHead className="text-right pr-6 font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isLoading ? "opacity-40" : ""}>
            {paginatedUsers.map((user) => (
              <TableRow key={user.userId} className="group hover:bg-muted/20 transition-colors">
                <TableCell className="py-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                      <UserCircle className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{user.name} {user.lastname}</span>
                      {user.degree && <span className="text-[11px] text-indigo-600 italic font-medium">{user.degree}</span>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-[11px] text-muted-foreground font-medium">{user.email}</TableCell>
                
                <TableCell className="text-center">
                  <Badge variant="secondary" className="gap-1.5 font-bold bg-slate-100 text-slate-700 border-none px-2.5 py-0.5">
                    <Clock className="w-3 h-3 text-slate-500" /> 
                    {user.hourly ? `${user.hourly}hs` : "0hs"}
                  </Badge>
                </TableCell>

                {/* Renderizado Condicional de Celda */}
                {tieneAsistenciasEnLaLista && (
                  <TableCell className="text-center animate-in fade-in">
                     <RenderHorarios horarios={user.horarioAsistencias} />
                  </TableCell>
                )}

                <TableCell className="text-center">
                  <Badge className={`rounded-full px-2.5 py-0.5 font-semibold text-[10px] border-none shadow-sm ${
                    user.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}>
                    {user.active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(user)} className="h-8 w-8 text-blue-600 hover:bg-blue-50 border border-slate-100"><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => altaBaja(user.userId.toString())} className={`h-8 w-8 border border-slate-100 ${user.active ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"}`}>
                      {user.active ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-red-50 border border-slate-100"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                          <AlertDialogDescription>¿Deseas borrar a <strong>{user.name} {user.lastname}</strong>?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(user.userId.toString())} className="bg-destructive text-white rounded-xl">Eliminar</AlertDialogAction>
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

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(0, p - 1)); }} className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"} /></PaginationItem>
              {renderPageNumbers()}
              <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages - 1, p + 1)); }} className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} /></PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}