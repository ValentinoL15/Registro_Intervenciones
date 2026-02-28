"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Wrench, Calendar, Trash2, History, Loader2, PlusCircle, Edit, X } from "lucide-react";
import { EmpleadoApi } from "@/service/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { EditMantenimientoDto, MantenimientoDto } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useLoader } from "@/lib/spinnerService";

export default function MantenimientoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mantenimientos, setMantenimientos] = useState<MantenimientoDto[]>([]);
  const [editingItem, setEditingItem] = useState<EditMantenimientoDto | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  
  // ESTADOS PARA FILTROS Y PAGINACIÓN
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { toast } = useToast();
  const { showLoader, hideLoader } = useLoader();

  // 1. FILTRADO Y ORDENAMIENTO DINÁMICO
  const mantenimientosFiltrados = useMemo(() => {
    let filtrados = [...mantenimientos];

    if (filtroDesde || filtroHasta) {
      filtrados = filtrados.filter((item) => {
        const fechaItem = new Date(item.fecha + "T00:00:00").getTime();
        
        if (filtroDesde) {
          const desde = new Date(filtroDesde + "T00:00:00").getTime();
          if (fechaItem < desde) return false;
        }
        if (filtroHasta) {
          const hasta = new Date(filtroHasta + "T00:00:00").getTime();
          if (fechaItem > hasta) return false;
        }
        return true;
      });
    }
    return filtrados.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [mantenimientos, filtroDesde, filtroHasta]);

 const loadMantenimientos = useCallback(async () => {
  try {
    setIsLoading(true);
    showLoader("Cargando mantenimientos...")
    const response = await EmpleadoApi.getmyMantenimientos(
      filtroDesde, 
      filtroHasta, 
      currentPage - 1,
      itemsPerPage   
    );
    
    setMantenimientos(response.content || []);
    setTotalPages(response.totalPages || 0);
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
    hideLoader();
  }
}, [currentPage, filtroDesde, filtroHasta]);

  useEffect(() => {
    loadMantenimientos();
  }, [loadMantenimientos]);

  useEffect(() => {
    setCurrentPage(0);
  }, [filtroDesde, filtroHasta]);

  const currentItems = mantenimientos;

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsUpdating(true);
    showLoader("Actualizando registro...");
    const formData = new FormData(e.currentTarget);
    const data = {
      fecha: formData.get("fecha") as string,
      description: formData.get("description") as string,
    };

    try {
      await EmpleadoApi.editMantenimiento(editingItem.mantenimientoId, data);
      toast({ title: "Actualizado", description: "El registro ha sido modificado." });
      setEditingItem(null);
      loadMantenimientos();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsUpdating(false);
      hideLoader();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    showLoader("Registrando tarea...");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      fecha: formData.get("fecha") as string,
      description: formData.get("description") as string,
    };

    try {
      await EmpleadoApi.createMantenimiento(data);
      toast({ title: "Éxito", description: "Mantenimiento registrado correctamente." });
      form.reset();
      loadMantenimientos();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSubmitting(false);
      hideLoader();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      showLoader("Eliminando registro...");
      await EmpleadoApi.deleteMantenimiento(id);
      toast({ title: "Eliminado", description: "El registro fue borrado." });
      loadMantenimientos();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar." });
    } finally {
      hideLoader();
    }
  };

  return (
    <main className="container mx-auto px-4 py-10 max-w-5xl space-y-10">
      <div className="flex flex-col gap-2 border-b pb-5">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Panel de Mantenimiento</h1>
        <p className="text-lg text-muted-foreground">Registra y gestiona las tareas de infraestructura realizadas.</p>
      </div>

      <div className="flex flex-col gap-10">
        {/* FORMULARIO DE CARGA */}
        <section className="w-full">
          <Card className="shadow-lg border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <PlusCircle className="w-6 h-6 text-primary" /> Registrar Nueva Tarea
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="md:col-span-1 space-y-2">
                  <Label htmlFor="fecha" className="font-semibold">Fecha</Label>
                  <Input id="fecha" name="fecha" type="date" required />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description" className="font-semibold">Descripción del trabajo</Label>
                  <Input id="description" name="description" placeholder="Ej: Reparación de tubería..." required />
                </div>
                <div className="md:col-span-1">
                  <Button type="submit" className="w-full font-bold shadow-md" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Wrench className="mr-2 w-4 h-4" />} Registrar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* HISTORIAL CON FILTROS */}
        <section className="w-full">
          <Card className="shadow-md">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center justify-between text-xl font-bold text-muted-foreground uppercase tracking-wider">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5" /> Historial de Actividades
                </div>
                <span className="text-xs font-normal lowercase tracking-normal">
                  {mantenimientosFiltrados.length} registros encontrados
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              {/* PANEL DE FILTROS */}
              <div className="flex flex-wrap items-end gap-4 bg-muted/20 p-4 rounded-lg border border-dashed">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Desde</Label>
                  <Input type="date" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)} className="h-9 w-40 bg-background" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Hasta</Label>
                  <Input type="date" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)} className="h-9 w-40 bg-background" />
                </div>
                {(filtroDesde || filtroHasta) && (
                  <Button variant="ghost" size="sm" onClick={() => { setFiltroDesde(""); setFiltroHasta(""); }} className="h-9 text-muted-foreground hover:text-destructive gap-2">
                    <X className="h-4 w-4" /> Limpiar Filtros
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-muted-foreground animate-pulse font-medium">Cargando registros...</p>
                </div>
              ) : (
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[180px] font-bold">Fecha</TableHead>
                        <TableHead className="font-bold">Descripción de la Tarea</TableHead>
                        <TableHead className="w-[120px] text-right font-bold">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.length > 0 ? (
                        currentItems.map((item) => (
                          <TableRow key={item.mantenimientoId} className="hover:bg-muted/20 transition-colors">
                            <TableCell className="font-semibold text-primary">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 opacity-70" />
                                {new Date(item.fecha + "T00:00:00").toLocaleDateString("es-AR")}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[400px] break-words whitespace-normal leading-relaxed text-foreground">
                              {item.description}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="text-blue-600" onClick={() => setEditingItem(item)}>
                                  <Edit className="w-5 h-5" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-5 h-5" /></Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                                      <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(item.mantenimientoId)} className="bg-destructive">Eliminar ahora</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="h-32 text-center text-muted-foreground italic">
                            No se encontraron registros para el periodo seleccionado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* PAGINACIÓN OFICIAL */}
                  {totalPages > 1 && (
                    <div className="p-4 border-t bg-muted/10">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              href="#" 
                              onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i + 1}>
                              <PaginationLink 
                                href="#" 
                                isActive={currentPage === i + 1}
                                onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}
                                className="cursor-pointer"
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext 
                              href="#" 
                              onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* DIALOG DE EDICIÓN */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Registro</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input name="fecha" type="date" defaultValue={editingItem?.fecha} required />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea name="description" defaultValue={editingItem?.description} required className="min-h-[100px]" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>Cancelar</Button>
              <Button type="submit" disabled={isUpdating} className="bg-primary text-primary-foreground">
                {isUpdating ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}