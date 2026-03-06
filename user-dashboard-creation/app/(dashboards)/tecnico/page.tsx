"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Wrench,
  CalendarDays,
  Trash2,
  History,
  Loader2,
  PlusCircle,
  Edit,
  X,
  ChevronDown,
  ChevronUp,
  Save
} from "lucide-react";
import { TecnicoApi } from "@/service/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
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
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { DescriptionDto } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { useLoader } from "@/lib/spinnerService";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge"; // Importado desde tus componentes UI
import { TecnicoHeader } from "@/components/tecnico/tecnico-header";

export default function TecnicoDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { showLoader, hideLoader } = useLoader();

  // ESTADOS
  const [descripciones, setDescripciones] = useState<DescriptionDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<DescriptionDto | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // PAGINACIÓN Y FILTROS
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 8;

  const loadDescripciones = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await TecnicoApi.getMyDescriptions(
        filtroDesde,
        filtroHasta,
        currentPage - 1,
        itemsPerPage
      );

      const sortedContent = (response.content || []).sort((a: any, b: any) =>
        new Date(b.fecha + "T00:00:00").getTime() - new Date(a.fecha + "T00:00:00").getTime()
      );

      setDescripciones(sortedContent);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Error cargando descripciones:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filtroDesde, filtroHasta]);

  useEffect(() => {
    loadDescripciones();
  }, [loadDescripciones]);

  // Reiniciar a página 1 cuando el usuario cambia el filtro de fecha
  useEffect(() => {
    setCurrentPage(1);
  }, [filtroDesde, filtroHasta]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    showLoader("Publicando reporte...");
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      fecha: formData.get("fecha") as string,
      description: formData.get("description") as string,
    };

    try {
      await TecnicoApi.createDescription(data);
      toast({ title: "¡Éxito!", description: "Reporte técnico guardado." });
      form.reset();
      loadDescripciones();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSubmitting(false);
      hideLoader();
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsUpdating(true);
    showLoader("Actualizando...");
    const formData = new FormData(e.currentTarget);
    const data = {
      fecha: formData.get("fecha") as string,
      description: formData.get("description") as string,
    };

    try {
      await TecnicoApi.editDescription(editingItem.id, data);
      toast({ title: "Actualizado", description: "Cambios guardados con éxito." });
      setEditingItem(null);
      loadDescripciones();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsUpdating(false);
      hideLoader();
    }
  };

  const handleDelete = async (id: number) => {
    try {
      showLoader("Eliminando...");
      await TecnicoApi.deleteDescription(id);
      toast({ title: "Eliminado", description: "El reporte fue borrado." });
      loadDescripciones();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar." });
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-10 max-w-5xl space-y-10">
        <div className="flex flex-col gap-2 border-b pb-5">
          <h1 className="text-4xl font-extrabold tracking-tight">Panel Técnico</h1>
          <p className="text-lg text-muted-foreground tracking-tight">
            Hola, <span className="font-bold text-indigo-600">{user?.name}</span>. Registra tus informes de actividad diaria.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          {/* SECCIÓN 1: FORMULARIO DE CARGA */}
          <Card className="shadow-lg border-t-4 border-t-indigo-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <PlusCircle className="w-6 h-6 text-indigo-600" /> Nuevo Reporte de Actividad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="md:col-span-1 space-y-2">
                  <Label htmlFor="fecha" className="font-semibold text-xs uppercase tracking-wider">Fecha</Label>
                  <Input id="fecha" name="fecha" type="date" required className="h-10" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description" className="font-semibold text-xs uppercase tracking-wider">Descripción del trabajo</Label>
                  <Input id="description" name="description" placeholder="¿Qué tareas realizaste hoy?" required className="h-10" />
                </div>
                <div className="md:col-span-1">
                  <Button type="submit" className="w-full font-bold bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Wrench className="mr-2 w-4 h-4" />} Registrar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* SECCIÓN 2: HISTORIAL Y FILTROS */}
          <Card className="shadow-md">
            <CardHeader className="bg-muted/30 border-b py-4">
              <CardTitle className="flex items-center justify-between text-xl font-bold text-muted-foreground uppercase tracking-wider">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5" /> Mi Actividad Registrada
                </div>
                <span className="text-[10px] font-bold uppercase tracking-normal bg-background px-3 py-1 rounded-full border shadow-sm">
                  {totalElements} reportes encontrados
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">

              {/* PANEL DE FILTROS */}
              <div className="flex flex-wrap items-end gap-4 bg-indigo-50/30 p-4 rounded-lg border border-indigo-100 border-dashed">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-indigo-700">Periodo Desde</Label>
                  <Input type="date" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)} className="h-9 w-40 bg-background" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-indigo-700">Periodo Hasta</Label>
                  <Input type="date" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)} className="h-9 w-40 bg-background" />
                </div>
                {(filtroDesde || filtroHasta) && (
                  <Button variant="ghost" size="sm" onClick={() => { setFiltroDesde(""); setFiltroHasta(""); }} className="h-9 text-indigo-600 hover:text-destructive gap-2">
                    <X className="h-4 w-4" /> Limpiar
                  </Button>
                )}
              </div>

              <div className="rounded-xl border relative min-h-[200px]">
                {isLoading && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[1px]">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    <p className="text-[10px] font-bold uppercase text-indigo-600 mt-2 animate-pulse">
                      Sincronizando datos...
                    </p>
                  </div>
                )}

                <Table className="table-fixed w-full">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[160px] font-bold">
                        Fecha
                      </TableHead>

                      <TableHead className="font-bold">
                        Descripción / Actividad
                      </TableHead>

                      <TableHead className="w-[120px] text-right font-bold pr-6">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {descripciones.length > 0 ? (
                      descripciones.map((item) => (
                        <TableRow
                          key={item.id}
                          className="hover:bg-muted/10 transition-colors align-top"
                        >
                          {/* FECHA */}
                          <TableCell className="py-4 align-top">
                            <Badge
                              variant="outline"
                              className="border-indigo-200 bg-indigo-50/50 gap-2 text-indigo-800"
                            >
                              <CalendarDays className="w-3 h-3" />
                              {format(
                                new Date(item.fecha + "T00:00:00"),
                                "dd MMM, yyyy",
                                { locale: es }
                              )}
                            </Badge>
                          </TableCell>

                          {/* DESCRIPCIÓN */}
                          <TableCell className="py-4 align-top whitespace-normal break-words">
                            <p className="text-sm leading-relaxed text-foreground whitespace-normal break-words">
                              {item.description}
                            </p>
                          </TableCell>

                          {/* ACCIONES */}
                          <TableCell className="text-right align-top py-4 pr-6">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-indigo-600 h-8 w-8"
                                onClick={() => setEditingItem(item)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive h-8 w-8"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      ¿Confirmar eliminación?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción borrará el informe permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>

                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(item.id)}
                                      className="bg-destructive"
                                    >
                                      Eliminar ahora
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      !isLoading && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="h-40 text-center text-muted-foreground italic text-sm"
                          >
                            No se encontraron registros para mostrar.
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>

                {/* PAGINACIÓN */}
                {/* PAGINACIÓN TRUNCADA */}
{totalPages > 1 && (
  <div className="p-4 border-t bg-muted/10">
    <Pagination>
      <PaginationContent>
        {/* BOTÓN ANTERIOR */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage((p) => Math.max(1, p - 1));
            }}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>

        {/* LÓGICA DE NÚMEROS INTELIGENTES */}
        {(() => {
          const pages = [];
          const delta = 1; // Páginas a mostrar a los lados de la actual

          for (let i = 1; i <= totalPages; i++) {
            // Mostrar siempre: primera, última, y el rango alrededor de la actual
            if (
              i === 1 || 
              i === totalPages || 
              (i >= currentPage - delta && i <= currentPage + delta)
            ) {
              pages.push(
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(i);
                    }}
                    className="cursor-pointer h-8 w-8 text-xs"
                  >
                    {i}
                  </PaginationLink>
                </PaginationItem>
              );
            } 
            // Agregar elipsis si hay un salto
            else if (i === currentPage - delta - 1 || i === currentPage + delta + 1) {
              pages.push(
                <PaginationItem key={i}>
                  <span className="px-2 py-2 text-muted-foreground text-xs">...</span>
                </PaginationItem>
              );
            }
          }
          return pages;
        })()}

        {/* BOTÓN SIGUIENTE */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage((p) => Math.min(totalPages, p + 1));
            }}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DIALOG DE EDICIÓN */}
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-3xl overflow-hidden p-0">
            <DialogHeader className="p-6 bg-indigo-600 text-white">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Edit className="w-5 h-5" /> Editar Informe
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="p-6 space-y-6 bg-white">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Fecha del trabajo</Label>
                <Input name="fecha" type="date" defaultValue={editingItem?.fecha} required className="h-12 rounded-xl focus:ring-indigo-500 border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Descripción detallada</Label>
                <Textarea 
                  name="description" 
                  defaultValue={editingItem?.description} 
                  required 
                  className="min-h-[160px] leading-relaxed resize-none rounded-xl bg-slate-50 border-none focus:ring-indigo-500 break-all" 
                  placeholder="Describe las tareas realizadas..."
                />
              </div>
              <DialogFooter className="gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setEditingItem(null)} className="rounded-xl h-12 flex-1">Cancelar</Button>
                <Button type="submit" disabled={isUpdating} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 flex-1 font-bold shadow-lg shadow-indigo-100">
                  {isUpdating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}