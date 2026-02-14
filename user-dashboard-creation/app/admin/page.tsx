"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { dataStore } from "@/lib/store";
import type { User, Intervencion, DiaSemana, Turno, createProfesionalDTO } from "@/lib/types";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProfesionalesTable } from "@/components/admin/profesionales-table";
import { IntervencionesTable } from "@/components/admin/intervenciones-table";
import { AddProfesionalDialog } from "@/components/admin/add-profesional-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ClipboardList, Plus } from "lucide-react";
import { AdminApi, profesionalApi } from "@/service/api";

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [profesionales, setProfesionales] = useState<User[]>([]);
  const [activeProfs, setActiveProfs] = useState<User[]>([])
  const [intervenciones, setIntervenciones] = useState<Intervencion[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const loadProfesionales = async () => {
  try {
    const data = await profesionalApi.getProfesionales();
    setProfesionales([...data.content]); 
    const activos = data.content.filter((prof: User) => prof.active === true);
    
    setActiveProfs(activos);
  } catch(err) {
    console.error(err);
  }
};

  useEffect(() => {
  if (!isLoading) {
    if (!user) {
      router.replace("/");
    } else if (user.role !== "ADMIN") {
      router.replace("/"); 
    } else {
      // Cargar profesionales cuando el usuario es admin
      loadProfesionales();
    }
  }
}, [user, isLoading, router]); // Removemos loadProfesionales de las dependencias


  const handleAddProfesional = async (data: createProfesionalDTO) => {
  try {
    // 1. Enviamos a la base de datos a través de la API
    await AdminApi.createProfesional({
      name: data.name,
      lastname: data.lastname,
      username: data.username,
      email: data.email,
      hourly: data.hourly,
      days: data.days,
      turno: data.turno,
      role: "PROFESIONAL"
    });

    // 2. Refrescamos la lista local para que aparezca el nuevo
    await loadProfesionales()
    
    // 3. Cerramos el modal
    setIsDialogOpen(false);
    
  } catch (err: any) {
    console.log(err)
    throw err;
  }
};

 const handleDeleteProfesional = async (id: string) => {
  try {
    await AdminApi.deleteProfesional(id);
    // Actualiza el estado local después de eliminar
    setProfesionales(prev => prev.filter(p => p.userId !== id));
  } catch (error) {
    console.error("Error al eliminar:", error);
  }
};

  const getProfesionalName = (profesionalId: string) => {
    const prof = profesionales.find((p) => p.userId === profesionalId);
    return prof ? `${prof.name} ${prof.lastname}` : "Desconocido";
  };

  

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader userName={`${user?.name} ${user?.lastname}`} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground text-balance">
            Panel de Administración
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona profesionales y visualiza las intervenciones registradas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{activeProfs.length}</CardTitle>
                <p className="text-sm text-muted-foreground">Profesionales activos</p>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10">
                <ClipboardList className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-2xl">{intervenciones.length}</CardTitle>
                <p className="text-sm text-muted-foreground">Intervenciones registradas</p>
              </div>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="profesionales" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="profesionales" className="gap-2">
              <Users className="w-4 h-4" />
              Profesionales
            </TabsTrigger>
            <TabsTrigger value="intervenciones" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              Intervenciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profesionales">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Profesionales</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Lista de profesionales registrados en el sistema
                  </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Agregar Profesional
                </Button>
              </CardHeader>
              <CardContent>
                <ProfesionalesTable
                  profesionales={profesionales}
                  onDelete={handleDeleteProfesional}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="intervenciones">
            <Card>
              <CardHeader>
                <CardTitle>Intervenciones Recientes</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Registro de todas las intervenciones realizadas por los profesionales
                </p>
              </CardHeader>
              <CardContent>
                <IntervencionesTable
                  intervenciones={intervenciones}
                  getProfesionalName={getProfesionalName}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AddProfesionalDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleAddProfesional}
      />
    </div>
  );
}
