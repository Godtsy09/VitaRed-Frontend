import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Appointment,
  CreateAppointmentPayload,
  UpdateAppointmentStatusPayload,
} from '../models';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly http = inject(HttpClient);

  createAppointment(payload: CreateAppointmentPayload): Observable<{ id_cita: number; message: string }> {
    return this.http.post<{ id_cita: number; message: string }>('/api/appointments', payload);
  }

  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>('/api/appointments/my');
  }

  getDoctorAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>('/api/appointments/doctor');
  }

  updateAppointmentStatus(id: number, payload: UpdateAppointmentStatusPayload): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`/api/appointments/${id}/status`, payload);
  }
}
