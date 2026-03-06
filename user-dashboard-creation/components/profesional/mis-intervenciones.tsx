"use client";

import { useState, useEffect, useCallback } from "react";
import type { IntervencionDto } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  User, 
  Home, 
  Building, 
  Calendar, 
  Clock, 
  Pencil, 
  Trash2, 
  X,
  Loader2 
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EditProfesionalDialog } from "@/components/profesional/edit-profesional-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { profesionalApi } from "@/service/api";
import { useToast } from "@/hooks/use-toast";
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

export function MisIntervenciones() {
  const [intervenciones, setIntervenciones] = useState<IntervencionDto[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const { showLoader, hideLoader } = useLoader();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIntervencion, setSelectedIntervencion] = useState<IntervencionDto | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      showLoader("Cargando intervenciones...");
      const response = await profesionalApi.getMyIntervenciones(
        desde || undefined,
        hasta || undefined,
        currentPage,
        itemsPerPage
      );
      
      setIntervenciones(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Error cargando intervenciones:", error);
    } finally {
      setIsLoading(false);
      hideLoader();
    }
  }, [desde, hasta, currentPage, showLoader, hideLoader]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(0);
  }, [desde, hasta]);

  // --- LÓGICA DE PAGINACIÓN COMPACTA ---
  const renderPageNumbers = () => {
    const pages = [];
    const delta = 1; 

    for (let i = 0; i < totalPages; i++) {
      if (
        i === 0 || 
        i === totalPages - 1 || 
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={currentPage === i}
              onClick={(e) => { e.preventDefault(); setCurrentPage(i); }}
              className="cursor-pointer h-8 w-8 text-xs"
            >
              {i + 1}
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

  const formatDate = (fecha: string) => {
    if (!fecha) return "Sin fecha";
    const fechaLimpia = fecha.includes("T") ? fecha.split("T")[0] : fecha;
    return new Date(fechaLimpia + "T00:00:00").toLocaleDateString("es-AR", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric",
    });
  };

  const deleteIntervencion = async (intervencionId: string) => {
    try {
      showLoader("Eliminando...");
      await profesionalApi.delteIntervencion(intervencionId);
      loadData();
      toast({ title: "Eliminado", description: "Intervención eliminada con éxito" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* SECCIÓN DE FILTROS */}
      <div className="flex flex-wrap items-end gap-4 bg-muted/20 p-4 rounded-lg border border-dashed mb-2">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase">Desde</Label>
          <Input 
            type="date" 
            value={desde} 
            onChange={(e) => setDesde(e.target.value)} 
            className="h-9 w-40 bg-background" 
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase">Hasta</Label>
          <Input 
            type="date" 
            value={hasta} 
            onChange={(e) => setHasta(e.target.value)} 
            className="h-9 w-40 bg-background" 
          />
        </div>
        {(desde || hasta) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { setDesde(""); setHasta(""); }} 
            className="h-9 text-muted-foreground hover:text-destructive gap-2"
          >
            <X className="h-4 w-4" /> Limpiar
          </Button>
        )}
        <div className="ml-auto text-[10px] font-bold opacity-50 uppercase">
          {totalElements} Registros encontrados
        </div>
      </div>

      <div className="relative min-h-[200px]">
        {intervenciones.length === 0 && !isLoading ? (
          <div className="text-center py-12 border rounded-lg border-dashed">
            <p className="text-muted-foreground">No se encontraron intervenciones</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {intervenciones.map((intervencion) => (
              <div key={intervencion.intervencionId} className="p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={intervencion.intervencion === "EQUIPO" ? "default" : "secondary"} className="text-[10px] h-5">
                      {intervencion.intervencion === "EQUIPO" ? <Users className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                      {intervencion.intervencion === "EQUIPO" ? "Equipo" : "Individual"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] h-5">
                      {intervencion.tipo === "FAMILIA" ? <Home className="w-3 h-3 mr-1" /> : <Building className="w-3 h-3 mr-1" />}
                      {intervencion.tipo === "FAMILIA" ? "Familia" : "Institución"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedIntervencion(intervencion); setIsDialogOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                          <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteIntervencion(intervencion.intervencionId.toString())} className="bg-destructive hover:bg-destructive/90 text-white">Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <h3 className="font-semibold text-sm">{intervencion.nombre}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{intervencion.motivo}</p>
                <div className="flex items-center gap-4 text-[10px] font-medium text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(intervencion.fecha)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {intervencion.hora}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PAGINACIÓN COMPACTA IMPLEMENTADA */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(0, p - 1)); }} 
                  className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {renderPageNumbers()}

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

      <EditProfesionalDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        intervencion={selectedIntervencion} 
        onSuccess={loadData} 
      />
    </div>
  );
}