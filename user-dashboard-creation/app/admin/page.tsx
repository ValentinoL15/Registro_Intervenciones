"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { dataStore } from "@/lib/store";
import { type User, type DiaSemana, type Turno, type IntervencionDto, type createUserDTO, PostDto, MenuDiaDto, MantenimientoDto, GeneralResponse, DescriptionDto } from "@/lib/types";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProfesionalesTable } from "@/components/admin/profesionales-table";
import { IntervencionesTable } from "@/components/admin/intervenciones-table";
import { AddProfesionalDialog } from "@/components/admin/add-profesional-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ClipboardList, Plus, Loader2 } from "lucide-react";
import { AdminApi, CocineroApi, EmpleadoApi, NutricionistaApi, profesionalApi, TecnicoApi } from "@/service/api";
import { useToast } from "@/hooks/use-toast";
import { UsersTable } from "@/components/admin/users-table";
import { NutricionistasTable } from "@/components/admin/nutricionistas-table";
import { CocinerosTable } from "@/components/admin/cocineros-table";
import { MantenimientosTable } from "@/components/admin/mantenimientos-table";
import { useLoader } from "@/lib/spinnerService";
import { hi } from "date-fns/locale";
import { TecnicoDescriptionTable } from "@/components/admin/tecnico-description-table";
import { EditProfesionalDialog } from "@/components/admin/edit-profesionales-dialog";
import { EditNutricionistaDialog } from "@/components/admin/edit-nutricionista-dialog";
import { EditSimpleUserDialog } from "@/components/admin/edit-simple-user-dialog";
import { EditTecnicoDialog } from "@/components/admin/edit-tecnico-dialog";



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
  const [tecnicos, setTecnicos] = useState<User[]>([]);
  const [descripcionesTecnicos, setDescripcionesTecnicos] = useState({
    content: [],
    totalPages: 0,
    number: 0,
    totalElements: 0
  });
  const [totales, setTotales] = useState({
  profesionales: 0,
  nutricionistas: 0,
  cocineros: 0,
  mantenimiento: 0,
  tecnicos: 0,
  intervenciones: 0,
  actividadTotal: 0
});

