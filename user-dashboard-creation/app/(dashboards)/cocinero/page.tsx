"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, UtensilsCrossed, Trash2, History, Loader2, Save, Calendar, Ban, CheckCircle2, Edit } from "lucide-react";
import { CocineroApi } from "@/service/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CocinaDto, MenuDiaDto } from "@/lib/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CocineroPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menus, setMenus] = useState<MenuDiaDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Ajusta cuántos días quieres ver por página
  const totalPages = Math.ceil(menus.length / itemsPerPage);
  const [editingMenu, setEditingMenu] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Esta es la variable que te faltaba definir:
  const currentItems = menus.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const { toast } = useToast();

  const loadMenus = useCallback(async () => {
  try {
    setIsLoading(true);
    const response = await CocineroApi.getMisMenus();
    const listaLimpia = response.content || response || [];

    // Ordenamos: la fecha más reciente (mayor) va primero
    const listaOrdenada = Array.isArray(listaLimpia) 
      ? [...listaLimpia].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      : [];

    setMenus(listaOrdenada);
  } catch (error) {
    console.error("Error al cargar menús:", error);
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
    const formData = new FormData(form);

    const menuData = {
      fecha: formData.get("fecha") as string,
      descCeliaco: formData.get("descCeliaco") as string,
      descNoCeliaco: formData.get("descNoCeliaco") as string,
    };

    try {
      await CocineroApi.createComida(menuData);
      toast({ title: "¡Buen provecho!", description: "El menú del día ha sido publicado." });
      form.reset();
      loadMenus();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo crear el menú."
      });
      console.log(error)
    } finally {
      setIsSubmitting(false);
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
    const idCeliaco = editingMenu.cocina?.find((p: any) => p.tipoComida === 'CELIACO')?.id;
    const idNoCeliaco = editingMenu.cocina?.find((p: any) => p.tipoComida === 'NOCELIACO')?.id;

    // Ejecutamos las 3 actualizaciones en paralelo
    await Promise.all([
      // 1. Actualizar fecha (MenuDia)
      CocineroApi.editFecha(editingMenu.menuId, { fecha: nuevaFecha }),
      
      // 2. Actualizar platos (Cocina)
      idCeliaco && CocineroApi.editMenu(idCeliaco, { description: descCeliaco }),
      idNoCeliaco && CocineroApi.editMenu(idNoCeliaco, { description: descNoCeliaco })
    ]);

    toast({ title: "Éxito", description: "Menú y fecha actualizados correctamente." });
    setEditingMenu(null);
    loadMenus();
  } catch (error: any) {
    toast({ 
      variant: "destructive", 
      title: "Error", 
      description: error.message|| "No se pudo actualizar el menú." 
    });
  } finally {
    setIsUpdating(false);
  }
};

  const handleDelete = async (id: number) => {
    try {
      await CocineroApi.deleteMenu(id);
      toast({ title: "Eliminado", description: "El menú ha sido retirado." });
      loadMenus();
    } catch (error) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  return (
    <main className="container mx-auto px-4 py-10 max-w-5xl space-y-10">
      <div className="flex flex-col gap-2 border-b pb-5">
        <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <ChefHat className="w-10 h-10 text-orange-600" /> Panel de Cocina
        </h1>
        <p className="text-lg text-muted-foreground">Registra los platos para los alumnos celiacos y no celiacos.</p>
      </div>

      {/* FORMULARIO DE CARGA */}
      <section>
        <Card className="shadow-lg border-t-4 border-t-orange-600">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-orange-600" /> Menú del Día
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="max-w-[200px] space-y-2">
                <Label htmlFor="fecha">Fecha del Menú</Label>
                <Input id="fecha" name="fecha" type="date" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* PLATO NO CELIACO */}
                <div className="space-y-3 p-4 rounded-xl bg-green-50/50 border border-green-100">
                  <div className="flex items-center gap-2 text-green-700 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    <Label className="text-lg">Menú General (No Celiaco)</Label>
                  </div>
                  <Textarea
                    name="descNoCeliaco"
                    placeholder="Ej: Milanesa con puré de papas..."
                    className="min-h-[120px] bg-white"
                    required
                  />
                </div>

                {/* PLATO CELIACO */}
                <div className="space-y-3 p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                  <div className="flex items-center gap-2 text-orange-700 font-bold">
                    <Ban className="w-5 h-5" />
                    <Label className="text-lg">Menú Celiaco (Sin TACC)</Label>
                  </div>
                  <Textarea
                    name="descCeliaco"
                    placeholder="Ej: Risotto de calabaza apto celiacos..."
                    className="min-h-[120px] bg-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-6" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-5 h-5" />}
                  Publicar Menú Completo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* HISTORIAL DE CARGAS */}
      <section>
        <Card className="shadow-md">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <History className="w-5 h-5 text-muted-foreground" /> Mis Registros Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin w-10 h-10 text-orange-600" /></div>
            ) : (
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[150px]">Fecha</TableHead>
                      <TableHead>Platos del Día</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((menu) => (
                      <TableRow key={menu.menuId} className="hover:bg-muted/5 group">
                        {/* Columna de Fecha más pequeña */}
                        <TableCell className="align-top py-4">
                          <div className="flex items-center gap-2 font-bold text-sm">
                            <Calendar className="w-4 h-4 text-orange-600" />
                            {menu.fecha}
                          </div>
                        </TableCell>

                        {/* Platos en formato horizontal o mini-cards para ahorrar espacio */}
                        <TableCell className="py-2">
                          <div className="flex flex-row gap-2 overflow-x-auto pb-2">
                            {menu.cocina?.map((plato: any) => (
                              <div
                                key={plato.id}
                                className={`min-w-[200px] p-2 rounded-md border text-xs shadow-sm ${plato.tipoComida === 'CELIACO'
                                  ? 'bg-orange-50/50 border-orange-100'
                                  : 'bg-green-50/50 border-green-100'
                                  }`}
                              >
                                <span className="font-black block mb-1 uppercase opacity-70">
                                  {plato.tipoComida === 'CELIACO' ? '⚠️ Celiaco' : '✅ General'}
                                </span>
                                <p className="line-clamp-2 italic">"{plato.description}"</p>
                              </div>
                            ))}
                          </div>
                        </TableCell>

                        <TableCell className="text-right align-top py-4">
                          <div className="flex justify-end gap-2">
                            {/* BOTÓN EDITAR */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-600 hover:bg-blue-50"
                              onClick={() => {
                                // Buscamos las descripciones actuales para precargar el modal
                                const celiaco = menu.cocina?.find((p: any) => p.tipoComida === 'CELIACO')?.description || "";
                                const noCeliaco = menu.cocina?.find((p: any) => p.tipoComida === 'NOCELIACO')?.description || "";
                                setEditingMenu({ ...menu, descCeliaco: celiaco, descNoCeliaco: noCeliaco });
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            {/* BOTÓN ELIMINAR */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/5">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar este menú?</AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(menu.menuId)}
                                    className="bg-destructive hover:bg-destructive/90"
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
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      Anterior
                    </Button>
                    <span className="flex items-center px-4 text-sm font-medium">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
      <Dialog open={!!editingMenu} onOpenChange={() => setEditingMenu(null)}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Edit className="w-5 h-5 text-orange-600" /> Editar Menú del Día
      </DialogTitle>
    </DialogHeader>
    <form onSubmit={handleUpdate} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Fecha</Label>
        <Input name="fecha" type="date" defaultValue={editingMenu?.fecha} required />
      </div>
      
      <div className="space-y-2">
        <Label className="text-green-700">Menú General</Label>
        <Textarea 
          name="descNoCeliaco" 
          defaultValue={editingMenu?.descNoCeliaco} 
          required 
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-orange-700">Menú Celiaco</Label>
        <Textarea 
          name="descCeliaco" 
          defaultValue={editingMenu?.descCeliaco} 
          required 
          className="min-h-[100px]"
        />
      </div>

      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={() => setEditingMenu(null)}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isUpdating} className="bg-orange-600">
          {isUpdating ? <Loader2 className="animate-spin mr-2" /> : "Guardar Cambios"}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
    </main>
  );
}