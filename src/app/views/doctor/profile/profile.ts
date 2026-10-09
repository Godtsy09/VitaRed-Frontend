import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderDoctor } from '@components/headers/header-doctor/header-doctor';
import { DoctorService } from '@core/services/doctor.service';
import { Doctor, Specialty, Location } from '@core/models';
import { ToastService } from '@core/services/toast.service';

@Component({
  imports: [HeaderDoctor, FormsModule],
  selector: 'app-profile',
  styleUrl: './profile.scss',
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private readonly doctorService = inject(DoctorService);
  private readonly toastr = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);

  protected doctor = signal<Doctor | null>(null);
  protected loading = signal(true);
  protected saving = signal(false);
  protected error = signal<string | null>(null);
  protected success = signal(false);

  // Doctor fields
  protected id_especialidad = '';
  protected numero_colegiado = '';
  protected tarifa_consulta = '';

  // Clinic fields
  protected clinicNombre = '';
  protected clinicLocationId = '';
  protected clinicZona = '';
  protected clinicDireccion = '';
  protected clinicTelefono = '';
  protected clinicWhatsapp = '';

  // Catalogs
  protected specialties = signal<Specialty[]>([]);
  protected locations = signal<Location[]>([]);
  protected loadingCatalogs = signal(false);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadProfile();
    this.loadCatalogs();
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.doctorService.getMyProfile().subscribe({
      next: (d: Doctor) => {
        this.doctor.set(d);
        this.populateForm(d);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.error ?? 'Error al cargar perfil');
        this.toastr.error('No se pudo cargar el perfil');
      },
    });
  }

  private loadCatalogs(): void {
    this.loadingCatalogs.set(true);
    this.doctorService.getSpecialties().subscribe({
      next: (data: Specialty[]) => this.specialties.set(data),
      error: () => console.error('Error loading specialties'),
    });
    this.doctorService.getLocations().subscribe({
      next: (data: Location[]) => this.locations.set(data),
      error: () => console.error('Error loading locations'),
      complete: () => this.loadingCatalogs.set(false),
    });
  }

  private populateForm(d: Doctor): void {
    this.id_especialidad = String(d.id_especialidad ?? '');
    this.numero_colegiado = d.numero_colegiado ?? '';
    this.tarifa_consulta = d.tarifa_consulta ? String(d.tarifa_consulta) : '';

    this.clinicNombre = d.clinica?.nombre ?? '';
    this.clinicLocationId = String(d.clinica?.id_location ?? '');
    this.clinicZona = String(d.clinica?.zona ?? '');
    this.clinicDireccion = d.clinica?.direccion ?? '';
    this.clinicTelefono = d.clinica?.telefono ?? '';
    this.clinicWhatsapp = d.clinica?.whatsapp ?? '';
  }

  protected onSaveDoctor(): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    this.success.set(false);

    const payload = {
      id_especialidad: this.id_especialidad ? Number(this.id_especialidad) : undefined,
      numero_colegiado: this.numero_colegiado || undefined,
      tarifa_consulta: this.tarifa_consulta ? Number(this.tarifa_consulta) : undefined,
    };

    this.doctorService.updateMyProfile(payload).subscribe({
      next: (updated: Doctor) => {
        this.doctor.set(updated);
        this.populateForm(updated);
        this.saving.set(false);
        this.success.set(true);
        this.toastr.success('Información profesional actualizada');
        setTimeout(() => this.success.set(false), 3000);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.error ?? 'Error al actualizar perfil');
        this.toastr.error('No se pudo actualizar la información profesional');
      },
    });
  }

  protected onSaveClinic(): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    this.success.set(false);

    const payload = {
      clinicNombre: this.clinicNombre || undefined,
      clinicLocationId: this.clinicLocationId ? Number(this.clinicLocationId) : undefined,
      clinicZona: this.clinicZona ? Number(this.clinicZona) : undefined,
      clinicDireccion: this.clinicDireccion || undefined,
      clinicTelefono: this.clinicTelefono || undefined,
      clinicWhatsapp: this.clinicWhatsapp || undefined,
    };

    this.doctorService.updateMyClinic(payload).subscribe({
      next: (updated: Doctor) => {
        this.doctor.set(updated);
        this.populateForm(updated);
        this.saving.set(false);
        this.success.set(true);
        this.toastr.success('Información de clínica actualizada');
        setTimeout(() => this.success.set(false), 3000);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.error ?? 'Error al actualizar clínica');
        this.toastr.error('No se pudo actualizar la información de la clínica');
      },
    });
  }
}
