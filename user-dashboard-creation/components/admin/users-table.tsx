"use client";

import React from "react";
import type { HorarioAsistenciaDto, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, UserPlus, UserMinus, Loader2, UserCircle, Clock, Briefcase, CalendarClock, Edit } from "lucide-react";

interface UsersTableProps {
  users: User[];
  onDelete: (id: string) => void;
  altaBaja: (id: string) => void;
  onEdit: (user: User) => void;
  isLoading?: boolean;
}

const RenderHorarios = ({ horarios }: { horarios?: HorarioAsistenciaDto[] }) => {
  if (!horarios || horarios.length === 0) return <span className="text-muted-foreground/50 text-[10px] italic">No asignados</span>;

  // Mapa de orden que soporta tildes del Backend
  const diasOrden: Record<string, number> = {
    "LUNES": 1, "MARTES": 2, "MIERCOLES": 3, "MIÉRCOLES": 3,
    "JUEVES": 4, "VIERNES": 5, "SABADO": 6, "SÁBADO": 6, "DOMINGO": 7
  };

  const sortedHorarios = [...horarios].sort(
    (a, b) => (diasOrden[a.dia.toUpperCase()] || 99) - (diasOrden[b.dia.toUpperCase()] || 99)
  );

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1.5 justify-center max-w-[200px] mx-auto">
        {sortedHorarios.map((h, idx) => (
          <Tooltip key={`${h.dia}-${idx}`}>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-center min-w-[34px] px-1.5 py-1 rounded border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 transition-colors cursor-help shadow-sm">
                <span className="text-[9px] font-bold text-indigo-800 leading-none mb-0.5">{h.dia.substring(0, 3).toUpperCase()}</span>
                <span className="text-[10px] text-indigo-600 font-medium leading-none">{h.inicio}</span>
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
  if (!isLoading && users.length === 0) return <div className="text-center py-12 border rounded-xl border-dashed bg-muted/5 italic text-sm text-muted-foreground">No hay usuarios registrados.</div>;

  // Lógica automática: Si algún usuario tiene la lista de horarios, activamos la columna de Cronograma
  const mostrarColumnaCronograma = users.some(u => u.horarioAsistencias && u.horarioAsistencias.length > 0);

  return (
    <div className="rounded-xl border border-border overflow-hidden relative bg-card shadow-sm">
      {isLoading && <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="py-4 pl-6 font-semibold">Profesional</TableHead>
            <TableHead className="font-semibold">Contacto</TableHead>
            <TableHead className="text-center font-semibold">{mostrarColumnaCronograma ? "Cronograma" : "Carga Horaria"}</TableHead>
            <TableHead className="text-center font-semibold">Estado</TableHead>
            <TableHead className="text-right pr-6 font-semibold">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.userId} className="group hover:bg-muted/20 transition-colors">
              <TableCell className="py-4 pl-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200"><UserCircle className="w-6 h-6 text-indigo-600" /></div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{user.name} {user.lastname}</span>
                    {user.degree && <span className="text-[11px] text-indigo-600 italic font-medium">{user.degree}</span>}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-medium">{user.email}</TableCell>
              <TableCell className="text-center">
                {user.horarioAsistencias && user.horarioAsistencias.length > 0 ? (
                  <RenderHorarios horarios={user.horarioAsistencias} />
                ) : (
                  <Badge variant="outline" className="gap-1 font-medium"><Clock className="w-3 h-3" /> {user.hourly}hs</Badge>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Badge className={`rounded-full px-2.5 py-0.5 font-semibold text-[11px] border-none ${user.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                   {user.active ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell className="text-right pr-6">
                <div className="flex justify-end gap-1">
                  <Button
  variant="ghost"
  size="icon"
  onClick={() => onEdit(user)}
  className="h-8 w-8 text-blue-600 hover:bg-blue-50"
>
  <Edit className="w-4 h-4" />
</Button>
                  <Button variant="ghost" size="icon" onClick={() => altaBaja(user.userId.toString())} className="h-8 w-8 text-amber-600">{user.active ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Eliminar</AlertDialogTitle><AlertDialogDescription>¿Eliminar permanentemente?</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>No</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(user.userId.toString())} className="bg-destructive text-white">Sí</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}