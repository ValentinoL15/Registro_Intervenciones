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
import { Trash2, Sun, Moon } from "lucide-react";

interface ProfesionalesTableProps {
  profesionales: User[];
  onDelete: (id: string) => void;
}

export function ProfesionalesTable({
  profesionales,
  onDelete,
}: ProfesionalesTableProps) {
  const diasAbreviados: Record<string, string> = {
    lunes: "Lun",
    martes: "Mar",
    miércoles: "Mié",
    jueves: "Jue",
    viernes: "Vie",
  };

  if (profesionales.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No hay profesionales registrados
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Carga Horaria</TableHead>
            <TableHead>Días</TableHead>
            <TableHead className="text-center">Turno</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profesionales.map((prof) => (
            <TableRow key={prof.id}>
              <TableCell className="font-medium">
                {prof.nombre} {prof.apellido}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {prof.email}
              </TableCell>
              <TableCell className="text-center">
                {prof.cargaHoraria}hs
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {prof.dias?.map((dia) => (
                    <Badge key={dia} variant="secondary" className="text-xs">
                      {diasAbreviados[dia]}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={prof.turno === "mañana" ? "default" : "outline"}
                  className="gap-1"
                >
                  {prof.turno === "mañana" ? (
                    <Sun className="w-3 h-3" />
                  ) : (
                    <Moon className="w-3 h-3" />
                  )}
                  {prof.turno === "mañana" ? "Mañana" : "Tarde"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Eliminar profesional</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Eliminar profesional</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Estás seguro de que deseas eliminar a {prof.nombre}{" "}
                        {prof.apellido}? Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(prof.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
