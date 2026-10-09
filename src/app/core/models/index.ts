export type UserRole = 'user' | 'doctor';

export interface PublicUser {
  id_usuario: number;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  email: string;
  activo: boolean;
}

export interface LoginResult {
  token: string;
  user: PublicUser & {
    role: UserRole;
    doctorId?: number;
  };
}

export interface RegisterUserPayload {
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  email: string;
  password: string;
}

export interface RegisterDoctorPayload extends RegisterUserPayload {
  clinicNombre: string;
  clinicLocationId: number;
  clinicZona: number;
  clinicDireccion: string;
  clinicTelefono: string;
  clinicWhatsapp: string;
  id_especialidad: number;
  numero_colegiado: string;
  tarifa_consulta: number;
}

export interface Location {
  id: number;
  city: string;
  department: string;
}

export interface Specialty {
  id_especialidad: number;
  especialidad: string;
}

export interface Clinic {
  id_clinica: number;
  nombre: string;
  id_location: number;
  zona: number;
  direccion: string;
  telefono: string | null;
  whatsapp: string;
  activo: boolean;
  city?: string;
  department?: string;
}

export interface DoctorSchedule {
  id_horario: number;
  id_doctor: number;
  dia: 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';
  hora_inicio: string;
  hora_fin: string;
}

export interface Doctor {
  id_doctor: number;
  id_usuario: number;
  id_clinica: number;
  id_especialidad: number;
  numero_colegiado: string | null;
  tarifa_consulta: number | null;
  activo: boolean;
  usuario?: PublicUser;
  clinica?: Clinic;
  especialidad?: Specialty;
  horarios?: DoctorSchedule[];
}

export interface Appointment {
  id_cita: number;
  id_doctor: number;
  id_paciente: number;
  fecha_hora_inicio: string;
  motivo: string | null;
  estado: 'PROGRAMADA' | 'CANCELADA' | 'ATENDIDA';
  doctor?: Doctor;
  paciente?: PublicUser;
}

export interface CreateAppointmentPayload {
  id_doctor: number;
  fecha_hora_inicio: string;
  motivo?: string;
}

export interface UpdateAppointmentStatusPayload {
  estado: 'CANCELADA' | 'ATENDIDA';
}

export interface UpdateDoctorPayload {
  id_especialidad?: number;
  numero_colegiado?: string | null;
  tarifa_consulta?: number | null;
}

export interface UpdateClinicPayload {
  clinicNombre?: string;
  clinicLocationId?: number;
  clinicZona?: number;
  clinicDireccion?: string;
  clinicTelefono?: string | null;
  clinicWhatsapp?: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}
