"use client";

import type { DiaSemana, User } from "@/lib/types";
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
import { Trash2, Sun, Moon, UserPlus, UserMinus } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminApi, profesionalApi } from "@/service/api"

export function UsersTable({ users, onDelete, altaBaja }: any) {

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No hay users registrados
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
          <TableHead className="text-center">Condición</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user: User) => (
          <TableRow key={user.userId}>
            <TableCell className="font-medium">
              {user.name} {user.lastname}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {user.email}
            </TableCell>
            <TableCell className="text-center">
              {user.hourly}hs
            </TableCell>

            <TableCell className="text-center">
              <Badge
                className={user.active
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200"
                }
                variant="outline"
              >
                <span className={`mr-1.5 size-2 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {user.active ? "Activo" : "Inactivo"}
              </Badge>
            </TableCell>
            
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => altaBaja(user.userId)}
                  className={user.active 
                    ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" 
                    : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  }
                  title={user.active ? "Dar de baja" : "Dar de alta"}
                >
                  {user.active ? (
                    <UserMinus className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span className="sr-only">
                    {user.active ? "Dar de baja" : "Dar de alta"}
                  </span>
                </Button>

                {/* Diálogo de Eliminación */}
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
                        ¿Estás seguro de que deseas eliminar a {user.name}{" "}
                        {user.lastname}? Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(user.userId)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Eliminar
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
