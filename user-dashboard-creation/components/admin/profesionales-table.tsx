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
import { 
  Trash2, 
  Sun, 
  Moon, 
  UserPlus, 
  UserMinus, 
  Loader2, 
  Edit, 
  UserCircle, 
  Clock 
} from "lucide-react";

interface ProfesionalesTableProps {
  profesionales: User[];
  onDelete: (id: string) => void;
  altaBaja: (id: string) => void;
  isLoading?: boolean;
  onEdit: (user: User) => void;
}

export function ProfesionalesTable({ 
  profesionales, 
  onDelete, 
  altaBaja, 
  isLoading, 
  onEdit 
}: ProfesionalesTableProps) {

  const diasAbreviados: Record<string, string> = {
    LUNES: "Lun",
    MARTES: "Mar",
    MIÉRCOLES: "Mie",
    JUEVES: "Jue",
    VIERNES: "Vie",
    SABADO: "Sab",
    DOMINGO: "Dom"
  };

  if (!isLoading && profesionales.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl border-dashed bg-muted/5 italic text-sm text-muted-foreground">
        No hay registros encontrados
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden relative bg-card shadow-sm">

      {/* OVERLAY DEL LOADER LOCAL */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm transition-all duration-300">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}

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
        <TableBody className={isLoading ? "opacity-40" : ""}>
          {profesionales.map((prof: User) => (
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
                      {disp.turno === "MAÑANA" ? (
                        <Sun className="w-3 h-3 text-amber-500" />
                      ) : (
                        <Moon className="w-3 h-3 text-indigo-500" />
                      )}
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

              {/* COLUMNA DE ACCIONES SIEMPRE VISIBLE */}
              <TableCell className="text-right pr-6">
                <div className="flex justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(prof)}
                    className="h-8 w-8 text-blue-600 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 shadow-sm transition-all"
                    title="Editar perfil"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => altaBaja(prof.userId.toString())}
                    className={`h-8 w-8 border border-slate-100 shadow-sm transition-all ${
                      prof.active 
                        ? "text-amber-600 hover:bg-amber-50 hover:border-amber-200" 
                        : "text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"
                    }`}
                    title={prof.active ? "Dar de baja" : "Dar de alta"}
                  >
                    {prof.active ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-red-50 border border-slate-100 hover:border-red-200 shadow-sm transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold">¿Confirmar eliminación?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción borrará permanentemente a <strong>{prof.name} {prof.lastname}</strong> del sistema. No se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(prof.userId.toString())} 
                          className="bg-destructive text-white rounded-xl hover:bg-destructive/90 font-bold"
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
  );
}