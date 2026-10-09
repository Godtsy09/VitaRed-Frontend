import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.get<Doctor[]>(`/api/doctors${query ? `?${query}` : ''}`);
  }

  getDoctorById(id: number): Observable<Doctor> {
    return this.http.get<Doctor>(`/api/doctors/${id}`);
  }

  getSpecialties(): Observable<Specialty[]> {
    return this.http.get<Specialty[]>(`/api/doctors/specialties`);
  }

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`/api/doctors/locations`);
  }

  getMyProfile(): Observable<Doctor> {
    return this.http.get<Doctor>('/api/doctors/me');
  }

  updateMyProfile(payload: UpdateDoctorPayload): Observable<Doctor> {
    return this.http.put<Doctor>('/api/doctors/me', payload);
  }

  updateMyClinic(payload: UpdateClinicPayload): Observable<Doctor> {
    return this.http.put<Doctor>('/api/doctors/me/clinic', payload);
  }
}
