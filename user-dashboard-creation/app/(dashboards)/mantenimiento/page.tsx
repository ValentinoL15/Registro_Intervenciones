"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Wrench, Calendar, Trash2, History, Loader2, PlusCircle, Edit, X, Save } from "lucide-react";
import { EmpleadoApi } from "@/service/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { EditMantenimientoDto, MantenimientoDto } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { useLoader } from "@/lib/spinnerService";

export default function MantenimientoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mantenimientos, setMantenimientos] = useState<MantenimientoDto[]>([]);
  const [editingItem, setEditingItem] = useState<EditMantenimientoDto | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // ESTADOS PARA FILTROS Y PAGINACIÓN
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { toast } = useToast();
  const { showLoader, hideLoader } = useLoader();

  // --- LÓGICA DE PAGINACIÓN COMPACTA ---
  const renderPageNumbers = () => {
    const pages = [];
    const delta = 1; 

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={currentPage === i}
              onClick={(e) => { e.preventDefault(); setCurrentPage(i); }}
              className="cursor-pointer h-8 w-8 text-xs"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (i === currentPage - delta - 1 || i === currentPage + delta + 1) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationEllipsis className="h-8 w-8" />
          </PaginationItem>
        );
      }
    }
    return pages;
  };

  const loadMantenimientos = useCallback(async () => {
    try {
      setIsLoading(true);
      showLoader("Sincronizando tareas...");
      const response = await EmpleadoApi.getmyMantenimientos(
        filtroDesde, 
        filtroHasta, 
        currentPage - 1,
        itemsPerPage   
      );
      
      setMantenimientos(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      hideLoader();
    }
  }, [currentPage, filtroDesde, filtroHasta, showLoader, hideLoader]);

  useEffect(() => {
    loadMantenimientos();
  }, [loadMantenimientos]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtroDesde, filtroHasta]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsUpdating(true);
    showLoader("Guardando cambios...");
    const formData = new FormData(e.currentTarget);
    const data = {
      fecha: formData.get("fecha") as string,
      description: formData.get("description") as string,
    };

    try {
      await EmpleadoApi.editMantenimiento(editingItem.mantenimientoId, data);
      toast({ title: "Actualizado", description: "Cambios guardados con éxito." });
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
    showLoader("Registrando...");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      fecha: formData.get("fecha") as string,
      description: formData.get("description") as string,
    };

    try {
      await EmpleadoApi.createMantenimiento(data);
      toast({ title: "Registrado", description: "Tarea guardada correctamente." });
      form.reset();
      setCurrentPage(1);
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
      showLoader("Eliminando...");
      await EmpleadoApi.deleteMantenimiento(id);
      toast({ title: "Eliminado", description: "El registro ha sido borrado." });
      loadMantenimientos();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar." });
    } finally {
      hideLoader();
    }
  };

  return (
    <main className="container mx-auto px-4 py-10 max-w-5xl space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 border-b pb-5">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <Wrench className="w-10 h-10 text-primary" /> Panel de Mantenimiento
        </h1>
        <p className="text-lg text-muted-foreground text-sm">Registra y gestiona las tareas de infraestructura realizadas.</p>
      </div>

      <div className="flex flex-col gap-10">
        {/* FORMULARIO CARGA */}
        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <PlusCircle className="w-6 h-6 text-primary" /> Registrar Nueva Tarea
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="md:col-span-1 space-y-2">
                <Label htmlFor="fecha" className="font-bold text-xs uppercase text-muted-foreground">Fecha</Label>
                <Input id="fecha" name="fecha" type="date" required className="h-10" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description" className="font-bold text-xs uppercase text-muted-foreground">Descripción del trabajo</Label>
                <Input id="description" name="description" placeholder="Ej: Reparación de luminarias..." required className="h-10" />
              </div>
              <div className="md:col-span-1">
                <Button type="submit" className="w-full font-bold h-10" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Registrar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* HISTORIAL */}
        <Card className="shadow-md">
          <CardHeader className="bg-muted/30 border-b py-4">
            <CardTitle className="flex items-center justify-between text-xl font-bold text-muted-foreground uppercase tracking-wider">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5" /> Mi Actividad
              </div>
              <span className="text-[10px] font-bold bg-background px-3 py-1 rounded-full border shadow-sm tracking-normal">
                {totalElements} registros encontrados
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            
            {/* FILTROS */}
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
                  <X className="h-4 w-4" /> Limpiar
                </Button>
              )}
            </div>

            <div className="rounded-xl border overflow-hidden relative bg-white">
              {isLoading && <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}
              
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[180px] font-bold">Fecha</TableHead>
                    <TableHead className="font-bold">Descripción de la Tarea</TableHead>
                    <TableHead className="w-[120px] text-right font-bold pr-6">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mantenimientos.length > 0 ? (
                    mantenimientos.map((item) => (
                      <TableRow key={item.mantenimientoId} className="hover:bg-muted/5 transition-colors align-top">
                        <TableCell className="py-4 font-bold text-primary">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 opacity-70" />
                            {new Date(item.fecha + "T00:00:00").toLocaleDateString("es-AR")}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 break-words whitespace-normal leading-relaxed text-sm">
                          {item.description}
                        </TableCell>
                        <TableCell className="text-right py-4 pr-6">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="text-blue-600 h-8 w-8" onClick={() => setEditingItem(item)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar este registro?</AlertDialogTitle>
                                  <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(item.mantenimientoId.toString())} className="bg-destructive text-white rounded-xl">Eliminar</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : !isLoading && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-40 text-center text-muted-foreground italic text-sm">
                        No se encontraron registros en este periodo.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* PAGINACIÓN COMPACTA */}
              {totalPages > 1 && (
                <div className="p-4 border-t bg-muted/10 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {renderPageNumbers()}
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
          </CardContent>
        </Card>
      </div>

      {/* DIALOG EDICIÓN */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-3xl overflow-hidden p-0">
          <div className="bg-primary p-6 text-white"><DialogTitle className="flex items-center gap-2 text-xl font-bold"><Edit className="w-5 h-5" /> Editar Tarea</DialogTitle></div>
          <form onSubmit={handleUpdate} className="p-6 space-y-5 bg-white">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500">Fecha</Label>
              <Input name="fecha" type="date" defaultValue={editingItem?.fecha} required className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500">Descripción del trabajo</Label>
              <Textarea name="description" defaultValue={editingItem?.description} required className="min-h-[140px] rounded-xl resize-none" />
            </div>
            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="ghost" onClick={() => setEditingItem(null)} className="flex-1 h-12 rounded-xl">Cancelar</Button>
              <Button type="submit" disabled={isUpdating} className="flex-1 h-12 rounded-xl font-bold shadow-lg">
                {isUpdating ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />} Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}