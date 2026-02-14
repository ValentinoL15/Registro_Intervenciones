export type UserRole = "ADMIN" | "PROFESIONAL";

export type Turno = "MAÑANA" | "TARDE";

export type DiaSemana = "LUNES" | "MARTES" | "MIÉRCOLES" | "JUEVES" | "VIERNES";

export type DestinyType = "FAMILIA" | "INSTITUCIÓN";

export type IntervencionType = "INDIVIDUAL" | "EQUIPO";

export interface User {
  userId: string;
  name?: string;
  lastname?: string;
  username: string;
  email?: string;
  role: UserRole;
  hourly?: number;
  days?: DiaSemana[];
  turno?: Turno;
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
  turno: Turno,
  days: DiaSemana[]
  role: UserRole

}

