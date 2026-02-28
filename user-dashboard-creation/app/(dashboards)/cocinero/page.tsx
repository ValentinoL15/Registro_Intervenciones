"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, UtensilsCrossed, Trash2, History, Calendar, Ban, CheckCircle2, Edit, X } from "lucide-react";
import { CocineroApi } from "@/service/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { MenuDiaDto } from "@/lib/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLoader } from "@/lib/spinnerService";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";

export default function CocineroPage() {
  const [menus, setMenus] = useState<MenuDiaDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMenu, setEditingMenu] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [currentPage, setCurrentPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 6;

  const { toast } = useToast();
  const { showLoader, hideLoader } = useLoader();

  const loadMenus = useCallback(async () => {
    try {
      setIsLoading(true);
      showLoader("Cargando menús..."); // Usamos el loader global
      const response = await CocineroApi.getMisMenus(
        filtroDesde,
        filtroHasta,
        currentPage,
        itemsPerPage
      );
      
      setMenus(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Error al cargar menús:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudieron obtener los registros." });
    } finally {
      setIsLoading(false);
      hideLoader(); // Cerramos el loader global
    }
  }, [currentPage, filtroDesde, filtroHasta, toast, showLoader, hideLoader]);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  useEffect(() => {
    setCurrentPage(0);
  }, [filtroDesde, filtroHasta]);

  // ... (handleSubmit, handleUpdate y handleDelete se mantienen igual)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setIsSubmitting(true);

    const menuData = {
      fecha: formData.get("fecha") as string,
      descCeliaco: formData.get("descCeliaco") as string,
      descNoCeliaco: formData.get("descNoCeliaco") as string,
    };

    try {
      showLoader("Creando menú...");
      await CocineroApi.createComida(menuData);
      toast({ title: "¡Buen provecho!", description: "El menú ha sido publicado." });
      form.reset();
      setCurrentPage(0);
      loadMenus();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSubmitting(false);
      hideLoader();
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMenu) return;
    
    setIsUpdating(true);
    const formData = new FormData(e.currentTarget);
    const nuevaFecha = formData.get("fecha") as string;
    const descCeliaco = formData.get("descCeliaco") as string;
    const descNoCeliaco = formData.get("descNoCeliaco") as string;

    try {
      showLoader("Actualizando registro...");
      const idCeliaco = editingMenu.cocina?.find((p: any) => p.tipoComida === 'CELIACO')?.id;
      const idNoCeliaco = editingMenu.cocina?.find((p: any) => p.tipoComida === 'NOCELIACO')?.id;

      await Promise.all([
        CocineroApi.editFecha(editingMenu.menuId, { fecha: nuevaFecha }),
        idCeliaco && CocineroApi.editMenu(idCeliaco, { description: descCeliaco }),
        idNoCeliaco && CocineroApi.editMenu(idNoCeliaco, { description: descNoCeliaco })
      ]);

      toast({ title: "Éxito", description: "Menú actualizado correctamente." });
      setEditingMenu(null);
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
      showLoader("Eliminando menú...");
      await CocineroApi.deleteMenu(id);
      toast({ title: "Eliminado", description: "El menú ha sido retirado." });
      loadMenus();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el registro." });
    } finally {
      hideLoader();
    }
  };

  return (
    <main className="container mx-auto px-4 py-10 max-w-5xl space-y-10">
      <div className="flex flex-col gap-2 border-b pb-5">
        <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3 text-foreground">
          <ChefHat className="w-10 h-10 text-orange-600" /> Panel de Cocina
        </h1>
        <p className="text-lg text-muted-foreground">Gestiona los platos diarios para alumnos celiacos y generales.</p>
      </div>

      <Card className="shadow-lg border-t-4 border-t-orange-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-orange-600" /> Nuevo Menú
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="max-w-[200px] space-y-2">
              <Label htmlFor="fecha">Fecha del Menú</Label>
              <Input id="fecha" name="fecha" type="date" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3 p-4 rounded-xl bg-green-50/50 border border-green-100">
                <div className="flex items-center gap-2 text-green-700 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <Label className="text-lg">Menú General</Label>
                </div>
                <Textarea name="descNoCeliaco" placeholder="Descripción del plato..." className="min-h-[120px] bg-white" required />
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                <div className="flex items-center gap-2 text-orange-700 font-bold">
                  <Ban className="w-5 h-5" />
                  <Label className="text-lg">Menú Celiaco</Label>
                </div>
                <Textarea name="descCeliaco" placeholder="Descripción del plato..." className="min-h-[120px] bg-white" required />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-6 shadow-md" disabled={isSubmitting}>
                Publicar Menú
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center justify-between text-xl font-bold">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-muted-foreground" /> Historial de Menús
            </div>
            <span className="text-xs font-normal text-muted-foreground uppercase tracking-wider">
              {totalElements} Registros Totales
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
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

          <div className="rounded-xl border overflow-hidden relative">
            {/* AQUÍ ELIMINAMOS EL BLOQUE DEL CARGADOR NARANJA */}
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[180px] font-bold">Fecha</TableHead>
                  <TableHead className="font-bold">Platos del Día</TableHead>
                  <TableHead className="text-right font-bold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menus.length > 0 ? (
                  menus.map((menu) => (
                    <TableRow key={menu.menuId} className="hover:bg-muted/5 transition-colors">
                      <TableCell className="align-top py-4 font-bold text-primary">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          {new Date(menu.fecha + "T00:00:00").toLocaleDateString("es-AR")}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex flex-row gap-2 overflow-x-auto pb-2">
                          {menu.cocina?.map((plato: any) => (
                            <div key={plato.id} className={`min-w-[220px] p-3 rounded-md border text-xs shadow-sm ${plato.tipoComida === 'CELIACO' ? 'bg-orange-50/50 border-orange-100' : 'bg-green-50/50 border-green-100'}`}>
                              <span className="font-black block mb-1 uppercase opacity-70">
                                {plato.tipoComida === 'CELIACO' ? '⚠️ Celiaco' : '✅ General'}
                              </span>
                              <p className="line-clamp-2 italic leading-relaxed text-foreground">"{plato.description}"</p>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right align-top py-4">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="text-blue-600" onClick={() => {
                            const celiaco = menu.cocina?.find((p: any) => p.tipoComida === 'CELIACO')?.description || "";
                            const noCeliaco = menu.cocina?.find((p: any) => p.tipoComida === 'NOCELIACO')?.description || "";
                            setEditingMenu({ ...menu, descCeliaco: celiaco, descNoCeliaco: noCeliaco });
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar este menú?</AlertDialogTitle>
                                <AlertDialogDescription>Esta acción retirará la publicación del menú para esta fecha.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(menu.menuId)} className="bg-destructive hover:bg-destructive/90 text-white">Eliminar</AlertDialogAction>
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
                      No se encontraron menús para el periodo seleccionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

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

      {/* DIALOG DE EDICIÓN */}
      <Dialog open={!!editingMenu} onOpenChange={() => setEditingMenu(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-bold">
              <Edit className="w-5 h-5 text-orange-600" /> Editar Menú del Día
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fecha del Registro</Label>
              <Input name="fecha" type="date" defaultValue={editingMenu?.fecha} required />
            </div>
            <div className="space-y-2">
              <Label className="text-green-700 font-bold">Menú General</Label>
              <Textarea name="descNoCeliaco" defaultValue={editingMenu?.descNoCeliaco} required className="min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <Label className="text-orange-700 font-bold">Menú Celiaco</Label>
              <Textarea name="descCeliaco" defaultValue={editingMenu?.descCeliaco} required className="min-h-[100px]" />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingMenu(null)}>Cancelar</Button>
              <Button type="submit" disabled={isUpdating} className="bg-orange-600 text-white hover:bg-orange-700">
                {isUpdating ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}