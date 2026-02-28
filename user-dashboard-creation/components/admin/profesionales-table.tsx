"use client";

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
import { Trash2, Sun, Moon, UserPlus, UserMinus, Loader2 } from "lucide-react";

// Añadimos isLoading a las props
interface ProfesionalesTableProps {
  profesionales: User[];
  onDelete: (id: string) => void;
  altaBaja: (id: string) => void;
  isLoading?: boolean; 
}

export function ProfesionalesTable({ profesionales, onDelete, altaBaja, isLoading }: ProfesionalesTableProps) {

  const diasAbreviados: Record<string, string> = {
    LUNES: "Lun",
    MARTES: "Mar",
    MIÉRCOLES: "Mie",
    JUEVES: "Jue",
    VIERNES: "Vie",
  };

  if (!isLoading && profesionales.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-sm italic">No hay registros encontrados</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden relative">
      
      {/* OVERLAY DEL LOADER LOCAL */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40 backdrop-blur-[1px] transition-all duration-300">
          <div className="flex flex-col items-center gap-2 bg-card p-4 rounded-lg shadow-lg border">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sincronizando...</p>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Carga Horaria</TableHead>
            <TableHead className="min-w-[200px]">Disponibilidad</TableHead>
            <TableHead className="text-center">Condición</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={isLoading ? "opacity-40" : ""}>
          {profesionales.map((prof: User) => (
            <TableRow key={prof.userId} className="transition-colors hover:bg-muted/30">
              <TableCell className="font-medium whitespace-nowrap">
                {prof.name} {prof.lastname}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs font-mono">
                {prof.email}
              </TableCell>
              <TableCell className="text-center text-xs">
                <Badge variant="secondary">{prof.hourly}hs</Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1.5">
                  {prof.disponibilidades?.map((disp: any, idx: number) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="flex items-center gap-1.5 bg-background border-slate-200 py-1 text-[10px]"
                    >
                      <span className="font-bold">{diasAbreviados[disp.dia]}</span>
                      <div className="w-px h-3 bg-slate-300" />
                      {disp.turno === "MAÑANA" ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-indigo-500" />}
                      {disp.turno}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge className={prof.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"} variant="outline">
                  <span className={`mr-1.5 size-1.5 rounded-full ${prof.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {prof.active ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => altaBaja(prof.userId)}
                    className={prof.active ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"}
                  >
                    {prof.active ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                        <AlertDialogDescription>Esta acción borrará permanentemente a {prof.name} {prof.lastname}.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(prof.userId)} className="bg-destructive text-white">Eliminar</AlertDialogAction>
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
  );
}