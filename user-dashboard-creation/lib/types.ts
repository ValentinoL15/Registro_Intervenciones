export type UserRole = "admin" | "profesional";

export type Turno = "mañana" | "tarde";

export type DiaSemana = "lunes" | "martes" | "miércoles" | "jueves" | "viernes";

export type TipoDestinatario = "familia" | "institución";

export type TipoIntervencion = "individual" | "equipo";

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: UserRole;
  cargaHoraria?: number;
  dias?: DiaSemana[];
  turno?: Turno;
  createdAt: Date;
}

export interface Intervencion {
  id: string;
  profesionalUserId: string;
  fecha: string;
  hora: string;
  destinatario: TipoDestinatario;
  nombreDestinatario: string;
  motivo: string;
  tipoIntervencion: TipoIntervencion;
  observaciones?: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
