"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { dataStore } from "@/lib/store";
import { type User, type DiaSemana, type Turno, type IntervencionDto, type createUserDTO, PostDto, MenuDiaDto, MantenimientoDto, GeneralResponse } from "@/lib/types";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProfesionalesTable } from "@/components/admin/profesionales-table";
import { IntervencionesTable } from "@/components/admin/intervenciones-table";
import { AddProfesionalDialog } from "@/components/admin/add-profesional-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ClipboardList, Plus, Loader2 } from "lucide-react";
import { AdminApi, CocineroApi, EmpleadoApi, NutricionistaApi, profesionalApi } from "@/service/api";
import { useToast } from "@/hooks/use-toast";
import { UsersTable } from "@/components/admin/users-table";
import { NutricionistasTable } from "@/components/admin/nutricionistas-table";
import { CocinerosTable } from "@/components/admin/cocineros-table";
import { MantenimientosTable } from "@/components/admin/mantenimientos-table";

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [profesionales, setProfesionales] = useState<User[]>([]);
  const [activeProfs, setActiveProfs] = useState<User[]>([])
  const [intervenciones, setIntervenciones] = useState<IntervencionDto[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("PROFESIONAL");
  const [nutricionistas, setNutricionistas] = useState<User[]>([]);
  const [cocineros, setCocineros] = useState<User[]>([]);
  const [empleados, setEmpleados] = useState<User[]>([]);

  // Estados para Actividad (Posteos/Tareas)
  const [posteosNutri, setPosteosNutri] = useState<PostDto[]>([]);
  const [menuesCocina, setMenuesCocina] = useState<MenuDiaDto[]>([]);
  const [mantenimientos, setMantenimientos] = useState<MantenimientoDto[]>([]);

  const [isDeletingUser, setIsDeletingUser] = useState(false); 

  const openModalWithRole = (role: string) => {
    setSelectedRole(role);
    setIsDialogOpen(true);
  };
  const router = useRouter();
  const { toast } = useToast();

  const loadProfesionales = async () => {
    try {
      const data = await profesionalApi.getProfesionales();
      setProfesionales([...data.content]);
      const activos = data.content.filter((prof: User) => prof.active === true);

      setActiveProfs(activos);
    } catch (err) {
      console.error(err);
    }
  };

  const loadNutricionistas = async () => {
    try {
      const data = await NutricionistaApi.getAllNutricionistas(); // Tu nuevo endpoint
      setNutricionistas([...data.content]);
    } catch (err) { console.error(err); }
  };

  const loadCocineros = async () => {
    try {
      const data = await CocineroApi.getAllCocineros();
      setCocineros([...data.content]);
    } catch (err) { console.error(err); }
  };

  const loadEmpleados = async () => {
    try {
      const data = await EmpleadoApi.getEmpleados();
      setEmpleados([...data.content]);
    } catch (err) { console.error(err); }
  };


  const loadIntervenciones = async () => {
    try {
      const data = await profesionalApi.getIntervenciones();
      setIntervenciones([...data.content])
    } catch (err: any) {
      console.error(err)
    }
  }

  const loadPosts = async () => {
    try {
      const data = await NutricionistaApi.getReportes();
      setPosteosNutri([...data.content])
    } catch (err: any) {
      console.error(err)
    }
  }

  const loadMenues = async () => {
    try {
      const data = await CocineroApi.getMenus();
      setMenuesCocina([...data.content])
    } catch (err: any) {
      console.error(err)
    }
  }

  const loadMantenimientos = async () => {
    try {
      const data = await EmpleadoApi.getAllMantenimientos();
      setMantenimientos([...data.content])
    } catch (err: any) {
      console.error(err)
    }
  }



  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/");
      } else if (user.role !== "ADMIN") {
        router.replace("/");
      } else {
        // Cargar profesionales cuando el usuario es admin
        loadProfesionales();
        loadNutricionistas();
        loadCocineros();
        loadIntervenciones();
      }
    }
  }, [user, isLoading, router]); // Removemos loadProfesionales de las dependencias

  const handleAddUser = async (data: createUserDTO) => {
    try {
      // 1. Enviamos a la base de datos a través de la API
      await AdminApi.createUser({
        ...data,
        role: selectedRole
      });

      // 2. Refrescamos la lista local para que aparezca el nuevo
      if (selectedRole === "PROFESIONAL") {
        await loadProfesionales();
      } else if (selectedRole === "NUTRICIONISTA") {
        await loadNutricionistas();
      } else if (selectedRole === "COCINERO") {
        await loadCocineros();
      } else if (selectedRole === "MANTENIMIENTO") { 
        await loadEmpleados();
      }

      // 3. Cerramos el modal
      setIsDialogOpen(false);

      toast({
        title: "¡Profesional agregado!",
        description: `${data.name} ${data.lastname} fue creado correctamente.`,
      });

    } catch (err: any) {

      throw err;
    }
  };


  const processDeletion = async (id: string, deleteFn: () => Promise<GeneralResponse>, refreshFn: () => Promise<void>, setLocalState: React.Dispatch<React.SetStateAction<User[]>>) => {
    try {
      setIsDeletingUser(true);
      await AdminApi.deleteUser(id);
      setLocalState(prev => prev.filter(u => u.userId !== id));
      await refreshFn();
      toast({
        title: "Eliminado",
        description: "El registro y sus recursos asociados han sido borrados.",
      });
    } catch (error: any) {
      console.error("Error al eliminar:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar el registro.",
      });
    } finally {
      setIsDeletingUser(false); // Desactiva el cargador
    }
  };

  const handleDeleteProfesional = (id: string) => 
    processDeletion(id, () => AdminApi.deleteUser(id), async () => { await loadProfesionales(); await loadIntervenciones(); }, setProfesionales);

  const handleDeleteNutricionista = (id: string) => 
    processDeletion(id, () => AdminApi.deleteUser(id), async () => { await loadNutricionistas(); await loadPosts(); }, setNutricionistas);

  const handleDeleteCocinero = (id: string) => 
    processDeletion(id, () => AdminApi.deleteUser(id), async () => { await loadCocineros(); await loadMenues(); }, setCocineros);

  const handleDeleteEmpleado = (id: string) => 
    processDeletion(id, () => AdminApi.deleteUser(id), async () => { await loadEmpleados(); await loadMantenimientos(); }, setEmpleados);


  const getProfesionalName = (profesionalId: string) => {
    const prof = profesionales.find((p) => p.userId === profesionalId);
    return prof ? `${prof.name} ${prof.lastname}` : "Desconocido";
  };

  const onToggleStatus = async (userId: string) => {
    try {
      // 1. Buscamos el rol real del usuario antes de cambiarlo
      // Buscamos en ambas listas para estar seguros
      const userToUpdate =
        profesionales.find(p => p.userId === userId) ||
        nutricionistas.find(n => n.userId === userId) ||
        cocineros.find(c => c.userId === userId);
      empleados.find(e => e.userId === userId);

      const userRole = userToUpdate?.role;

      // 2. Ejecutamos el cambio en la BD
      await AdminApi.altaBajaUser(userId);

      // 3. Refrescamos la lista correspondiente según el ROL REAL del usuario
      if (userRole === "PROFESIONAL") {
        await loadProfesionales();
      } else if (userRole === "NUTRICIONISTA") {
        await loadNutricionistas();
      } else if (userRole === "COCINERO") {
        await loadCocineros();
      }
      else if (userRole === "MANTENIMIENTO") {
        await loadEmpleados();

      } else {
        await loadProfesionales();
        await loadNutricionistas();
        await loadCocineros();
        await loadEmpleados();
      }

      toast({
        title: "Exitoso",
        description: "El estado del usuario ha sido modificado con éxito",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
      });
      console.error(err);
    }
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

        <Tabs
          defaultValue="profesionales"
          className="space-y-4"
          onValueChange={(value) => {
            // Disparamos la carga según la pestaña seleccionada
            if (value === "profesionales") loadProfesionales();
            if (value === "nutricionistas") {
              loadNutricionistas();
              loadPosts();
            }
            if (value === "cocineros") {
              loadCocineros();
              loadMenues();
            }
            if (value === "mantenimiento") {
              loadEmpleados();
              loadMantenimientos();
            }
          }}
        >
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="profesionales">Profesionales</TabsTrigger>
            <TabsTrigger value="nutricionistas">Nutrición</TabsTrigger>
            <TabsTrigger value="cocineros">Cocina</TabsTrigger>
            <TabsTrigger value="mantenimiento">Mant.</TabsTrigger>
          </TabsList>

          <TabsContent value="profesionales">
            <Card>
              {/* Contenedor principal para manejar las sub-pestañas */}
              <Tabs defaultValue="lista-profesionales" className="w-full">
                <CardHeader className="relative flex flex-row items-start justify-between pb-4">

                  {/* Lado Izquierdo: Título + Descripción + Tabs */}
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl">Gestión de Profesionales</CardTitle>
                    <CardDescription>
                      Administra el personal y supervisa sus intervenciones registradas.
                    </CardDescription>

                    {/* Sub-Tabs: Los mantenemos aquí abajo del texto */}
                    <TabsList className="bg-muted/50 mt-4 w-fit">
                      <TabsTrigger value="lista-profesionales" className="text-xs">Personal</TabsTrigger>
                      <TabsTrigger value="lista-intervenciones" className="text-xs">Intervenciones</TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Lado Derecho: El botón queda anclado arriba a la derecha */}
                  <div className="flex-shrink-0">
                    <TabsContent value="lista-profesionales" className="mt-0">
                      <Button
                        onClick={() => openModalWithRole("PROFESIONAL")}
                        className="gap-2 bg-teal-700 hover:bg-teal-800"
                      >
                        <Plus className="w-4 h-4" /> Agregar Profesional
                      </Button>
                    </TabsContent>
                  </div>

                </CardHeader>

                <CardContent>
                  <TabsContent value="lista-profesionales" className="mt-0 border-none p-0">
                    <ProfesionalesTable
                      profesionales={profesionales.filter(p => p.role === "PROFESIONAL")}
                      onDelete={handleDeleteProfesional}
                      altaBaja={onToggleStatus}
                    />
                  </TabsContent>

                  <TabsContent value="lista-intervenciones" className="mt-0 border-none p-0">
                    {/* Aquí reutilizas tu tabla de intervenciones original */}
                    <IntervencionesTable
                      intervenciones={intervenciones}
                      getProfesionalName={getProfesionalName}
                    />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </TabsContent>

          <TabsContent value="nutricionistas">
            <Card>
              <Tabs defaultValue="lista-personal" className="w-full">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  {/* Lado Izquierdo: Título, Descripción y TabsList */}
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl">Cuerpo de Nutrición</CardTitle>
                    <CardDescription>Gestión de personal y supervisión de menús.</CardDescription>
                    <TabsList className="bg-muted/50 mt-4 w-fit">
                      <TabsTrigger value="lista-personal" className="text-xs">Personal</TabsTrigger>
                      <TabsTrigger value="lista-posteos" className="text-xs">Posteos / Menús</TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Lado Derecho: El botón ahora se muestra condicionalmente según el Tab activo */}
                  <div className="flex items-center">
                    {/* Este div actúa como contenedor del botón para que el layout no salte */}
                    <TabsContent value="lista-personal" className="mt-0 border-none shadow-none p-0">
                      <Button
                        onClick={() => openModalWithRole("NUTRICIONISTA")}
                        className="gap-2 bg-green-700 hover:bg-green-800"
                      >
                        <Plus className="w-4 h-4" /> Agregar Nutricionista
                      </Button>
                    </TabsContent>

                    {/* Si quieres un botón diferente para Posteos, lo podrías poner en otro TabsContent aquí */}
                  </div>
                </CardHeader>

                <CardContent>
                  <TabsContent value="lista-personal" className="mt-0 border-none p-0">
                    <UsersTable
                      users={nutricionistas}
                      onDelete={handleDeleteNutricionista}
                      altaBaja={onToggleStatus}
                    />
                  </TabsContent>
                  <TabsContent value="lista-posteos" className="mt-0 border-none p-0">
                    <NutricionistasTable posteos={posteosNutri} />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </TabsContent>
          {/* TAB COCINEROS */}
          <TabsContent value="cocineros">
            <Card>
              <Tabs defaultValue="lista-personal" className="w-full">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl">Personal de Cocina</CardTitle>
                    <CardDescription>Gestión de cocineros y supervisión del menú diario.</CardDescription>
                    <TabsList className="bg-muted/50 mt-4 w-fit">
                      <TabsTrigger value="lista-personal" className="text-xs">Personal</TabsTrigger>
                      <TabsTrigger value="lista-posteos" className="text-xs">Menús Publicados</TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Botón de agregar condicional */}
                  <div className="flex items-center">
                    <TabsContent value="lista-personal" className="mt-0 p-0 border-none shadow-none">
                      <Button
                        onClick={() => openModalWithRole("COCINERO")}
                        className="gap-2 bg-orange-600 hover:bg-orange-700"
                      >
                        <Plus className="w-4 h-4" /> Agregar Cocinero
                      </Button>
                    </TabsContent>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Pestaña 1: Personal */}
                  <TabsContent value="lista-personal" className="mt-0 border-none p-0">
                    <UsersTable
                      users={cocineros}
                      onDelete={handleDeleteCocinero} // Asegúrate de tener esta función
                      altaBaja={onToggleStatus}
                    />
                  </TabsContent>

                  {/* Pestaña 2: Menús */}
                  <TabsContent value="lista-posteos" className="mt-0 border-none p-0">
                    <CocinerosTable menus={menuesCocina} />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </TabsContent>

          {/* TAB MANTENIMIENTO */}
          <TabsContent value="mantenimiento">
            <Card>
              <Tabs defaultValue="lista-personal" className="w-full">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  {/* Lado Izquierdo: Título, Descripción y Tabs de navegación interna */}
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl">Mantenimiento y Servicios</CardTitle>
                    <CardDescription>Gestión de personal técnico y supervisión de tareas.</CardDescription>
                    <TabsList className="bg-muted/50 mt-4 w-fit">
                      <TabsTrigger value="lista-personal" className="text-xs">Personal</TabsTrigger>
                      <TabsTrigger value="lista-tareas" className="text-xs">Tareas Realizadas</TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Lado Derecho: Botón de agregar (Solo visible en la pestaña de Personal) */}
                  <div className="flex items-center">
                    <TabsContent value="lista-personal" className="mt-0 p-0 border-none shadow-none">
                      <Button
                        onClick={() => openModalWithRole("MANTENIMIENTO")}
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4" /> Agregar Personal
                      </Button>
                    </TabsContent>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Contenido Pestaña 1: Lista de Usuarios */}
                  <TabsContent value="lista-personal" className="mt-0 border-none p-0">
                    <UsersTable
                      users={empleados}
                      onDelete={handleDeleteEmpleado}
                      altaBaja={onToggleStatus}
                    />
                  </TabsContent>

                  {/* Contenido Pestaña 2: Historial de Tareas / Mantenimientos */}
                  <TabsContent value="lista-tareas" className="mt-0 border-none p-0">
                    <MantenimientosTable tareas={mantenimientos} />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AddProfesionalDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleAddUser}
        role={selectedRole}
      />
      {isDeletingUser && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-card shadow-2xl border animate-in fade-in zoom-in duration-200">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-bold text-lg text-foreground">Eliminando usuario...</p>
              <p className="text-sm text-muted-foreground">Borrando registros y archivos de la nube</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
