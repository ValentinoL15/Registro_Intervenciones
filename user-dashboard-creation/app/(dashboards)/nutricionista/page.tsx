"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Apple, Trash2, History, Loader2, PlusCircle, FileText, Edit, Eye, ZoomIn, ExternalLink, Calendar } from "lucide-react";
import { NutricionistaApi } from "@/service/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Tipo para el estado de previsualización
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
  const [isDeleting, setIsDeleting] = useState<number | null>(null); // Guardamos el ID que se está borrando
  const { toast } = useToast();

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(menus.length / itemsPerPage);
  const currentItems = menus.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const loadMenus = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await NutricionistaApi.getReportes();
      const listaLimpia = data.content || data || [];

      // --- LÓGICA DE ORDENAMIENTO: Lo más reciente o futuro primero ---
      const listaOrdenada = Array.isArray(listaLimpia) 
        ? [...listaLimpia].sort((a, b) => 
            new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime()
          )
        : [];

      setMenus(listaOrdenada);

      console.log("--- DATOS ORDENADOS (Más reciente primero) ---");
      console.table(listaOrdenada);

    } catch (error) {
      console.error("Error:", error);
      setMenus([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(e.currentTarget);

    try {
      await NutricionistaApi.subirReporte(formData);
      toast({ title: "Éxito", description: "Archivo subido correctamente." });
      form.reset();

      loadMenus();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      console.error(error)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsUpdating(true);
    const formData = new FormData(e.currentTarget);

    try {
      await NutricionistaApi.editReporte(editingItem.id, formData);
      toast({ title: "Actualizado", description: "El menú ha sido modificado con éxito." });
      setEditingItem(null);
      loadMenus();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el registro." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(id); // Iniciamos el loader para este ID específico
      await NutricionistaApi.deleteReporte(id);
      toast({ title: "Eliminado", description: "Menú eliminado correctamente." });
      loadMenus();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar." });
    } finally {
      setIsDeleting(null); // Quitamos el loader
    }
  };

  return (
    <main className="container mx-auto px-4 py-10 max-w-5xl space-y-10">
      <div className="flex flex-col gap-2 border-b pb-5">
        <h1 className="text-4xl font-extrabold tracking-tight">Panel de Nutrición</h1>
        <p className="text-lg text-muted-foreground">Carga y gestiona las planificaciones nutricionales.</p>
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

      {/* HISTORIAL */}
      <Card className="shadow-md">
        <CardHeader className="bg-muted/30 border-b font-bold text-xl flex flex-row items-center gap-2">
          <History className="w-5 h-5" /> Historial de Menús
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10 text-green-600" /></div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold">Periodo de Vigencia</TableHead>
                    <TableHead className="font-bold pl-8">Archivo</TableHead>
                    <TableHead className="text-right font-bold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => {
                      const esFuturo = new Date(item.fechaInicio) > new Date();
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-start gap-1">
                                <span className="text-[10px] uppercase font-black text-muted-foreground/60">Desde</span>
                                <div className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-bold ${
                                  esFuturo ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-green-50 text-green-700 border-green-200"
                                }`}>
                                  <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                                  {new Date(item.fechaInicio).toLocaleDateString("es-AR")}
                                </div>
                              </div>
                              <div className="flex flex-col items-start gap-1">
                                <span className="text-[10px] uppercase font-black text-muted-foreground/60">Hasta</span>
                                <div className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-bold ${
                                  esFuturo ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}>
                                  <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                                  {new Date(item.fechaFinal).toLocaleDateString("es-AR")}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              className="text-blue-600 hover:bg-blue-50 gap-2 font-semibold"
                              onClick={() => setPreviewImage({
                                url: item.archivo,
                                fecha: `${item.fechaInicio} al ${item.fechaFinal}`
                              })}
                            >
                              <Eye className="w-4 h-4" /> Ver Archivo
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="text-blue-600" onClick={() => setEditingItem(item)}>
                                <Edit className="w-5 h-5" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive">
                                    <Trash2 className="w-5 h-5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar este registro?</AlertDialogTitle>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>No</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(item.id)}
                                      className="bg-destructive hover:bg-destructive/90"
                                      disabled={isDeleting === item.id}
                                    >
                                      {isDeleting === item.id ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Sí, eliminar"}
                                    </AlertDialogAction>
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
                      <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                        No hay reportes cargados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
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
          <div className="flex-1 w-full bg-slate-100 overflow-hidden relative">
            {previewImage?.url.toLowerCase().endsWith('.pdf') ? (
              <iframe src={`${previewImage.url}#toolbar=0&view=FitH`} className="w-full h-full border-none" />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img src={previewImage?.url} alt="Menú" className="max-w-full max-h-full object-contain shadow-md" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL EDITAR */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Reporte</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="space-y-1">
                <Label>Fecha Inicio</Label>
                <Input name="fechaInicio" type="date" defaultValue={editingItem?.fechaInicio} required />
              </div>
              <div className="space-y-1">
                <Label>Fecha Final</Label>
                <Input name="fechaFinal" type="date" defaultValue={editingItem?.fechaFinal} required />
              </div>
              <div className="space-y-1">
                <Label>Nuevo Archivo (Opcional)</Label>
                <Input name="archivo" type="file" accept=".pdf,image/*" />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>Cancelar</Button>
              <Button type="submit" disabled={isUpdating} className="bg-green-700">
                {isUpdating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}