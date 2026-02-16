"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { dataStore } from "@/lib/store";
import { DestinyType, IntervencionType, User, type Intervencion, type TipoDestinatario, type TipoIntervencion } from "@/lib/types";
import { ProfesionalHeader } from "@/components/profesional/profesional-header";
import { IntervencionForm } from "@/components/profesional/intervencion-form";
import { MisIntervenciones } from "@/components/profesional/mis-intervenciones";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, History, ClipboardCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { profesionalApi } from "@/service/api"
import { useToast } from "@/hooks/use-toast";

export default function ProfesionalDashboard() {
  const { user, isLoading } = useAuth();
  const [intervenciones, setIntervenciones] = useState<Intervencion[]>([]);
  const [activeTab, setActiveTab] = useState("nueva");
  const [error, setError] = useState("")
  const router = useRouter();
  const { toast } = useToast();

  const loadIntervenciones = async () => {
    try {
      const data = await profesionalApi.getIntervenciones()
      setIntervenciones([...data.content])
    } catch(err:any) {
      console.error(err)
    }
  };

  useEffect(() => {    
    loadIntervenciones()
  }, []);

  const handleSubmitIntervencion = async(data: {tipo: DestinyType,nombre: string,fecha: string,hora: string,motivo: string,
    intervencion: IntervencionType,observaciones: string,profesionalesIds: string[]}) => {
    try {
      if (user) {
      await profesionalApi.createIntervencion(data)
      setActiveTab("historial");
      toast({
        title: "Exitoso",
        description: "Registro creado con éxito"
      })
    }
    } catch(err: any) {
      console.error(err)
      throw err
    }
  };

  const intervencionesEsteMes = intervenciones.filter((i) => {
    const fecha = new Date(i.fecha);
    const now = new Date();
    return (
      fecha.getMonth() === now.getMonth() &&
      fecha.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="min-h-screen bg-background">
      <ProfesionalHeader userName={`${user?.name} ${user?.lastname}`} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground text-balance">
            Panel de Intervenciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Registra y consulta tus intervenciones
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <ClipboardCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{intervenciones.length}</CardTitle>
                <p className="text-sm text-muted-foreground">Total intervenciones</p>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10">
                <History className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-2xl">{intervencionesEsteMes}</CardTitle>
                <p className="text-sm text-muted-foreground">Este mes</p>
              </div>
            </CardHeader>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nueva" className="gap-2">
              <PlusCircle className="w-4 h-4" />
              Nueva Intervención
            </TabsTrigger>
            <TabsTrigger value="historial" className="gap-2">
              <History className="w-4 h-4" />
              Mi Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nueva">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Intervención</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Completa el formulario para registrar una nueva intervención
                </p>
              </CardHeader>
              <CardContent>
                <IntervencionForm onSubmit={handleSubmitIntervencion} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historial">
            <Card>
              <CardHeader>
                <CardTitle>Mis Intervenciones</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Historial de todas tus intervenciones registradas
                </p>
              </CardHeader>
              <CardContent>
                <MisIntervenciones intervenciones={intervenciones} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
