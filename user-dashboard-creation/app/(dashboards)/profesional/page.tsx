"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { DestinyType, IntervencionDto, IntervencionType } from "@/lib/types";
import { ProfesionalHeader } from "@/components/profesional/profesional-header";
import { IntervencionForm } from "@/components/profesional/intervencion-form";
import { MisIntervenciones } from "@/components/profesional/mis-intervenciones";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, History, ClipboardCheck } from "lucide-react";
import { profesionalApi } from "@/service/api"
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/lib/spinnerService";

export default function ProfesionalDashboard() {
  const { user } = useAuth();
  const [intervenciones, setIntervenciones] = useState<IntervencionDto[]>([]);
  const [activeTab, setActiveTab] = useState("nueva");
  const { toast } = useToast();
  const { showLoader, hideLoader } = useLoader();

  // Mantenemos tu nombre de función exacto
  const loadIntervenciones = useCallback(async () => {
    try {
      // Llamamos a la API (asegurate que api.ts devuelva data.content)
      const data = await profesionalApi.getMyIntervenciones();
      setIntervenciones(data.content || []);
    } catch(err:any) {
      console.error(err);
    }
  }, []);

  useEffect(() => {    
    loadIntervenciones();
  }, [loadIntervenciones]);

  const handleSubmitIntervencion = async(data: {tipo: DestinyType,nombre: string,fecha: string,hora: string,motivo: string,
    intervencion: IntervencionType,observaciones: string,profesionalesIds: string[]}) => {
    try {
      if (user) {
        showLoader("Guardando intervención...");
        await profesionalApi.createIntervencion(data);
        await loadIntervenciones();
        setActiveTab("historial");
        toast({ title: "Exitoso", description: "Registro creado con éxito" });
      }
    } catch(err: any) {
      console.error(err);
      throw err;
    } finally {
      hideLoader();
    }
  };

  const intervencionesEsteMes = intervenciones.filter((i) => {
    const fecha = new Date(i.fecha + "T00:00:00");
    const now = new Date();
    return (fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear());
  }).length;

  return (
    <div className="min-h-screen bg-background">
      <ProfesionalHeader userName={`${user?.name} ${user?.lastname}`} />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Panel de Intervenciones</h1>
          <p className="text-muted-foreground mt-1">Registra y consulta tus intervenciones</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-2xl">{intervenciones.length}</CardTitle>
                <p className="text-sm text-muted-foreground">Total intervenciones</p>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <History className="w-5 h-5 text-accent" />
              <div>
                <CardTitle className="text-2xl">{intervencionesEsteMes}</CardTitle>
                <p className="text-sm text-muted-foreground">Este mes</p>
              </div>
            </CardHeader>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nueva" className="gap-2"><PlusCircle className="w-4 h-4" /> Nueva Intervención</TabsTrigger>
            <TabsTrigger value="historial" className="gap-2"><History className="w-4 h-4" /> Mi Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="nueva">
            <Card><CardContent className="pt-6"><IntervencionForm onSubmit={handleSubmitIntervencion} /></CardContent></Card>
          </TabsContent>

          <TabsContent value="historial">
            <Card>
              <CardHeader><CardTitle>Mis Intervenciones</CardTitle></CardHeader>
              <CardContent>
                <MisIntervenciones intervenciones={intervenciones} onRefresh={loadIntervenciones} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}