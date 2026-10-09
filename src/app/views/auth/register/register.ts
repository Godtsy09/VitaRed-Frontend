import { Component, inject, OnInit, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { DoctorService } from '@core/services/doctor.service';
import { Header } from '@components/headers/header/header';
import { RegisterDoctorPayload, Specialty, Location } from '@core/models';

type UserRole = 'PACIENTE' | 'DOCTOR';

@Component({
  imports: [Header, FormsModule, RouterLink],
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
  protected fieldErrors = signal<Record<string, string>>({});

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
    forkJoin({
      specialties: this.doctorService.getSpecialties(),
      locations: this.doctorService.getLocations(),
    }).subscribe({
      next: (data) => {
        this.specialties.set(data.specialties);
        this.locations.set(data.locations);
        this.loadingCatalogs.set(false);
      },
      error: () => {
        this.loadingCatalogs.set(false);
        this.error.set('No se pudieron cargar los catálogos. Recarga la página.');
      },
    });
  }

  protected onRoleChange(role: UserRole): void {
    this.selectedRole.set(role);
    this.error.set('');
    this.success.set(false);
    this.fieldErrors.set({});
  }

  protected clearFieldError(field: string): void {
    this.fieldErrors.update((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  protected onSubmit(): void {
    console.log('📝 [Register] onSubmit() called', { role: this.selectedRole(), loading: this.loading() });
    if (this.loading()) return;

    if (!this.validateFields()) return;

    this.error.set('');
    this.fieldErrors.set({});
    this.loading.set(true);

    if (this.isDoctor()) {
      this.registerDoctor();
    } else {
      this.registerUser();
    }
  }

  private validateFields(): boolean {
    const errors: Record<string, string> = {};

    if (!this.nombre?.trim()) {
      errors['nombre'] = 'El nombre es obligatorio';
    } else if (this.nombre.trim().length < 2) {
      errors['nombre'] = 'El nombre debe tener al menos 2 caracteres';
    }
    if (!this.apellido?.trim()) {
      errors['apellido'] = 'El apellido es obligatorio';
    } else if (this.apellido.trim().length < 2) {
      errors['apellido'] = 'El apellido debe tener al menos 2 caracteres';
    }
    if (!this.email?.trim()) {
      errors['email'] = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      errors['email'] = 'El correo electrónico no es válido';
    }
    if (!this.fecha_nacimiento) {
      errors['fecha_nacimiento'] = 'La fecha de nacimiento es obligatoria';
    } else if (new Date(`${this.fecha_nacimiento}T00:00:00`).getTime() >= Date.now()) {
      errors['fecha_nacimiento'] = 'La fecha de nacimiento no puede ser futura';
    }
    if (!this.password) {
      errors['password'] = 'La contraseña es obligatoria';
    } else if (this.password.length < 8) {
      errors['password'] = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (this.isDoctor()) {
      if (!this.numero_colegiado?.trim()) {
        errors['numero_colegiado'] = 'El número de colegiado es obligatorio';
      } else if (this.numero_colegiado.trim().length > 50) {
        errors['numero_colegiado'] = 'El número de colegiado no puede superar los 50 caracteres';
      }
      if (!this.id_especialidad) {
        errors['id_especialidad'] = 'La especialidad es obligatoria';
      }
      if (!this.tarifa_consulta) {
        errors['tarifa_consulta'] = 'La tarifa por consulta es obligatoria';
      } else if (Number(this.tarifa_consulta) <= 0) {
        errors['tarifa_consulta'] = 'La tarifa por consulta debe ser mayor a 0';
      }
      if (!this.clinicNombre?.trim()) {
        errors['clinicNombre'] = 'El nombre de la clínica es obligatorio';
      }
      if (!this.clinicLocationId) {
        errors['clinicLocationId'] = 'La ubicación es obligatoria';
      }
      if (!this.clinicZona) {
        errors['clinicZona'] = 'La zona es obligatoria';
      } else if (Number(this.clinicZona) < 1 || Number(this.clinicZona) > 99) {
        errors['clinicZona'] = 'La zona debe estar entre 1 y 99';
      }
      if (!this.clinicDireccion?.trim()) {
        errors['clinicDireccion'] = 'La dirección es obligatoria';
      }
      if (!this.clinicTelefono?.trim()) {
        errors['clinicTelefono'] = 'El teléfono es obligatorio';
      } else if (!/^[0-9]{8,}$/.test(this.clinicTelefono.trim())) {
        errors['clinicTelefono'] = 'El teléfono debe contener al menos 8 dígitos';
      }
      if (!this.clinicWhatsapp?.trim()) {
        errors['clinicWhatsapp'] = 'El WhatsApp es obligatorio';
      } else if (!/^[0-9]{8,}$/.test(this.clinicWhatsapp.trim())) {
        errors['clinicWhatsapp'] = 'El WhatsApp debe contener al menos 8 dígitos';
      }
    }

    this.fieldErrors.set(errors);
    this.error.set(Object.values(errors)[0] ?? '');
    return Object.keys(errors).length === 0;
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
        this.applyFieldErrors(err, 'Error al registrar usuario. Inténtalo de nuevo.');
      },
    });
  }

  private registerDoctor(): void {
    const payload: RegisterDoctorPayload = {
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim(),
      fecha_nacimiento: this.fecha_nacimiento,
      email: this.email.trim().toLowerCase(),
      password: this.password,
      clinicNombre: this.clinicNombre.trim(),
      clinicLocationId: Number(this.clinicLocationId),
      clinicZona: Number(this.clinicZona),
      clinicDireccion: this.clinicDireccion.trim(),
      clinicTelefono: this.clinicTelefono.trim(),
      clinicWhatsapp: this.clinicWhatsapp.trim(),
      id_especialidad: Number(this.id_especialidad),
      numero_colegiado: this.numero_colegiado.trim(),
      tarifa_consulta: Number(this.tarifa_consulta),
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
        this.applyFieldErrors(err, 'Error al registrar doctor. Inténtalo de nuevo.');
      },
    });
  }

  private applyFieldErrors(err: unknown, fallback: string): void {
    const body = (err as { error?: unknown })?.error;
    const details = (body as { details?: Record<string, unknown> } | undefined)?.details;

    const map: Record<string, string> = {};
    if (details && typeof details === 'object') {
      for (const field of Object.keys(details)) {
        const messages = details[field];
        if (Array.isArray(messages) && messages.length > 0) {
          map[field] = String(messages[0]);
        }
      }
    }

    this.fieldErrors.set(map);

    const firstFieldMessage = Object.values(map)[0];
    const serverMessage =
      typeof body === 'string' ? body : (body as { error?: string } | undefined)?.error;
    this.error.set(firstFieldMessage ?? serverMessage ?? fallback);
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
