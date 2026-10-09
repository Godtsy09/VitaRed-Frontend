import { Component, inject, OnInit, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderUser } from '@components/headers/header-user/header-user';
import { DoctorService } from '@core/services/doctor.service';
import { AppointmentService } from '@core/services/appointment.service';
import { Doctor } from '@core/models';
import { ToastService } from '@core/services/toast.service';
import { getInitials } from '@core/utils/initials';

const DAY_NAMES = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'] as const;

@Component({
  imports: [HeaderUser, FormsModule],
  selector: 'app-book-appointment',
  styleUrl: './book-appointment.scss',
  templateUrl: './book-appointment.html',
})
export class BookAppointment implements OnInit {
  private readonly doctorService = inject(DoctorService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);

  protected doctor = signal<Doctor | null>(null);
  protected loadingDoctor = signal(true);
  protected loading = signal(false);
  protected error = signal<string | null>(null);

  // Form fields
  protected fecha = '';
  protected hora = '';
  protected motivo = '';

  // Computed
  protected readonly minDate = computed(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  protected availableHours = signal<string[]>([]);
  protected fieldErrors = signal<Record<string, string>>({});

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const doctorId = this.route.snapshot.queryParams['doctorId'];
    if (doctorId) {
      this.loadDoctor(Number(doctorId));
    } else {
      this.error.set('No se especificó un médico');
      this.loadingDoctor.set(false);
    }
  }

  private loadDoctor(id: number): void {
    this.doctorService.getDoctorById(id).subscribe({
      next: (d) => {
        this.doctor.set(d);
        this.loadingDoctor.set(false);
        this.generateAvailableHours(d, this.fecha);
      },
      error: (err) => {
        this.loadingDoctor.set(false);
        this.error.set(err?.error?.error ?? 'Error al cargar médico');
        this.toastr.error('No se pudo cargar la información del médico');
      },
    });
  }

  private generateAvailableHours(doctor: Doctor, fecha: string): void {
    if (!fecha) {
      this.availableHours.set([]);
      return;
    }

    const [year, month, day] = fecha.split('-').map(Number);
    const dayName = DAY_NAMES[new Date(year, month - 1, day).getDay()];
    const hours = new Set<string>();

    doctor.horarios
      ?.filter((schedule) => schedule.dia === dayName)
      .forEach((schedule) => {
        const startHour = Number(schedule.hora_inicio.slice(0, 2));
        const endHour = Number(schedule.hora_fin.slice(0, 2));
        for (let h = startHour; h < endHour; h++) {
          hours.add(`${String(h).padStart(2, '0')}:00:00`);
        }
      });

    this.availableHours.set(Array.from(hours).sort());
  }

  protected onDateChange(): void {
    this.hora = '';
    const doctor = this.doctor();
    if (doctor) {
      this.generateAvailableHours(doctor, this.fecha);
    }
  }

  protected clearFieldError(field: string): void {
    this.fieldErrors.update((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  protected validateFields(): boolean {
    const errors: Record<string, string> = {};

    if (!this.fecha) {
      errors['fecha'] = 'La fecha de la cita es obligatoria';
    } else if (this.fecha < this.minDate()) {
      errors['fecha'] = 'La fecha de la cita no puede ser anterior a hoy';
    }
    if (!this.hora) {
      errors['hora'] = 'La hora de la cita es obligatoria';
    }
    if (!this.motivo?.trim()) {
      errors['motivo'] = 'El motivo de la consulta es obligatorio';
    } else if (this.motivo.trim().length > 255) {
      errors['motivo'] = 'El motivo no puede superar los 255 caracteres';
    }

    this.fieldErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  protected onSubmit(): void {
    if (this.loading()) return;
    if (!this.doctor()) return;
    if (!this.validateFields()) return;

    this.loading.set(true);
    this.error.set(null);

    const fechaHora = `${this.fecha}T${this.hora}`;

    this.appointmentService.createAppointment({
      id_doctor: this.doctor()!.id_doctor,
      fecha_hora_inicio: fechaHora,
      motivo: this.motivo.trim(),
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toastr.success('Cita agendada exitosamente');
        this.router.navigate(['/myAppointments']);
      },
      error: (err) => {
        this.loading.set(false);
        this.fieldErrors.set({});
        const details = err?.error?.details as Record<string, string[]> | undefined;
        const message = err?.error?.error ?? 'Error al agendar cita';

        if (details && Object.keys(details).length > 0) {
          const mapped: Record<string, string> = {};
          for (const [key, messages] of Object.entries(details)) {
            const field = key === 'fecha_hora_inicio' ? 'fecha' : key;
            const value = Array.isArray(messages) ? (messages[0] ?? '') : String(messages ?? '');
            if (value) mapped[field] = value;
          }
          this.fieldErrors.set(mapped);
          this.toastr.error('Revisa los campos marcados en el formulario');
          return;
        }

        if (message === 'El horario no está disponible') {
          this.fieldErrors.set({ hora: message });
        } else if (message === 'La fecha y hora de la cita deben ser posteriores a ahora') {
          this.fieldErrors.set({ fecha: message });
        } else {
          this.error.set(message);
        }
        this.toastr.error(message);
      },
    });
  }

  protected onCancel(): void {
    this.router.navigate(['/availableDoctors']);
  }

  protected getDoctorInitials(doctor: Doctor): string {
    return getInitials(doctor.usuario?.nombre, doctor.usuario?.apellido);
  }

  protected formatPrice(price: number | string | null): string {
    const value = typeof price === 'string' ? Number(price) : price;
    return value !== null && !Number.isNaN(value) ? `Q ${value.toFixed(2)}` : 'No definida';
  }

  protected formatTimeDisplay(time: string): string {
    const [h] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:00 ${ampm}`;
  }
}
