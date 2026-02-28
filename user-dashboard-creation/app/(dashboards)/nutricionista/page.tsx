"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Apple, Trash2, History, Loader2, PlusCircle, Edit, 
  Eye, ExternalLink, Calendar, X 
} from "lucide-react";
import { NutricionistaApi } from "@/service/api";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { 
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { useLoader } from "@/lib/spinnerService";
import { 
  Pagination, PaginationContent, PaginationItem, PaginationLink, 
  PaginationNext, PaginationPrevious 
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";

type PreviewState = {
  url: string;
  fecha: string;
};

export default function NutricionistaPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [menus, setMenus] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [previewImage, setPreviewImage] = useState<PreviewState | null>(null);
  
  // ESTADOS DE FILTRO Y PAGINACIÓN SINCRONIZADA
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [currentPage, setCurrentPage] = useState(0); // Base 0 para Spring Boot
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 6;

  const { toast } = useToast();
  const { showLoader, hideLoader } = useLoader();

  // CARGA DE DATOS DESDE EL SERVIDOR
  const loadMenus = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await NutricionistaApi.getMyReportes(
        filtroDesde,
        filtroHasta,
        currentPage,
        itemsPerPage
      );
      
      // Sincronizamos estados con el objeto Page de Java
      setMenus(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error: any) {
      console.error("Error al cargar reportes:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos." });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filtroDesde, filtroHasta, toast]);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  // RESET DE PÁGINA AL FILTRAR
  useEffect(() => {
    setCurrentPage(0);
  }, [filtroDesde, filtroHasta]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setIsSubmitting(true);
    showLoader("Subiendo reporte semanal...");

    try {
      await NutricionistaApi.subirReporte(formData);
      toast({ title: "Éxito", description: "Reporte subido correctamente." });
      form.reset();
      setCurrentPage(0); // Volver al inicio para ver el nuevo registro
      await loadMenus();
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
    showLoader("Actualizando reporte...");
    const formData = new FormData(e.currentTarget);

    try {
      await NutricionistaApi.editReporte(editingItem.id, formData);
      toast({ title: "Actualizado", description: "El reporte ha sido modificado." });
      setEditingItem(null);
      loadMenus();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsUpdating(false);
      hideLoader();
    }
  };

  const handleDelete = async (id: number) => {
    try {
      showLoader("Eliminando reporte...");
      await NutricionistaApi.deleteReporte(id);
      toast({ title: "Eliminado", description: "Reporte eliminado correctamente." });
      loadMenus();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      hideLoader();
    }
  };

  return (
    <main className="container mx-auto px-4 py-10 max-w-5xl space-y-10">
      <div className="flex flex-col gap-2 border-b pb-5">
        <h1 className="text-4xl font-extrabold tracking-tight">Panel de Nutrición</h1>
        <p className="text-lg text-muted-foreground">Gestione las planificaciones nutricionales semanales.</p>
      </div>

      {/* FORMULARIO DE CARGA */}
      <Card className="shadow-lg border-t-4 border-t-green-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <PlusCircle className="w-6 h-6 text-green-600" /> Cargar Nuevo Menú
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha Inicio</Label>
              <Input id="fechaInicio" name="fechaInicio" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaFinal">Fecha Final</Label>
              <Input id="fechaFinal" name="fechaFinal" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="archivo">Archivo (PDF/Imagen)</Label>
              <Input id="archivo" name="archivo" type="file" accept=".pdf,image/*" required />
            </div>
            <Button type="submit" className="bg-green-700 hover:bg-green-800" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Apple className="mr-2 w-4 h-4" />}
              Subir Menú
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* HISTORIAL CON FILTROS Y PAGINACIÓN */}
      <Card className="shadow-md">
        <CardHeader className="bg-muted/30 border-b font-bold text-xl flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" /> Historial de Menús
          </div>
          <span className="text-xs font-normal text-muted-foreground uppercase tracking-wider">
            {totalElements} registros encontrados
          </span>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          {/* PANEL DE FILTROS */}
          <div className="flex flex-wrap items-end gap-4 bg-muted/20 p-4 rounded-lg border border-dashed">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Desde</Label>
              <Input 
                type="date" 
                value={filtroDesde} 
                onChange={(e) => setFiltroDesde(e.target.value)} 
                className="w-40 h-9 bg-background" 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Hasta</Label>
              <Input 
                type="date" 
                value={filtroHasta} 
                onChange={(e) => setFiltroHasta(e.target.value)} 
                className="w-40 h-9 bg-background" 
              />
            </div>
            {(filtroDesde || filtroHasta) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setFiltroDesde(""); setFiltroHasta(""); }}
                className="h-9 text-muted-foreground hover:text-destructive gap-2"
              >
                <X className="h-4 w-4" /> Limpiar Filtros
              </Button>
            )}
          </div>

          <div className="rounded-xl border overflow-hidden relative">
            {isLoading && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center transition-all">
                <Loader2 className="h-10 w-10 animate-spin text-green-600" />
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
                  Sincronizando reportes...
                </p>
              </div>
            )}
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Periodo de Vigencia</TableHead>
                  <TableHead className="font-bold">Archivo</TableHead>
                  <TableHead className="text-right font-bold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menus.length > 0 ? (
                  menus.map((item) => {
                    const esFuturo = new Date(item.fechaInicio + "T00:00:00") > new Date();
                    return (
                      <TableRow key={item.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] uppercase font-black text-muted-foreground/60">Inicio</span>
                              <Badge variant="outline" className={`font-bold ${esFuturo ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-green-50 text-green-700"}`}>
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(item.fechaInicio + "T00:00:00").toLocaleDateString("es-AR")}
                              </Badge>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] uppercase font-black text-muted-foreground/60">Fin</span>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 font-bold border-blue-200">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(item.fechaFinal + "T00:00:00").toLocaleDateString("es-AR")}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:bg-blue-50 gap-2"
                            onClick={() => setPreviewImage({
                              url: item.archivo,
                              fecha: `${new Date(item.fechaInicio + "T00:00:00").toLocaleDateString("es-AR")} al ${new Date(item.fechaFinal + "T00:00:00").toLocaleDateString("es-AR")}`
                            })}
                          >
                            <Eye className="w-4 h-4" /> Ver Archivo
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="text-blue-600" onClick={() => setEditingItem(item)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                                  <AlertDialogDescription>Esta acción borrará el menú seleccionado permanentemente.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90 text-white">Eliminar ahora</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-muted-foreground italic">
                      No se encontraron reportes registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* PAGINACIÓN OFICIAL SINCRONIZADA */}
            {totalPages > 1 && (
              <div className="p-4 border-t bg-muted/10">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(0, p - 1)); }}
                        className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === i}
                          onClick={(e) => { e.preventDefault(); setCurrentPage(i); }}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages - 1, p + 1)); }}
                        className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* MODAL PREVISUALIZACIÓN */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0">
            <DialogTitle>Reporte: {previewImage?.fecha}</DialogTitle>
            <Button variant="outline" size="sm" onClick={() => window.open(previewImage?.url, '_blank')} className="mr-8">
              <ExternalLink className="w-4 h-4 mr-2" /> Pantalla Completa
            </Button>
          </DialogHeader>
          <div className="flex-1 w-full bg-slate-100 relative">
            {previewImage?.url.toLowerCase().endsWith('.pdf') ? (
              <iframe src={`${previewImage.url}#toolbar=0&view=FitH`} className="w-full h-full border-none" title="PDF" />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img src={previewImage?.url} alt="Menu" className="max-w-full max-h-full object-contain shadow-md" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL EDITAR */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Editar Reporte Nutricional</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Input name="fechaInicio" type="date" defaultValue={editingItem?.fechaInicio} required />
            </div>
            <div className="space-y-2">
              <Label>Fecha Final</Label>
              <Input name="fechaFinal" type="date" defaultValue={editingItem?.fechaFinal} required />
            </div>
            <div className="space-y-2">
              <Label>Nuevo Archivo (Opcional)</Label>
              <Input name="archivo" type="file" accept=".pdf,image/*" />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>Cancelar</Button>
              <Button type="submit" disabled={isUpdating} className="bg-green-700 text-white">
                {isUpdating ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}