"use client";

import type { User, Intervencion, DiaSemana } from "./types";

// Datos de demostración
const mockUsers: User[] = [
  {
    id: "admin-1",
    email: "admin@institucion.com",
    nombre: "María",
    apellido: "González",
    role: "admin",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "prof-1",
    email: "juan.perez@institucion.com",
    nombre: "Juan",
    apellido: "Pérez",
    role: "profesional",
    cargaHoraria: 40,
    dias: ["lunes", "martes", "miércoles", "jueves", "viernes"] as DiaSemana[],
    turno: "mañana",
    createdAt: new Date("2024-02-15"),
  },
  {
    id: "prof-2",
    email: "ana.martinez@institucion.com",
    nombre: "Ana",
    apellido: "Martínez",
    role: "profesional",
    cargaHoraria: 20,
    dias: ["lunes", "miércoles", "viernes"] as DiaSemana[],
    turno: "tarde",
    createdAt: new Date("2024-03-10"),
  },
];

const mockIntervenciones: Intervencion[] = [
  {
    id: "int-1",
    profesionalUserId: "prof-1",
    fecha: "2025-02-01",
    hora: "09:00",
    destinatario: "familia",
    nombreDestinatario: "Familia Rodríguez",
    motivo: "Seguimiento del plan de intervención mensual",
    tipoIntervencion: "individual",
    observaciones: "Buena evolución del paciente",
    createdAt: new Date("2025-02-01"),
  },
  {
    id: "int-2",
    profesionalUserId: "prof-1",
    fecha: "2025-02-02",
    hora: "10:30",
    destinatario: "institución",
    nombreDestinatario: "Escuela San Martín",
    motivo: "Coordinación de actividades inclusivas",
    tipoIntervencion: "equipo",
    createdAt: new Date("2025-02-02"),
  },
  {
    id: "int-3",
    profesionalUserId: "prof-2",
    fecha: "2025-02-03",
    hora: "14:00",
    destinatario: "familia",
    nombreDestinatario: "Familia López",
    motivo: "Primera evaluación diagnóstica",
    tipoIntervencion: "individual",
    observaciones: "Se requiere seguimiento semanal",
    createdAt: new Date("2025-02-03"),
  },
  {
    id: "int-4",
    profesionalUserId: "prof-2",
    fecha: "2025-02-04",
    hora: "15:30",
    destinatario: "institución",
    nombreDestinatario: "Centro de Día Esperanza",
    motivo: "Reunión de equipo interdisciplinario",
    tipoIntervencion: "equipo",
    createdAt: new Date("2025-02-04"),
  },
];

// Store simple en memoria
class DataStore {
  private users: User[] = [...mockUsers];
  private intervenciones: Intervencion[] = [...mockIntervenciones];
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // Auth
  login(email: string, password: string): User | null {
    // Demo: cualquier contraseña funciona
    const user = this.users.find((u) => u.email === email);
    return user || null;
  }

  // Users
  getUsers(): User[] {
    return [...this.users];
  }

  getProfesionales(): User[] {
    return this.users.filter((u) => u.role === "profesional");
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  addUser(user: Omit<User, "id" | "createdAt">): User {
    const newUser: User = {
      ...user,
      id: `prof-${Date.now()}`,
      createdAt: new Date(),
    };
    this.users.push(newUser);
    this.notify();
    return newUser;
  }

  updateUser(id: string, data: Partial<User>): User | null {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...data };
    this.notify();
    return this.users[index];
  }

  deleteUser(id: string): boolean {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    this.notify();
    return true;
  }

  // Intervenciones
  getIntervenciones(): Intervencion[] {
    return [...this.intervenciones].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }

  getIntervencionesByProfesional(profesionalId: string): Intervencion[] {
    return this.intervenciones
      .filter((i) => i.profesionalUserId === profesionalId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  addIntervencion(
    intervencion: Omit<Intervencion, "id" | "createdAt">
  ): Intervencion {
    const newIntervencion: Intervencion = {
      ...intervencion,
      id: `int-${Date.now()}`,
      createdAt: new Date(),
    };
    this.intervenciones.push(newIntervencion);
    this.notify();
    return newIntervencion;
  }
}

export const dataStore = new DataStore();
