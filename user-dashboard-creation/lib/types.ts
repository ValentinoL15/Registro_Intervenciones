export type UserRole = "ADMIN" | "PROFESIONAL";

export type Turno = "MAÑANA" | "TARDE";

export type DiaSemana = "LUNES" | "MARTES" | "MIÉRCOLES" | "JUEVES" | "VIERNES";

export type DestinyType = "FAMILIA" | "INSTITUCION";

export type IntervencionType = "INDIVIDUAL" | "EQUIPO";

export interface User {
  userId: string;
  name?: string;
  lastname?: string;
  username: string;
  email?: string;
  role: UserRole;
  hourly?: number;
  disponibilidades?: DisponibilidadDto[]
  active?: boolean;
  createdAt?: Date;
}

export interface AuthResponse {
  message: string
  access_token: string
  userId?: number
  username: string
  email?: string
  userRole: string
  name: string,
  lastname: string
}

export interface Intervencion {
  intervencionId: string;
  creador: User;
  fecha: string;
  hora: string;
  nombre: string;
  intervencion: IntervencionType;
  nombreDestinatario: string;
  motivo: string;
  tipoIntervencion: DestinyType;
  observaciones?: string;
  createdAt: Date;
}

export interface GeneralResponse {
  timestamp: string
  message: string
  status: number
}

export interface EmailDto {
  email: string,
  token:string,
  expiryDate: string,
  revoked: boolean,
  expired: boolean
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface createProfesionalDTO {
  name: string,
  lastname: string,
  username: string,
  email: string,
  hourly: string,
  disponibilidad: DisponibilidadDto[]
  role: UserRole
}

export interface EditProfesionalDTO {
  name: string,
  lastname: string,
  username: string,
  hourly: string,
  disponibilidad: DisponibilidadDto[]
}

export interface DisponibilidadDto {
  dia: DiaSemana,
  turno: Turno
}

export interface IntervencionDto {
  intervencionId: string,
  creadorId: string,
  tipo: DestinyType,
  nombre: string
  fecha: Date,
  hora: string,
  motivo: string,
  intervencion: IntervencionType
  observaciones: string,
  profesionalesIds: string[]
}

export interface CreateIntervencionDto {
  tipo: DestinyType,
  nombre: string
  fecha: string,
  hora: string,
  motivo: string,
  intervencion: IntervencionType
  observaciones: string,
  profesionalesIds: string[]
} 

export interface EditIntervencionDto {
  tipo: DestinyType,
  nombre: string
  fecha: string,
  hora: string,
  motivo: string,
  intervencion: IntervencionType
  observaciones: string,
  profesionalesIds: string[]
}

export interface SaveMantenimientoDto {
  fecha: string,
  description: string
}

export interface EditMantenimientoDto {
  fecha: string,
  description:string
}

export interface MantenimientoDto {
  mantenimientoId: string,
  fecha: string,
  description: string,
  empleadoId?: string
}

export interface EditUserDto {
  name: string,
  lastname:string,
  username: string
}

