import { Component, inject, OnInit, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderUser } from '@components/headers/header-user/header-user';
import { DoctorService } from '@core/services/doctor.service';
import { AppointmentService } from '@core/services/appointment.service';
import { Doctor, Specialty, Location } from '@core/models';
import { ToastService } from '@core/services/toast.service';

@Component({
  imports: [HeaderUser, FormsModule],
  selector: 'app-available-doctors',
  styleUrl: './available-doctors.scss',
  templateUrl: './available-doctors.html',
})
export class AvailableDoctors implements OnInit {
  private readonly doctorService = inject(DoctorService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);

  // UI State
  protected isModalOpen = signal<boolean>(false);
  protected selectedDoctor = signal<Doctor | null>(null);
  protected loading = signal(false);
  protected error = signal<string | null>(null);
  protected searchTerm = signal('');

  // Filters
  protected selectedLocationId = signal<number | null>(null);
  protected selectedSpecialtyId = signal<number | null>(null);

  // Catalogs
  protected specialties = signal<Specialty[]>([]);
  protected locations = signal<Location[]>([]);
  protected loadingCatalogs = signal(false);

  // Data
  protected doctors = signal<Doctor[]>([]);
  protected loadingDoctors = signal(false);

  // Computed
  protected filteredDoctors = computed(() => {
    let result = this.doctors();
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      result = result.filter(
        (d) =>
          d.usuario?.nombre?.toLowerCase().includes(term) ||
          d.usuario?.apellido?.toLowerCase().includes(term) ||
          d.especialidad?.especialidad?.toLowerCase().includes(term) ||
          d.clinica?.nombre?.toLowerCase().includes(term) ||
          d.clinica?.city?.toLowerCase().includes(term) ||
          d.clinica?.department?.toLowerCase().includes(term)
      );
    }
    return result;
  });

  protected hasActiveFilter = computed(() => this.selectedLocationId() || this.selectedSpecialtyId());

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadCatalogs();
    this.loadDoctors();
  }

  private loadCatalogs(): void {
    this.loadingCatalogs.set(true);
    this.doctorService.getSpecialties().subscribe({
      next: (data: Specialty[]) => this.specialties.set(data),
      error: () => console.error('Error loading specialties'),
      complete: () => this.loadingCatalogs.set(false),
    });
    this.doctorService.getLocations().subscribe({
      next: (data: Location[]) => this.locations.set(data),
      error: () => console.error('Error loading locations'),
      complete: () => this.loadingCatalogs.set(false),
    });
  }

  protected loadDoctors(): void {
    this.loadingDoctors.set(true);
    this.error.set(null);
    const filters: { locationId?: number; specialtyId?: number } = {};
    if (this.selectedLocationId()) filters.locationId = this.selectedLocationId()!;
    if (this.selectedSpecialtyId()) filters.specialtyId = this.selectedSpecialtyId()!;

    this.doctorService.getDoctors(filters).subscribe({
      next: (data: Doctor[]) => {
        this.doctors.set(data);
        this.loadingDoctors.set(false);
      },
      error: (err) => {
        this.loadingDoctors.set(false);
        this.error.set(err?.error?.error ?? 'Error al cargar doctores');
        this.toastr.error('No se pudieron cargar los médicos');
      },
    });
  }

  protected onLocationChange(): void {
    this.selectedSpecialtyId.set(null);
    this.loadDoctors();
  }

  protected onSpecialtyChange(): void {
    this.selectedLocationId.set(null);
    this.loadDoctors();
  }

  protected clearFilters(): void {
    this.selectedLocationId.set(null);
    this.selectedSpecialtyId.set(null);
    this.searchTerm.set('');
    this.loadDoctors();
  }

  protected openModal(doctor: Doctor): void {
    this.selectedDoctor.set(doctor);
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedDoctor.set(null);
  }

  protected bookAppointment(doctor: Doctor): void {
    this.closeModal();
    this.router.navigate(['/bookAppointment'], { queryParams: { doctorId: doctor.id_doctor } });
  }

  protected getDoctorInitials(doctor: Doctor): string {
    const name = doctor.usuario?.nombre ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  }

  protected formatPrice(price: number | null): string {
    return price ? `Q ${price.toFixed(2)}` : 'No definida';
  }

  protected getContactPhone(doctor: Doctor): string {
    return doctor.clinica?.telefono ?? 'No disponible';
  }

  protected getContactWhatsapp(doctor: Doctor): string {
    return doctor.clinica?.whatsapp ?? 'No disponible';
  }

  protected getScheduleDisplay(doctor: Doctor): { day: string; hours: string }[] {
    if (!doctor.horarios?.length) return [];
    const dayOrder = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
    return doctor.horarios
      .sort((a, b) => dayOrder.indexOf(a.dia) - dayOrder.indexOf(b.dia))
      .map((h) => ({
        day: h.dia.charAt(0) + h.dia.slice(1).toLowerCase(),
        hours: `${h.hora_inicio.slice(0, 5)} - ${h.hora_fin.slice(0, 5)}`,
      }));
  }
}
