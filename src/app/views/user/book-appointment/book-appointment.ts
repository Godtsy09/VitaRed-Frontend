import { Component, inject, OnInit, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderUser } from '@components/headers/header-user/header-user';
import { DoctorService } from '@core/services/doctor.service';
import { AppointmentService } from '@core/services/appointment.service';
import { Doctor } from '@core/models';
import { ToastService } from '@core/services/toast.service';

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
  protected minDate = computed(() => new Date().toISOString().split('T')[0]);
  protected availableHours = signal<string[]>([]);
  protected isFormValid = computed(() => !!this.fecha && !!this.hora && !!this.motivo.trim());

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
        this.generateAvailableHours(d);
      },
      error: (err) => {
        this.loadingDoctor.set(false);
        this.error.set(err?.error?.error ?? 'Error al cargar médico');
        this.toastr.error('No se pudo cargar la información del médico');
      },
    });
  }

  private generateAvailableHours(doctor: Doctor): void {
    const hours = new Set<string>();
    doctor.horarios?.forEach((schedule) => {
      const start = schedule.hora_inicio.slice(0, 5);
      const end = schedule.hora_fin.slice(0, 5);
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      for (let h = sh; h < eh; h++) {
        hours.add(`${h.toString().padStart(2, '0')}:00:00`);
      }
    });
    this.availableHours.set(Array.from(hours).sort());
  }

  protected onDateChange(): void {
    this.hora = '';
  }

  protected onSubmit(): void {
    if (this.loading() || !this.isFormValid()) return;
    if (!this.doctor()) return;

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
        this.error.set(err?.error?.error ?? 'Error al agendar cita');
        this.toastr.error(err?.error?.error ?? 'No se pudo agendar la cita');
      },
    });
  }

  protected onCancel(): void {
    this.router.navigate(['/availableDoctors']);
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

  protected formatTimeDisplay(time: string): string {
    const [h] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:00 ${ampm}`;
  }
}
