import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  Doctor,
  Location,
  Specialty,
  UpdateDoctorPayload,
  UpdateClinicPayload,
} from '../models';

interface DoctorFilters {
  locationId?: number;
  specialtyId?: number;
}

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private readonly http = inject(HttpClient);

  getDoctors(filters?: DoctorFilters): Observable<Doctor[]> {
    const params = new URLSearchParams();
    if (filters?.locationId) params.set('locationId', String(filters.locationId));
    if (filters?.specialtyId) params.set('specialtyId', String(filters.specialtyId));
    const query = params.toString();
    return this.http
      .get<Doctor[]>(`/api/doctors${query ? `?${query}` : ''}`)
      .pipe(map((doctors) => doctors.map((doctor) => this.normalizeDoctor(doctor))));
  }

  getDoctorById(id: number): Observable<Doctor> {
    return this.http
      .get<Doctor>(`/api/doctors/${id}`)
      .pipe(map((doctor) => this.normalizeDoctor(doctor)));
  }

  getSpecialties(): Observable<Specialty[]> {
    return this.http.get<Specialty[]>(`/api/doctors/specialties`);
  }

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`/api/doctors/locations`);
  }

  getMyProfile(): Observable<Doctor> {
    return this.http
      .get<Doctor>('/api/doctors/me')
      .pipe(map((doctor) => this.normalizeDoctor(doctor)));
  }

  updateMyProfile(payload: UpdateDoctorPayload): Observable<Doctor> {
    return this.http
      .put<Doctor>('/api/doctors/me', payload)
      .pipe(map((doctor) => this.normalizeDoctor(doctor)));
  }

  updateMyClinic(payload: UpdateClinicPayload): Observable<Doctor> {
    return this.http
      .put<Doctor>('/api/doctors/me/clinic', payload)
      .pipe(map((doctor) => this.normalizeDoctor(doctor)));
  }

  private normalizeDoctor(doctor: Doctor): Doctor {
    const tarifa = doctor.tarifa_consulta as unknown;
    return {
      ...doctor,
      tarifa_consulta: tarifa === null || tarifa === undefined ? null : Number(tarifa),
    };
  }
}
