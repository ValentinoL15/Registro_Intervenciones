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
import { Trash2, UserPlus, UserMinus, Loader2, UserCircle } from "lucide-react";

interface UsersTableProps {
  users: User[];
  onDelete: (id: string) => void;
  altaBaja: (id: string) => void;
  isLoading?: boolean;
}

export function UsersTable({ users, onDelete, altaBaja, isLoading }: UsersTableProps) {

  if (!isLoading && users.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md border-dashed bg-muted/5">
        <p className="text-muted-foreground text-sm italic">
          No hay usuarios registrados en esta categoría.
        </p>
      </div>
    );
  }

  return (
    // ELIMINADO: min-h-[300px] para que sea compacto. 
    // Agregado overflow-hidden para que el blur no se escape de las esquinas redondeadas.
    <div className="rounded-md border border-border overflow-hidden relative">
      
      {/* OVERLAY DE CARGA LOCAL */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[1px] transition-all duration-300">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-bold">Nombre</TableHead>
            <TableHead className="font-bold">Email</TableHead>
            <TableHead className="text-center font-bold">Carga Horaria</TableHead>
            <TableHead className="text-center font-bold">Condición</TableHead>
            <TableHead className="text-right font-bold">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={isLoading ? "opacity-30" : "opacity-100 transition-opacity"}>
          {users.map((user: User) => (
            <TableRow key={user.userId} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-muted-foreground/40" />
                  {user.name} {user.lastname}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {user.email}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary" className="font-normal px-2 py-0">
                  {user.hourly}hs
                </Badge>
              </TableCell>

              <TableCell className="text-center">
                <Badge
                  className={user.active
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                  }
                  variant="outline"
                >
                  <span className={`mr-1.5 size-1.5 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
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
                    {user.active ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que deseas eliminar a <span className="font-bold text-foreground">{user.name} {user.lastname}</span>? 
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(user.userId)}
                          className="bg-destructive text-white hover:bg-destructive/90"
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