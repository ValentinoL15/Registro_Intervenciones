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
      const lista = data.content || data || [];

      setMenus(lista);

      // FORMA CORRECTA DE VER LA TABLA:
      console.log("--- DATOS RECIBIDOS DEL BACKEND ---");
      console.table(lista);
      // Si quieres un log normal, usa la coma, NO el signo +
      console.log("Lista completa:", lista);

    } catch (error) {
      console.error("Error:", error);
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
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo subir el menú." });
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
        <p className="text-lg text-muted-foreground">Carga y gestiona los menús semanales o mensuales.</p>
      </div>

      {/* FORMULARIO */}
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
              <Input id="archivo" name="archivo" type="file" accept=".pdf,image/*" required className="cursor-pointer" />
            </div>
            <Button type="submit" className="bg-green-700 hover:bg-green-800" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Apple className="mr-2 w-4 h-4" />}
              Subir Menú
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* TABLA HISTORIAL */}
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
                    <TableHead className="font-bold">Vigencia</TableHead>
                    <TableHead className="font-bold pl-8">Archivo</TableHead>
                    <TableHead className="text-right font-bold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="py-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-50 text-green-700 border border-green-100 text-xs font-bold shadow-sm">
                              <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                              {item.fechaInicio}
                            </div>
                            <span className="text-muted-foreground text-xs font-bold px-1">→</span>
                            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold shadow-sm">
                              <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                              {item.fechaFinal}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            className="text-blue-600 hover:bg-blue-50 gap-2"
                            onClick={() => setPreviewImage({
                              url: item.archivo,
                              fecha: `${item.fechaInicio} al ${item.fechaFinal}`
                            })}
                          >
                            <Eye className="w-4 h-4" /> Ver Menú
                          </Button>
                        </TableCell>
                        <TableCell className="text-right flex justify-end gap-1">
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
                              <AlertDialogHeader><AlertDialogTitle>¿Eliminar este menú?</AlertDialogTitle></AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>No</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={(e) => {
                                    e.preventDefault(); // Evitamos que el modal se cierre antes de tiempo si prefieres
                                    handleDelete(item.id);
                                  }}
                                  className="bg-destructive"
                                  disabled={isDeleting === item.id}
                                >
                                  {isDeleting === item.id ? (
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                  ) : null}
                                  {isDeleting === item.id ? "Borrando..." : "Sí, borrar"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    // ESTADO VACÍO: Se muestra cuando no hay registros
                    <TableRow>
                      <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileText className="h-8 w-8 opacity-20" />
                          <p>No hay menús cargados en el historial.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL PREVISUALIZACIÓN (SOPORTA PDF E IMAGEN) */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-white shadow-2xl">
          <DialogHeader className="p-4 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-lg font-bold">
              Menú: {previewImage?.fecha}
            </DialogTitle>
            {/* Botón opcional para abrir en pestaña nueva si el zoom del modal no les basta */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(previewImage?.url, '_blank')}
              className="mr-8"
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Pantalla Completa
            </Button>
          </DialogHeader>

          <div className="flex-1 w-full h-full bg-slate-200 overflow-auto flex items-center justify-center">
            {previewImage?.url && (
              previewImage.url.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={`${previewImage.url.replace('/fl_attachment', '')}#view=Fit`}
                  className="w-full h-full border-none"
                />
              ) : (
                <img
                  src={previewImage.url}
                  alt="Menú"
                  className="max-w-full max-h-full object-contain p-4"
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL EDITAR */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit className="w-5 h-5 text-green-600" /> Editar Reporte</DialogTitle>
            <DialogDescription>Modifica los datos del menú seleccionado.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 py-4">
            <div className="grid gap-4">
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isUpdating} className="bg-green-700 min-w-[140px]">
                {isUpdating ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Actualizando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}