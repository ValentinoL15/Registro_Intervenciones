"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Apple, Trash2, History, Loader2, PlusCircle, Edit, 
  Eye, Calendar, X, BookOpen, FileText, CheckCircle2, Save
} from "lucide-react";
import { NutricionistaApi } from "@/service/api";
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLoader } from "@/lib/spinnerService";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

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
  const [editingMenu, setEditingMenu] = useState<any | null>(null);

  // --- FUNCIÓN DE UTILIDAD: PAGINACIÓN COMPACTA ---
  const renderPaginationItems = (current: number, total: number, onChange: (p: number) => void) => {
    const items = [];
    const delta = 1; 

    for (let i = 0; i < total; i++) {
      if (i === 0 || i === total - 1 || (i >= current - delta && i <= current + delta)) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={current === i}
              onClick={(e) => { e.preventDefault(); onChange(i); }}
              className="cursor-pointer h-8 w-8 text-xs"
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (i === current - delta - 1 || i === current + delta + 1) {
        items.push(
          <PaginationItem key={i}>
            <PaginationEllipsis className="h-8 w-8" />
          </PaginationItem>
        );
      }
    }
    return items;
  };

   const handleDeleteReporte = async (id: number) => {
    showLoader("Eliminando...");
    try {
      await NutricionistaApi.deleteReporte(id);
      toast({ title: "Registro eliminado con éxito" });
      loadMenus();
    } catch (error: any) { toast({ variant: "destructive", title: "Error", description: error.message }); } 
    finally { hideLoader(); }
  };

  const handleEditMenu = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!editingMenu) return;

  const formData = new FormData(e.currentTarget);
  showLoader("Actualizando planificación...");
  
  try {
    // Aquí llamamos a tu API. El ID viene del estado editingMenu
    await NutricionistaApi.editReporte(editingMenu.id, formData); 
    toast({ title: "Planificación actualizada con éxito" });
    setEditingMenu(null);
    loadMenus();
  } catch (error: any) {
    toast({ variant: "destructive", title: "Error", description: error.message });
  } finally {
    hideLoader();
  }
};

  // --- CARGA DE DATOS ---
  const loadMenus = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await NutricionistaApi.getMyReportes(filtroDesde, filtroHasta, pageMenus, 6);
      setMenus(res.content || []);
      setTotalPagesMenus(res.totalPages || 0);
      if (res.content.length === 0 && pageMenus > 0) setPageMenus(prev => prev - 1);
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  }, [filtroDesde, filtroHasta, pageMenus]);

  const loadNotas = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await NutricionistaApi.getMyDescriptions(filtroDesde, filtroHasta, pageNotas, 5);
      setDescripciones(res.content || []);
      setTotalPagesNotas(res.totalPages || 0);
      if (res.content.length === 0 && pageNotas > 0) setPageNotas(prev => prev - 1);
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  }, [filtroDesde, filtroHasta, pageNotas]);

  useEffect(() => {
    if (activeTab === "planificacion") loadMenus();
    else loadNotas();
  }, [activeTab, loadMenus, loadNotas]);

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
      toast({ variant: "destructive", title: "Archivo requerido", description: "Selecciona un archivo." });
      return;
    }
    showLoader("Subiendo...");
    try {
      await NutricionistaApi.subirReporte(formData);
      toast({ title: "¡Éxito!", description: "Planificación publicada." });
      (e.target as HTMLFormElement).reset();
      setFileName("");
      setPageMenus(0);
      loadMenus();
    } catch (error: any) { toast({ variant: "destructive", title: "Error", description: error.message }); } 
    finally { hideLoader(); }
  };

  const handleSaveNota = async () => {
    if (!nuevaNota.trim()) return;
    showLoader("Guardando...");
    try {
      await NutricionistaApi.createDescription({ description: nuevaNota, fecha: fechaNota });
      toast({ title: "Nota registrada" });
      setNuevaNota("");
      setPageNotas(0);
      loadNotas();
    } catch (error: any) { toast({ variant: "destructive", title: "Error", description: error.message }); } 
    finally { hideLoader(); }
  };

  const handleDeleteNota = async (id: string) => {
    showLoader("Borrando...");
    try {
      await NutricionistaApi.deleteDescription(id);
      loadNotas();
      toast({ title: "Borrado exitoso" });
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

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-xl text-white shadow-lg">
              <Apple className="w-8 h-8" />
            </div>
            Gestión Nutricional
          </h1>
          <p className="text-slate-500 font-medium text-sm">Control profesional de planificaciones y bitácora.</p>
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

        {/* CONTENIDO 1: PLANIFICACIÓN */}
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
                    <Label className="text-[10px] uppercase font-bold">Archivo PDF / Imagen</Label>
                    <input id="archivo-upload" name="archivo" type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} />
                    <label htmlFor="archivo-upload" className={`flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${fileName ? "border-green-500 bg-green-50" : "border-green-200 bg-white"}`}>
                      {fileName ? <CheckCircle2 className="w-8 h-8 mb-2 text-green-600" /> : <PlusCircle className="w-8 h-8 mb-2 text-green-600" />}
                      <p className="text-[10px] text-slate-500 text-center px-4">{fileName || "Click para cargar archivo"}</p>
                    </label>
                  </div>
                  <Button type="submit" className="w-full bg-green-700 hover:bg-green-800 h-12 rounded-xl font-bold">Subir Planificación</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-8 border-none shadow-xl bg-white overflow-hidden flex flex-col relative min-h-[400px]">
              {isLoading && <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center"><Loader2 className="animate-spin text-green-600" /></div>}
              <Table>
                <TableHeader className="bg-slate-50/50"><TableRow><TableHead className="pl-6">Vigencia</TableHead><TableHead className="text-center">Estado</TableHead><TableHead className="text-center">Archivo</TableHead><TableHead className="text-right pr-6">Acciones</TableHead></TableRow></TableHeader>
                <TableBody>
                  {menus.length > 0 ? menus.map((m) => (
                    <TableRow key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="py-5 pl-6">
  <div className="flex flex-col">
    <span className="font-bold text-slate-800 text-sm">
      {new Date(m.fechaInicio + "T00:00:00").toLocaleDateString()}
    </span>
    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
      al {new Date(m.fechaFinal + "T00:00:00").toLocaleDateString()}
    </span>
  </div>
</TableCell>
                      <TableCell className="text-center"><Badge variant="outline" className={new Date() >= new Date(m.fechaInicio) && new Date() <= new Date(m.fechaFinal) ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500"}>{new Date() >= new Date(m.fechaInicio) && new Date() <= new Date(m.fechaFinal) ? "Vigente" : "Histórico"}</Badge></TableCell>
                      <TableCell className="text-center"><Button variant="link" onClick={() => setPreviewImage({ url: m.archivo, fecha: m.fechaInicio })} className="text-blue-600 font-bold text-xs gap-2"><Eye className="w-4 h-4" /> Ver</Button></TableCell>
                      <TableCell className="text-right pr-6">
                        <Button 
    variant="ghost" 
    size="icon" 
    className="text-blue-500 hover:text-blue-700"
    onClick={() => setEditingMenu(m)} // 'm' es el objeto del menú actual en el map
  >
    <Edit className="w-4 h-4" />
  </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-300 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Eliminar?</AlertDialogTitle><AlertDialogDescription>Se borrará permanentemente del sistema.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>No</AlertDialogCancel><AlertDialogAction className="bg-red-600" onClick={() => handleDeleteReporte(m.id)}>Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  )) : !isLoading && <TableRow><TableCell colSpan={4} className="h-40 text-center text-slate-400 italic">Sin registros.</TableCell></TableRow>}
                </TableBody>
              </Table>
              {totalPagesMenus > 1 && (
                <div className="p-4 border-t bg-slate-50/30 mt-auto flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if(pageMenus > 0) setPageMenus(p => p - 1); }} className={pageMenus === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"} /></PaginationItem>
                      {renderPaginationItems(pageMenus, totalPagesMenus, setPageMenus)}
                      <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); if(pageMenus < totalPagesMenus - 1) setPageMenus(p => p + 1); }} className={pageMenus === totalPagesMenus - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} /></PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* CONTENIDO 2: BITÁCORA */}
        <TabsContent value="bitacora" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-4 border-none shadow-xl bg-amber-50/50 h-fit sticky top-24">
              <CardHeader><CardTitle className="text-xl text-amber-800">Nueva Observación</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2 text-amber-700"><Label className="text-xs font-bold uppercase">Fecha</Label><Input type="date" value={fechaNota} onChange={(e) => setFechaNota(e.target.value)} className="bg-white border-amber-200 h-10" /></div>
                <div className="space-y-2 text-amber-700"><Label className="text-xs font-bold uppercase">Descripción</Label><textarea className="w-full min-h-[160px] p-4 rounded-xl border border-amber-200 bg-white text-sm outline-none focus:ring-2 focus:ring-amber-500" placeholder="Escribe aquí los detalles del seguimiento..." value={nuevaNota} onChange={(e) => setNuevaNota(e.target.value)} /></div>
                <Button onClick={handleSaveNota} className="w-full bg-amber-600 hover:bg-amber-700 h-12 rounded-xl font-bold flex gap-2"><Save className="w-5 h-5" /> Registrar</Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-8 flex flex-col gap-6 relative min-h-[400px]">
              {isLoading && <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] z-10 flex items-center justify-center"><Loader2 className="animate-spin text-amber-600" /></div>}
              <div className="space-y-6">
                {descripciones.length > 0 ? descripciones.map((nota) => (
    <div key={nota.id} className="bg-white p-6 rounded-2xl border-l-8 border-l-amber-400 shadow-md group relative border hover:shadow-lg transition-all animate-in slide-in-from-right-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shadow-inner">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-sm">
              {new Date(nota.fecha + "T00:00:00").toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <Badge variant="secondary" className="w-fit text-[9px] uppercase bg-amber-50 text-amber-700 hover:bg-amber-50">
              Nota de Seguimiento
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-blue-600" 
            onClick={() => setEditingDescription(nota)}
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>

          {/* AGREGADO: AlertDialog para confirmar eliminación de nota */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-none">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-amber-800 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" /> ¿Eliminar esta nota?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. La nota de bitácora del día {" "}
                  <span className="font-bold text-slate-900">
                    {new Date(nota.fecha + "T00:00:00").toLocaleDateString()}
                  </span> {" "}
                  desaparecerá del historial.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl border-none bg-slate-100">Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  className="rounded-xl bg-red-600 hover:bg-red-700 font-bold"
                  onClick={() => handleDeleteNota(nota.id.toString())}
                >
                  Confirmar Eliminación
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <p className="text-slate-600 text-sm italic leading-relaxed break-words">"{nota.description}"</p>
    </div>
  )) : !isLoading && (
    <div className="h-64 flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 italic text-sm">
      <BookOpen className="w-12 h-12 mb-4 opacity-10" />
      <p>Sin notas registradas.</p>
    </div>
  )}
              </div>

              {totalPagesNotas > 1 && (
                <div className="mt-auto pt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if(pageNotas > 0) setPageNotas(p => p - 1); }} className={pageNotas === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"} /></PaginationItem>
                      {renderPaginationItems(pageNotas, totalPagesNotas, setPageNotas)}
                      <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); if(pageNotas < totalPagesNotas - 1) setPageNotas(p => p + 1); }} className={pageNotas === totalPagesNotas - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} /></PaginationItem>
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
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 overflow-hidden border-none shadow-2xl bg-[#0f172a] rounded-2xl">
          <div className="p-4 flex justify-between items-center text-white border-b border-white/10">
            <h3 className="text-xs font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-green-400" /> Fecha Plan: {previewImage?.fecha}</h3>
            <Button variant="ghost" size="icon" onClick={() => setPreviewImage(null)} className="text-white hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></Button>
          </div>
          <div className="flex-1 w-full h-[calc(90vh-64px)] bg-slate-900/50 flex items-center justify-center overflow-auto">
            {previewImage?.url.toLowerCase().endsWith('.pdf') ? (
              <iframe src={`${previewImage.url}#toolbar=0&view=FitH`} className="w-full h-full border-none bg-white" title="PDF Preview" />
            ) : (
              <img src={previewImage?.url} className="max-w-full max-h-full object-contain" alt="Vista previa" />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL EDITAR NOTA */}
      <Dialog open={!!editingDescription} onOpenChange={() => setEditingDescription(null)}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          <div className="bg-amber-600 p-6 text-white"><DialogTitle className="text-xl font-bold">Editar Nota</DialogTitle></div>
          <div className="p-6 space-y-5 bg-white">
            <div className="space-y-2"><Label className="text-xs font-bold text-slate-500 uppercase">Fecha</Label><Input type="date" className="h-11 rounded-xl" value={editingDescription?.fecha || ""} onChange={(e) => setEditingDescription({...editingDescription, fecha: e.target.value})} /></div>
            <div className="space-y-2"><Label className="text-xs font-bold text-slate-500 uppercase">Descripción</Label><textarea className="w-full min-h-[160px] p-4 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-amber-500 text-sm" value={editingDescription?.description || ""} onChange={(e) => setEditingDescription({...editingDescription, description: e.target.value})} /></div>
            <div className="flex gap-3 pt-4">
              <Button variant="ghost" onClick={() => setEditingDescription(null)} className="flex-1 h-12 rounded-xl">Cancelar</Button>
              <Button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-12 font-bold" onClick={handleEditNota}>Guardar Cambios</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL EDITAR PLANIFICACIÓN */}
<Dialog open={!!editingMenu} onOpenChange={() => setEditingMenu(null)}>
  <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
    <div className="bg-green-700 p-6 text-white">
      <DialogTitle className="text-xl font-bold flex items-center gap-2">
        <Edit className="w-5 h-5" /> Editar Planificación
      </DialogTitle>
    </div>
    <form onSubmit={handleEditMenu} className="p-6 space-y-5 bg-white">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase">Fecha Inicio</Label>
          <Input 
            name="fechaInicio" 
            type="date" 
            defaultValue={editingMenu?.fechaInicio} 
            required 
            className="h-11 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase">Fecha Fin</Label>
          <Input 
            name="fechaFinal" 
            type="date" 
            defaultValue={editingMenu?.fechaFinal} 
            required 
            className="h-11 rounded-xl"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-500 uppercase">Reemplazar Archivo (Opcional)</Label>
        <Input 
          name="archivo" 
          type="file" 
          accept=".pdf,image/*" 
          className="h-11 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
        <p className="text-[10px] text-slate-400 italic">Si no seleccionas un archivo, se mantendrá el actual.</p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={() => setEditingMenu(null)} className="flex-1 h-12 rounded-xl">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 bg-green-700 hover:bg-green-800 text-white rounded-xl h-12 font-bold">
          Guardar Cambios
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>
    </main>
  );
}