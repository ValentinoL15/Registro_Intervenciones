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
import { useEffect, useState } from "react";
import { AdminApi, profesionalApi } from "@/service/api"

export function ProfesionalesTable({ profesionales, onDelete }: ProfesionalesTableProps) {

  { /*const [profesionales, setProfesionales] = useState<User[]>([]);

  useEffect(() => {
    const fetchProfs = async () => {
      try {
        const data = await profesionalApi.getProfesionales()
        setProfesionales(data.content)
        console.log("Mi datita ", data.content)
      } catch (err) {
        console.error("Error cargando profesionales:", err)
      }
    };
    fetchProfs()
  }, []) */}

  const onDeleteHandler = async (userId: string) => {
    try {
      // 1. Llamada a la API
      await AdminApi.deleteProfesional(userId);

      // 2. Actualización optimista del estado
      // Esto hace que el usuario desaparezca de la vista al instante
      onDelete(userId);

      // 3. Opcional: Notificación de éxito
      console.log("Profesional eliminado correctamente");
    } catch (error) {
      console.error("No se pudo eliminar al profesional:", error);
    }
  };

  const diasAbreviados: Record<string, string> = {
    LUNES: "Lun",
    MARTES: "Mar",
    MIÉRCOLES: "Mie",
    JUEVES: "Jue",
    VIERNES: "Vie",
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
            <TableHead className="text-center">Condición</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profesionales.map((prof) => (
            <TableRow key={prof.userId}>
              <TableCell className="font-medium">
                {prof.name} {prof.lastname}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {prof.email}
              </TableCell>
              <TableCell className="text-center">
                {prof.hourly}hs
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {prof.days?.map((dia) => (
                    <Badge key={dia} variant="secondary" className="text-xs">
                      {diasAbreviados[dia]}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={prof.turno === "MAÑANA" ? "default" : "outline"}
                  className="gap-1"
                >
                  {prof.turno === "MAÑANA" ? (
                    <Sun className="w-3 h-3" />
                  ) : (
                    <Moon className="w-3 h-3" />
                  )}
                  {prof.turno === "MAÑANA" ? "MAÑANA" : "TARDE"}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  className={prof.active
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                  }
                  variant="outline"
                >
                  <span className={`mr-1.5 size-2 rounded-full ${prof.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {prof.active ? "Activo" : "Inactivo"}
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
                        ¿Estás seguro de que deseas eliminar a {prof.name}{" "}
                        {prof.lastname}? Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(prof.userId)}
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
