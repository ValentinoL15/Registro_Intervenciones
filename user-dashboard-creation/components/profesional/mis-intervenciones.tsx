"use client";

import type { Intervencion, IntervencionDto } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Users, User, Home, Building, Calendar, Clock, Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { EditProfesionalDialog } from "@/components/profesional/edit-profesional-dialog"
import { useState } from "react";
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";



interface MisIntervencionesProps {
  intervenciones: IntervencionDto[];
  onRefresh: () => void;
}

export function MisIntervenciones({ intervenciones, onRefresh }: MisIntervencionesProps) {

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Cantidad de cards por página
  
  const totalPages = Math.ceil(intervenciones.length / itemsPerPage);
  
  // Obtener las intervenciones de la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentIntervenciones = intervenciones.slice(startIndex, startIndex + itemsPerPage);

  // Funciones para navegar
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  // -----------------------------

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedIntervencion, setSelectedIntervencion] = useState<IntervencionDto | null>(null);
    const { toast } = useToast();

  const formatDate = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleEditClick = (intervencion: IntervencionDto) => {
    setSelectedIntervencion(intervencion);
    setIsDialogOpen(true);
  };

  const deleteIntervencion = async(intervencionId: string) => {
    try {
      await profesionalApi.delteIntervencion(intervencionId)
      onRefresh(); 

      toast({ title: "Eliminado", description: "Intervención eliminada con éxito" });

    } catch(err : any) {
      console.error(err.message)
      toast({ title: "Error", description: err.message });
      throw err
    }
  }

  if (intervenciones.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No tienes intervenciones registradas
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Registra tu primera intervención en la pestaña anterior
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {currentIntervenciones.map((intervencion) => (
        <div
          key={intervencion.intervencionId}
          className="p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            {/* Contenedor de Badges (Izquierda) */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={intervencion.intervencion === "EQUIPO" ? "default" : "secondary"}
                className="gap-1"
              >
                {intervencion.intervencion === "EQUIPO" ? (
                  <Users className="w-3 h-3" />
                ) : (
                  <User className="w-3 h-3" />
                )}
                {intervencion.intervencion === "EQUIPO" ? "Equipo" : "Individual"}
              </Badge>

              <Badge variant="outline" className="gap-1">
                {intervencion.tipo === "FAMILIA" ? (
                  <Home className="w-3 h-3" />
                ) : (
                  <Building className="w-3 h-3" />
                )}
                {intervencion.tipo === "FAMILIA" ? "Familia" : "Institución"}
              </Badge>
            </div>

            {/* Contenedor de Acciones (Derecha) */}
            <div className="flex items-center gap-1">
              <EditProfesionalDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                intervencion={selectedIntervencion}
                onSuccess={onRefresh}
              />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditClick(intervencion)}>
                <Pencil className="w-4 h-4" />
                <span className="sr-only">Editar</span>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Eliminar Intervención</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Eliminar Intervención</AlertDialogTitle>
                    <AlertDialogDescription>
                      ¿Estás seguro de que deseas eliminar la intervención de <span className="font-bold">{intervencion.nombre}</span>? 
                      Se eliminará por completo
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteIntervencion(intervencion.intervencionId)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            {intervencion.nombre}
          </h3>

          <p className="text-sm text-muted-foreground mb-3">
            {intervencion.motivo}
          </p>

          {intervencion.observaciones && (
            <p className="text-sm text-muted-foreground italic mb-3 p-2 rounded bg-muted/50 break-all">
              {intervencion.observaciones}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(intervencion.fecha)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {intervencion.hora}
            </span>
          </div>
        </div>
      ))}

    {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); goToPreviousPage(); }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {/* Generar números de página */}
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === pageNumber}
                      onClick={(e) => { e.preventDefault(); setCurrentPage(pageNumber); }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); goToNextPage(); }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Página {currentPage} de {totalPages} ({intervenciones.length} registros)
          </p>
        </div>
      )}

    </div>
  );
}