const [counts, setCounts] = useState({
  staff: 0,
  actividad: 0
});

  const [descripcionesNutri, setDescripcionesNutri] = useState({
    content: [],
    totalPages: 0,
    number: 0,
    totalElements: 0
  });
  const [filtroDesde, setFiltroDesde] = useState<string>("");
  const [filtroHasta, setFiltroHasta] = useState<string>("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
  const { showLoader, hideLoader } = useLoader();
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const loadStatistics = useCallback(async () => {
  try {
    const [profs, nutris, cocis, emples, tecs, ints, nTec, nNut, mant, mens] = await Promise.all([
      profesionalApi.getProfesionales(),
      NutricionistaApi.getAllNutricionistas(),
      CocineroApi.getAllCocineros(),
      EmpleadoApi.getEmpleados(),
      TecnicoApi.getTecnicos(),
      profesionalApi.getIntervenciones(),
      TecnicoApi.getDescriptions("", "", 0, 1),
      NutricionistaApi.getDescriptions("", "", 0, 1),
      EmpleadoApi.getAllMantenimientos(),
      CocineroApi.getMenus()
    ]);

    // Función auxiliar para contar elementos sin importar si es Array o PaginatedDTO
    const getCount = (data: any) => {
      if (Array.isArray(data)) return data.length;
      if (data && typeof data.totalElements === 'number') return data.totalElements;
      if (data && Array.isArray(data.content)) return data.content.length;
      return 0;
    };

    const totalStaff = 
      getCount(profs) + 
      getCount(nutris) + 
      getCount(cocis) + 
      getCount(emples) + 
      getCount(tecs);

    const totalActividad = 
      getCount(ints) + 
      getCount(nTec) + 
      getCount(nNut) + 
      getCount(mant) + 
      getCount(mens);

    setCounts({
      staff: totalStaff,
      actividad: totalActividad
    });
  } catch (err) {
    console.error("Error al cargar estadísticas:", err);
  }
}, []);

/*const refreshGlobalCounts = useCallback(async () => {
  try {
    const [profs, nutris, cocis, emples, tecs, ints, nTec, nNut, mant, mens] = await Promise.all([
      profesionalApi.getProfesionales(),
      NutricionistaApi.getAllNutricionistas(),
      CocineroApi.getAllCocineros(),
      EmpleadoApi.getEmpleados(),
      TecnicoApi.getTecnicos(), // Este suele ser lista completa
      profesionalApi.getIntervenciones(),
      TecnicoApi.getDescriptions("", "", 0, 1),
      NutricionistaApi.getDescriptions("", "", 0, 1),
      EmpleadoApi.getAllMantenimientos(),
      CocineroApi.getMenus()
    ]);

    setCounts({
      staff: (profs.totalElements || 0) + (nutris.totalElements || 0) + 
             (cocis.totalElements || 0) + (emples.totalElements || 0) + 
             (Array.isArray(tecs) ? tecs.length : 0),
      intervenciones: ints.totalElements || 0,
      notasTecnicos: nTec.totalElements || 0,
      notasNutri: nNut.totalElements || 0,
      mantenimientos: mant.totalElements || 0,
      menues: mens.totalElements || 0
    });
  } catch (err) {
    console.error("Error al sincronizar contadores:", err);
  }
}, []);*/

  const handleEditClick = (user: User) => {
    setIsEditModalOpen(false);
    setEditingUser(null);

    // Lógica de detección de rol mejorada
    let detectedRole = user.role?.toUpperCase();

    if (!detectedRole) {
      // Si no hay rol, intentamos deducirlo por sus propiedades
      if (user.horarioAsistencias) {
        detectedRole = "NUTRICIONISTA";
      } else if (cocineros.some(c => c.userId === user.userId)) {
        detectedRole = "COCINERO";
      } else if (empleados.some(e => e.userId === user.userId)) {
        detectedRole = "MANTENIMIENTO";
      } else {
        detectedRole = "PROFESIONAL";
      }
    }

    const userWithRole = {
      ...user,
      role: detectedRole
    };

    setTimeout(() => {
      console.log("Editando usuario con rol:", detectedRole);
      setEditingUser(userWithRole);
      setIsEditModalOpen(true);
    }, 50);
  };

  const handleUpdateSimpleUser = async (data: any) => {
    if (!editingUser) return;
    try {
      showLoader("Actualizando perfil...");

      if (editingUser.role === "COCINERO") {
        await AdminApi.editCocinero(editingUser.userId, data);
        await loadCocineros();
      } else if (editingUser.role === "MANTENIMIENTO") {
        await AdminApi.editEmpleado(editingUser.userId, data); // <--- Endpoint de mantenimiento
        await loadEmpleados();
      }

      setIsEditModalOpen(false);
      setEditingUser(null);
      toast({ title: "Éxito", description: "El perfil ha sido actualizado correctamente." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      hideLoader();
    }
  };


  const handleUpdateProfesional = async (data: any) => {
    if (!editingUser) return;

    try {
      showLoader("Actualizando profesional...");
      await AdminApi.editProfesional(editingUser.userId, data);

      toast({
        title: "Éxito",
        description: "El profesional ha sido actualizado correctamente.",
      });

      await loadProfesionales(); // Refrescar la tabla
      setIsEditModalOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar.",
      });
    } finally {
      hideLoader();
    }
  };

  const handleUpdateNutricionista = async (data: any) => {
    if (!editingUser) return;
    try {
      showLoader("Actualizando...");
      await AdminApi.editNutricionista(editingUser.userId, data);

      // Cerramos y limpiamos TODO el estado de edición
      setIsEditModalOpen(false);
      setEditingUser(null);

      toast({ title: "Éxito", description: "Cambios guardados." });
      await loadNutricionistas();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      hideLoader();
    }
  };

  const handleUpdateTecnico = async (data: any) => {
    if (!editingUser) return;
    try {
      showLoader("Actualizando técnico...");
      await AdminApi.editTecnico(editingUser.userId, data);

      setIsEditModalOpen(false);
      setEditingUser(null);

      toast({ title: "Éxito", description: "Cronograma técnico actualizado." });
      await loadTecnicos();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      hideLoader();
    }
  };

  const loadProfesionales = async () => {
    try {
      const data = await profesionalApi.getProfesionales();
      setProfesionales(data);
      const activos = data.filter((prof: User) => prof.active === true);

      setActiveProfs(activos);
    } catch (err) {
      console.error(err);
    }
  };

  const loadNutricionistas = async () => {
    try {
      const data = await NutricionistaApi.getAllNutricionistas(); // Tu nuevo endpoint
      setNutricionistas(data);
    } catch (err) { console.error(err); }

  };

  const loadCocineros = async () => {
    try {
      const data = await CocineroApi.getAllCocineros();
      setCocineros(data);
    } catch (err) { console.error(err); }

  };

  const loadEmpleados = async () => {
    try {
      const data = await EmpleadoApi.getEmpleados();
      setEmpleados(data);
    } catch (err) { console.error(err); }

  };

  const loadTecnicos = async () => {
    try {
      const data = await TecnicoApi.getTecnicos();
      console.log("DATITAAA", data)
      setTecnicos([...data]);
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

  const loadTecnicoDescriptions = useCallback(async (page = 0) => {
    try {
      const data = await TecnicoApi.getDescriptions(filtroDesde, filtroHasta, page, 8);
      setDescripcionesTecnicos(data);
    } catch (err) {
      console.error("Error al cargar notas técnicas:", err);
    }
  }, [filtroDesde, filtroHasta]);

const loadNutriDescriptions = useCallback(async (page = 0) => {
  try {
    const data = await NutricionistaApi.getDescriptions(filtroDesde, filtroHasta, page, 8);
    setDescripcionesNutri(data);
  } catch (err) {
    console.error("Error al cargar notas de nutrición:", err);
  }
}, [filtroDesde, filtroHasta]); 

useEffect(() => {
  loadNutriDescriptions(0); 
}, [filtroDesde, filtroHasta, loadNutriDescriptions]);

// Efecto específico para filtrar la Bitácora de Técnicos
useEffect(() => {
  loadTecnicoDescriptions(0); // Reinicia a la página 0 al filtrar
}, [filtroDesde, filtroHasta, loadTecnicoDescriptions]);


 useEffect(() => {
  if (!isLoading && user?.role === "ADMIN") {
    const initDashboard = async () => {
      showLoader("Sincronizando panel de control...");
      try {
        // Cargamos estadísticas primero para que los números aparezcan de entrada
        await loadStatistics();
        // Cargamos la primera pestaña por defecto
        await loadProfesionales();
      } catch (error) {
        toast({ variant: "destructive", title: "Error de conexión" });
      } finally {
        hideLoader();
      }
    };
    initDashboard();
  }
}, [user, isLoading, loadStatistics]);

  const handleAddUser = async (data: createUserDTO) => {
    try {

      showLoader("Creando nuevo usuario...");
      //await new Promise(resolve => setTimeout(resolve, 5000));
      await AdminApi.createUser({
        ...data,
        role: selectedRole
      });


      const refreshMap: Record<string, () => Promise<void>> = {
        "PROFESIONAL": loadProfesionales,
        "NUTRICIONISTA": loadNutricionistas,
        "COCINERO": loadCocineros,
        "MANTENIMIENTO": loadEmpleados,
        "TECNICO": loadTecnicos
      };

      if (refreshMap[selectedRole]) {
        await refreshMap[selectedRole]();
      }
      await loadStatistics();

      setIsDialogOpen(false);

      toast({
        title: "¡Profesional agregado!",
        description: `${data.name} ${data.lastname} fue creado correctamente.`,
      });

    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error al crear",
        description: err.message || "No se pudo crear el usuario.",
      });
      throw err;
    } finally {
      hideLoader();
    }
  };


  const processDeletion = async (id: string, deleteFn: () => Promise<GeneralResponse>, refreshFn: () => Promise<void>, setLocalState: React.Dispatch<React.SetStateAction<User[]>>) => {
    try {
      showLoader("Eliminando usuario...")
      await AdminApi.deleteUser(id);
      setLocalState(prev => prev.filter(u => u.userId !== id));
      await loadStatistics();
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
      hideLoader();
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

  const handleDeleteTecnico = (id: string) =>
    processDeletion(id, () => AdminApi.deleteUser(id), async () => {
      await loadTecnicos();
      await loadTecnicoDescriptions();
    }, setTecnicos);


  const getProfesionalName = (userId: string) => {
    // Buscamos en todas las listas de usuarios
    const allUsers = [
      ...profesionales,
      ...tecnicos,
      ...nutricionistas,
      ...cocineros,
      ...empleados
    ];

    const foundUser = allUsers.find((u) => u.userId === userId);

    return foundUser
      ? `${foundUser.name} ${foundUser.lastname}`
      : "Usuario no encontrado";
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

      showLoader("Actualizando conidición de usuario...")

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

      }
      else if (userRole === "TECNICO") {
        await loadTecnicos()
      }
      else {
        await loadProfesionales();
        await loadNutricionistas();
        await loadCocineros();
        await loadEmpleados();
        await loadTecnicos();
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
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="min-h-screen bg-background">

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
                <CardTitle className="text-2xl">{counts.staff}</CardTitle>
                <p className="text-sm text-muted-foreground">Personal total activo</p>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10">
                <ClipboardList className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-2xl">{counts.actividad}</CardTitle>
                <p className="text-sm text-muted-foreground">Registros de Actividad Total</p>
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
              loadNutriDescriptions()
            }
            if (value === "cocineros") {
              loadCocineros();
              loadMenues();
            }
            if (value === "mantenimiento") {
              loadEmpleados();
              loadMantenimientos();
            }
            if (value === "tecnico") { loadTecnicos(); loadTecnicoDescriptions(); }
          }}
        >
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="profesionales">Profesionales</TabsTrigger>
            <TabsTrigger value="tecnico">Técnicos</TabsTrigger>
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
                      onEdit={handleEditClick} // <--- Pasamos la función
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
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl">Cuerpo de Nutrición</CardTitle>
                    <CardDescription>Gestión de personal, menús y bitácora de seguimiento.</CardDescription>

                    <TabsList className="bg-muted/50 mt-4 w-fit">
                      <TabsTrigger value="lista-personal" className="text-xs">Personal</TabsTrigger>
                      <TabsTrigger value="lista-posteos" className="text-xs">Posteos / Menús</TabsTrigger>
                      <TabsTrigger value="lista-descripciones" className="text-xs">Bitácora / Notas</TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex items-center">
                    <TabsContent value="lista-personal" className="mt-0 border-none shadow-none p-0">
                      <Button
                        onClick={() => openModalWithRole("NUTRICIONISTA")}
                        className="gap-2 bg-green-700 hover:bg-green-800"
                      >
                        <Plus className="w-4 h-4" /> Agregar Nutricionista
                      </Button>
                    </TabsContent>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Pestaña 1: Personal */}
                  <TabsContent value="lista-personal" className="mt-0 border-none p-0">
                    <UsersTable
                      users={nutricionistas}
                      onDelete={handleDeleteNutricionista}
                      altaBaja={onToggleStatus}
                      onEdit={handleEditClick}
                    />
                  </TabsContent>

                  {/* Pestaña 2: Menús Semanales */}
                  <TabsContent value="lista-posteos" className="mt-0 border-none p-0">
                    <NutricionistasTable posteos={posteosNutri} />
                  </TabsContent>

                  {/* Pestaña 3: Bitácora de Nutrición */}
                  <TabsContent value="lista-descripciones" className="mt-0 border-none p-0">
                    <TecnicoDescriptionTable
                      // Usamos el estado específico que ya cargamos con loadNutriDescriptions
                      data={descripcionesNutri}
                      getProfesionalName={getProfesionalName}
                      onPageChange={(newPage) => loadNutriDescriptions(newPage)}
                      filtroDesde={filtroDesde}
                      filtroHasta={filtroHasta}
                      setFiltroDesde={setFiltroDesde}
                      setFiltroHasta={setFiltroHasta}
                    />
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
                      onEdit={handleEditClick}
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
                      onEdit={handleEditClick}
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

          {/* TAB TECNICO */}
          <TabsContent value="tecnico">
            <Card>
              <Tabs defaultValue="lista-personal" className="w-full">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  {/* Lado Izquierdo */}
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl">Cuerpo Técnico</CardTitle>
                    <CardDescription>Gestión de técnicos y supervisión de sus descripciones publicadas.</CardDescription>
                    <TabsList className="bg-muted/50 mt-4 w-fit">
                      <TabsTrigger value="lista-personal" className="text-xs">Personal</TabsTrigger>
                      <TabsTrigger value="lista-posteos" className="text-xs">Descripciones / Posteos</TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Lado Derecho: Botón Agregar */}
                  <div className="flex items-center">
                    <TabsContent value="lista-personal" className="mt-0 p-0 border-none shadow-none">
                      <Button
                        onClick={() => openModalWithRole("TECNICO")}
                        className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Plus className="w-4 h-4" /> Agregar Técnico
                      </Button>
                    </TabsContent>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Sub-Pestaña 1: Tabla de Usuarios */}
                  <TabsContent value="lista-personal" className="mt-0 border-none p-0">
                    <UsersTable
                      users={tecnicos}
                      onDelete={handleDeleteTecnico}
                      altaBaja={onToggleStatus}
                      onEdit={handleEditClick}
                    />
                  </TabsContent>

                  {/* Sub-Pestaña 2: Tabla de Posteos (Necesitarás crear este componente o reutilizar uno) */}
                  <TabsContent value="lista-posteos" className="mt-0 border-none p-0">
                    {/* Aquí puedes crear un componente <TecnicosDescTable /> similar a IntervencionesTable */}
                    <TecnicoDescriptionTable
                      data={descripcionesTecnicos}
                      getProfesionalName={getProfesionalName}
                      onPageChange={(newPage) => loadTecnicoDescriptions(newPage)} // Maneja el cambio de página
                      filtroDesde={filtroDesde}
                      filtroHasta={filtroHasta}
                      setFiltroDesde={setFiltroDesde}
                      setFiltroHasta={setFiltroHasta}
                    />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* --- SECCIÓN DE MODALES DE EDICIÓN --- */}
      {isEditModalOpen && editingUser && editingUser.role && (
        <>
          {editingUser.role.toUpperCase() === "NUTRICIONISTA" && (
            <EditNutricionistaDialog
              open={isEditModalOpen}
              onOpenChange={setIsEditModalOpen}
              user={editingUser}
              onConfirm={handleUpdateNutricionista}
            />
          )}

          {isEditModalOpen && (editingUser?.role === "COCINERO" || editingUser?.role === "MANTENIMIENTO") && (
            <EditSimpleUserDialog
              open={isEditModalOpen}
              onOpenChange={setIsEditModalOpen}
              user={editingUser}
              onConfirm={handleUpdateSimpleUser}
            />
          )}

          {isEditModalOpen && editingUser?.role?.toUpperCase() === "TECNICO" && (
            <EditTecnicoDialog
              open={isEditModalOpen}
              onOpenChange={setIsEditModalOpen}
              user={editingUser}
              onConfirm={handleUpdateTecnico}
            />
          )}

          {editingUser.role.toUpperCase() === "PROFESIONAL" && (
            <EditProfesionalDialog
              open={isEditModalOpen}
              onOpenChange={setIsEditModalOpen}
              user={editingUser}
              onConfirm={handleUpdateProfesional}
            />
          )}
        </>
      )}
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
