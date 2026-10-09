import { Component, inject, OnInit, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { DoctorService } from '@core/services/doctor.service';
import { Header } from '@components/headers/header/header';
import { Specialty, Location } from '@core/models';

type UserRole = 'PACIENTE' | 'DOCTOR';

@Component({
  imports: [Header, FormsModule],
  selector: 'app-register',
  styleUrl: './register.scss',
  templateUrl: './register.html',
})
export class Register implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly doctorService = inject(DoctorService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  protected selectedRole = signal<UserRole>('PACIENTE');

  // Common fields
  protected nombre = '';
  protected apellido = '';
  protected email = '';
  protected fecha_nacimiento = '';
  protected password = '';

  // Doctor-only fields
  protected numero_colegiado = '';
  protected id_especialidad = '';
  protected tarifa_consulta = '';
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

  // Form state
  protected loading = signal(false);
  protected error = signal('');
  protected success = signal(false);

  // Computed
  protected isDoctor = computed(() => this.selectedRole() === 'DOCTOR');

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.authService.isAuthenticated()) {
      this.redirectByRole();
    }
    this.loadCatalogs();
  }

  private loadCatalogs(): void {
    this.loadingCatalogs.set(true);
    this.doctorService.getSpecialties().subscribe({
      next: (data) => this.specialties.set(data),
      error: () => console.error('Error loading specialties'),
    });
    this.doctorService.getLocations().subscribe({
      next: (data) => this.locations.set(data),
      error: () => console.error('Error loading locations'),
    });
  }

  protected onRoleChange(role: UserRole): void {
    this.selectedRole.set(role);
    this.error.set('');
    this.success.set(false);
  }

  protected onSubmit(): void {
    console.log('📝 [Register] onSubmit() called', { role: this.selectedRole(), loading: this.loading() });
    if (this.loading()) return;

    if (!this.validateCommonFields()) return;
    if (this.isDoctor() && !this.validateDoctorFields()) return;

    this.error.set('');
    this.loading.set(true);

    if (this.isDoctor()) {
      this.registerDoctor();
    } else {
      this.registerUser();
    }
  }

  private validateCommonFields(): boolean {
    if (!this.nombre || !this.apellido || !this.email || !this.fecha_nacimiento || !this.password) {
      this.error.set('Completa todos los campos obligatorios');
      return false;
    }
    if (this.password.length < 8) {
      this.error.set('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    return true;
  }

  private validateDoctorFields(): boolean {
    if (!this.numero_colegiado || !this.id_especialidad || !this.clinicNombre || !this.clinicLocationId || !this.clinicZona || !this.clinicDireccion || !this.clinicWhatsapp) {
      this.error.set('Completa todos los campos de doctor y clínica');
      return false;
    }
    return true;
  }

  private registerUser(): void {
    const payload = {
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim(),
      fecha_nacimiento: this.fecha_nacimiento,
      email: this.email.trim().toLowerCase(),
      password: this.password,
    };

    console.log('📤 [Register] Sending registerUser payload', { email: payload.email });

    this.authService.registerUser(payload).subscribe({
      next: (result) => {
        console.log('✅ [Register] User registered', result);
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.redirectByRole(), 1500);
      },
      error: (err) => {
        console.error('❌ [Register] User error', err);
        this.loading.set(false);
        this.error.set(err?.error?.error ?? 'Error al registrar usuario. Inténtalo de nuevo.');
      },
    });
  }

  private registerDoctor(): void {
    const payload = {
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim(),
      fecha_nacimiento: this.fecha_nacimiento,
      email: this.email.trim().toLowerCase(),
      password: this.password,
      clinicNombre: this.clinicNombre.trim(),
      clinicLocationId: Number(this.clinicLocationId),
      clinicZona: Number(this.clinicZona),
      clinicDireccion: this.clinicDireccion.trim(),
      clinicTelefono: this.clinicTelefono.trim() || undefined,
      clinicWhatsapp: this.clinicWhatsapp.trim(),
      id_especialidad: Number(this.id_especialidad),
      numero_colegiado: this.numero_colegiado.trim() || undefined,
      tarifa_consulta: this.tarifa_consulta ? Number(this.tarifa_consulta) : undefined,
    };

    console.log('📤 [Register] Sending registerDoctor payload', { email: payload.email });

    this.authService.registerDoctor(payload).subscribe({
      next: (result) => {
        console.log('✅ [Register] Doctor registered', result);
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.redirectByRole(), 1500);
      },
      error: (err) => {
        console.error('❌ [Register] Doctor error', err);
        this.loading.set(false);
        this.error.set(err?.error?.error ?? 'Error al registrar doctor. Inténtalo de nuevo.');
      },
    });
  }

  private redirectByRole(): void {
    const role = this.authService.role();
    if (role === 'doctor') {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/availableDoctors']);
    }
  }
}
