"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Apple, Trash2, History, Loader2, PlusCircle, Edit, 
  Eye, Calendar, X, BookOpen, FileText, CheckCircle2
} from "lucide-react";
import { NutricionistaApi } from "@/service/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLoader } from "@/lib/spinnerService";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

type PreviewState = { url: string; fecha: string; };

export default function NutricionistaPage() {
  const { toast } = useToast();
  const { showLoader, hideLoader } = useLoader();

  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState("planificacion");
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<PreviewState | null>(null);
  const [fileName, setFileName] = useState(""); 

  // Datos y Paginación para PLANIFICACIÓN
  const [menus, setMenus] = useState<any[]>([]);
  const [pageMenus, setPageMenus] = useState(0);
  const [totalPagesMenus, setTotalPagesMenus] = useState(0);

  // Datos y Paginación para BITÁCORA
  const [descripciones, setDescripciones] = useState<any[]>([]);
  const [pageNotas, setPageNotas] = useState(0);
  const [totalPagesNotas, setTotalPagesNotas] = useState(0);

  // Filtros
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");

  // Bitácora form
  const [nuevaNota, setNuevaNota] = useState("");
  const [fechaNota, setFechaNota] = useState(new Date().toISOString().split('T')[0]);
  const [editingDescription, setEditingDescription] = useState<any | null>(null);

  // --- CARGA DE DATOS ---
  const loadMenus = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await NutricionistaApi.getMyReportes(filtroDesde, filtroHasta, pageMenus, 6);
      setMenus(res.content || []);
      setTotalPagesMenus(res.totalPages || 0);

      // CORRECCIÓN: Si la página actual está vacía y no es la 0, retrocedemos
      if (res.content.length === 0 && pageMenus > 0) {
        setPageMenus(prev => prev - 1);
      }
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  }, [filtroDesde, filtroHasta, pageMenus]);

  const loadNotas = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await NutricionistaApi.getMyDescriptions(filtroDesde, filtroHasta, pageNotas, 5);
      setDescripciones(res.content || []);
      setTotalPagesNotas(res.totalPages || 0);

      // CORRECCIÓN: Si borramos todo en la página 2, volvemos a la 1 automáticamente
      if (res.content.length === 0 && pageNotas > 0) {
        setPageNotas(prev => prev - 1);
      }
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  }, [filtroDesde, filtroHasta, pageNotas]);

  useEffect(() => {
    if (activeTab === "planificacion") loadMenus();
    else loadNotas();
  }, [activeTab, loadMenus, loadNotas]);

  // Resetear páginas cuando cambian los filtros
  useEffect(() => {
    setPageMenus(0);
    setPageNotas(0);
  }, [filtroDesde, filtroHasta]);

  // --- MANEJADORES ---
  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const archivo = formData.get("archivo") as File;
    if (!archivo || archivo.size === 0) {
      toast({ variant: "destructive", title: "Falta el archivo", description: "Selecciona un archivo para continuar." });
      return;
    }
    showLoader("Subiendo planificación...");
    try {
      await NutricionistaApi.subirReporte(formData);
      toast({ title: "¡Éxito!", description: "Publicado correctamente." });
      (e.target as HTMLFormElement).reset();
      setFileName("");
      setPageMenus(0); // Volver a la primera para ver lo nuevo
      loadMenus();
    } catch (error: any) { toast({ variant: "destructive", title: "Error", description: error.message }); } 
    finally { hideLoader(); }
  };

  const handleDeleteReporte = async (id: number) => {
    showLoader("Eliminando...");
    try {
      await NutricionistaApi.deleteReporte(id);
      toast({ title: "Eliminado" });
      loadMenus();
    } catch (error: any) { toast({ variant: "destructive", title: "Error", description: error.message }); } 
    finally { hideLoader(); }
  };

  const handleSaveNota = async () => {
    if (!nuevaNota.trim()) return;
    showLoader("Guardando nota...");
    try {
      await NutricionistaApi.createDescription({ description: nuevaNota, fecha: fechaNota });
      toast({ title: "Nota registrada" });
      setNuevaNota("");
      setPageNotas(0); // Volver a la primera
      loadNotas();
    } catch (error: any) { toast({ variant: "destructive", title: "Error", description: error.message }); } 
    finally { hideLoader(); }
  };

  const handleEditNota = async () => {
    if (!editingDescription) return;
    showLoader("Actualizando...");
    try {
      await NutricionistaApi.editDescription(editingDescription.id.toString(), {
        description: editingDescription.description,
        fecha: editingDescription.fecha
      });
      setEditingDescription(null);
      loadNotas();
      toast({ title: "Actualizado" });
    } catch (error: any) { toast({ variant: "destructive", title: "Error", description: error.message }); } 
    finally { hideLoader(); }
  };

  const handleDeleteNota = async (id: string) => {
    showLoader("Borrando nota...");
    try {
      await NutricionistaApi.deleteDescription(id);
      loadNotas(); // La lógica dentro de loadNotas se encargará de bajar la página si quedó vacía
      toast({ title: "Borrado exitoso" });
    } catch (error: any) { toast({ variant: "destructive", title: "Error", description: error.message }); } 
    finally { hideLoader(); }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-xl text-white shadow-lg shadow-green-200">
              <Apple className="w-8 h-8" />
            </div>
            Gestión Nutricional
          </h1>
          <p className="text-slate-500 font-medium">Panel de control para planificaciones y bitácora diaria.</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border shadow-sm">
          <Calendar className="w-4 h-4 text-slate-400 ml-2" />
          <Input type="date" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)} className="h-8 border-none focus-visible:ring-0 text-xs w-32" />
          <Input type="date" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)} className="h-8 border-none focus-visible:ring-0 text-xs w-32" />
          {(filtroDesde || filtroHasta) && (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => {setFiltroDesde(""); setFiltroHasta("");}}>
              <X className="w-4 h-4 text-slate-400" />
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="planificacion" onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-slate-100/80 border p-1 h-14 w-full max-w-md grid grid-cols-2 rounded-2xl shadow-inner">
          <TabsTrigger value="planificacion" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-green-700 font-semibold transition-all">
            <FileText className="w-4 h-4 mr-2" /> Planificación
          </TabsTrigger>
          <TabsTrigger value="bitacora" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-amber-700 font-semibold transition-all">
            <BookOpen className="w-4 h-4 mr-2" /> Bitácora Diaria
          </TabsTrigger>
        </TabsList>

        {/* PESTAÑA 1: PLANIFICACIÓN */}
        <TabsContent value="planificacion" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-4 border-none shadow-xl bg-green-50/50 h-fit sticky top-24">
              <CardHeader><CardTitle className="text-xl text-green-800">Publicar Menú</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleFileUpload} className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2 text-green-700"><Label className="text-[10px] uppercase font-bold">Desde</Label><Input name="fechaInicio" type="date" required className="bg-white" /></div>
                    <div className="space-y-2 text-green-700"><Label className="text-[10px] uppercase font-bold">Hasta</Label><Input name="fechaFinal" type="date" required className="bg-white" /></div>
                  </div>
                  <div className="space-y-2 text-green-700">
                    <Label className="text-[10px] uppercase font-bold">Archivo</Label>
                    <input id="archivo-upload" name="archivo" type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} />
                    <label htmlFor="archivo-upload" className={`flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${fileName ? "border-green-500 bg-green-50" : "border-green-200 bg-white"}`}>
                      {fileName ? <CheckCircle2 className="w-8 h-8 mb-2 text-green-600" /> : <PlusCircle className="w-8 h-8 mb-2 text-green-600" />}
                      <p className="text-xs font-semibold">{fileName ? "Seleccionado" : "Click para subir"}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{fileName || "PDF o Imagen"}</p>
                    </label>
                  </div>
                  <Button type="submit" className="w-full bg-green-700 hover:bg-green-800 h-12 rounded-xl font-bold">Subir Planificación</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-8 border-none shadow-xl bg-white overflow-hidden flex flex-col">
              <Table>
                <TableHeader className="bg-slate-50/50"><TableRow><TableHead className="pl-6">Vigencia</TableHead><TableHead className="text-center">Estado</TableHead><TableHead className="text-center">Archivo</TableHead><TableHead className="text-right pr-6">Acciones</TableHead></TableRow></TableHeader>
                <TableBody>
                  {menus.length > 0 ? menus.map((m) => (
                    <TableRow key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="py-5 pl-6 font-semibold">{new Date(m.fechaInicio + "T00:00:00").toLocaleDateString()}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={new Date() >= new Date(m.fechaInicio) && new Date() <= new Date(m.fechaFinal) ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}>
                          {new Date() >= new Date(m.fechaInicio) && new Date() <= new Date(m.fechaFinal) ? "Vigente" : "Histórico"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center"><Button variant="link" onClick={() => setPreviewImage({ url: m.archivo, fecha: m.fechaInicio })} className="text-blue-600 font-bold gap-2"><Eye className="w-4 h-4" /> Ver</Button></TableCell>
                      <TableCell className="text-right pr-6">
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-300 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Eliminar?</AlertDialogTitle><AlertDialogDescription>Se borrará permanentemente.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>No</AlertDialogCancel><AlertDialogAction className="bg-red-600" onClick={() => handleDeleteReporte(m.id)}>Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={4} className="h-40 text-center text-slate-400 italic">No hay registros.</TableCell></TableRow>}
                </TableBody>
              </Table>
              {totalPagesMenus > 1 && (
                <div className="p-4 border-t bg-slate-50/30">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPageMenus(p => Math.max(0, p - 1)); }} className={pageMenus === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"} /></PaginationItem>
                      {[...Array(totalPagesMenus)].map((_, i) => (
                        <PaginationItem key={i}><PaginationLink href="#" isActive={pageMenus === i} onClick={(e) => { e.preventDefault(); setPageMenus(i); }} className="cursor-pointer">{i + 1}</PaginationLink></PaginationItem>
                      ))}
                      <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPageMenus(p => Math.min(totalPagesMenus - 1, p + 1)); }} className={pageMenus === totalPagesMenus - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} /></PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* PESTAÑA 2: BITÁCORA */}
        <TabsContent value="bitacora" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-4 border-none shadow-xl bg-amber-50/50 h-fit sticky top-24">
              <CardHeader><CardTitle className="text-xl text-amber-800">Nueva Observación</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2 text-amber-700"><Label className="text-xs font-bold uppercase">Fecha</Label><Input type="date" value={fechaNota} onChange={(e) => setFechaNota(e.target.value)} className="bg-white border-amber-200 h-9" /></div>
                <div className="space-y-2 text-amber-700"><Label className="text-[10px] uppercase font-bold text-amber-700 uppercase">Descripción</Label><textarea className="w-full min-h-[160px] p-4 rounded-xl border border-amber-200 bg-white text-sm outline-none focus:ring-2 focus:ring-amber-500" placeholder="Detalles..." value={nuevaNota} onChange={(e) => setNuevaNota(e.target.value)} /></div>
                <Button onClick={handleSaveNota} className="w-full bg-amber-600 hover:bg-amber-700 h-12 rounded-xl font-bold flex gap-2"><PlusCircle className="w-5 h-5" /> Registrar</Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="space-y-6 min-h-[400px]">
                {descripciones.length > 0 ? descripciones.map((nota) => (
                  <div key={nota.id} className="bg-white p-6 rounded-2xl border-l-8 border-l-amber-400 shadow-lg group relative border animate-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shadow-inner"><BookOpen className="w-5 h-5" /></div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-lg">{new Date(nota.fecha + "T00:00:00").toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                          <Badge variant="outline" className="w-fit text-[9px] uppercase text-amber-600 border-amber-200">Nota Profesional</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-blue-600 bg-blue-50" onClick={() => setEditingDescription(nota)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-red-600 bg-red-50" onClick={() => handleDeleteNota(nota.id.toString())}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    <p className="text-slate-600 italic">"{nota.description}"</p>
                  </div>
                )) : <div className="h-64 flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 italic"><BookOpen className="w-12 h-12 mb-4 opacity-10" /><p>Sin registros en bitácora.</p></div>}
              </div>

              {totalPagesNotas > 1 && (
                <div className="p-4 bg-white rounded-2xl border shadow-sm">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPageNotas(p => Math.max(0, p - 1)); }} className={pageNotas === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"} /></PaginationItem>
                      {[...Array(totalPagesNotas)].map((_, i) => (
                        <PaginationItem key={i}><PaginationLink href="#" isActive={pageNotas === i} onClick={(e) => { e.preventDefault(); setPageNotas(i); }} className="cursor-pointer">{i + 1}</PaginationLink></PaginationItem>
                      ))}
                      <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPageNotas(p => Math.min(totalPagesNotas - 1, p + 1)); }} className={pageNotas === totalPagesNotas - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} /></PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL PREVISUALIZACIÓN */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 overflow-hidden border-none shadow-2xl bg-white rounded-2xl">
          <div className="p-4 flex justify-between items-center bg-[#0f172a] text-white">
            <h3 className="text-sm font-bold flex gap-2"><FileText className="w-5 h-5 text-green-400" /> Vista Previa: {previewImage?.fecha}</h3>
            <Button variant="ghost" size="icon" onClick={() => setPreviewImage(null)} className="text-white hover:bg-white/10 rounded-full"><X className="w-6 h-6" /></Button>
          </div>
          <div className="flex-1 w-full h-[calc(90vh-64px)] bg-slate-100 flex items-center justify-center p-2 overflow-auto">
            {previewImage?.url.toLowerCase().endsWith('.pdf') ? (
              <iframe src={`${previewImage.url}#toolbar=0&view=FitH`} className="w-full h-full border-none rounded-lg bg-white" title="PDF Preview" />
            ) : (
              <img src={previewImage?.url} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border bg-white" alt="Vista previa" />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL EDITAR NOTA */}
      <Dialog open={!!editingDescription} onOpenChange={() => setEditingDescription(null)}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-3xl">
          <DialogHeader><DialogTitle className="text-2xl font-bold text-amber-700">Editar Nota</DialogTitle></DialogHeader>
          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Fecha</Label>
              <Input type="date" className="rounded-xl h-12" value={editingDescription?.fecha || ""} onChange={(e) => setEditingDescription({...editingDescription, fecha: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Descripción</Label>
              <textarea className="w-full min-h-[180px] p-4 rounded-2xl border bg-slate-50 outline-none focus:ring-2 focus:ring-amber-500" value={editingDescription?.description || ""} onChange={(e) => setEditingDescription({...editingDescription, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingDescription(null)} className="rounded-xl h-12">Cancelar</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-amber-200" onClick={handleEditNota}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}