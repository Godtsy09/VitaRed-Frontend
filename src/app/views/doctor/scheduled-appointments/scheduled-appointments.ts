import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderDoctor } from '@components/headers/header-doctor/header-doctor';
import { AppointmentService } from '@core/services/appointment.service';
import { Appointment } from '@core/models';
import { ToastService } from '@core/services/toast.service';

@Component({
  imports: [HeaderDoctor, FormsModule],
  selector: 'app-scheduled-appointments',
  styleUrl: './scheduled-appointments.scss',
  templateUrl: './scheduled-appointments.html',
})
export class ScheduledAppointments implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly toastr = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);

  protected appointments = signal<Appointment[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);
  protected updating = signal<Record<number, boolean>>({});

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadAppointments();
  }

  private loadAppointments(): void {
    this.loading.set(true);
    this.error.set(null);
    this.appointmentService.getDoctorAppointments().subscribe({
      next: (data: Appointment[]) => {
        this.appointments.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.error ?? 'Error al cargar citas');
        this.toastr.error('No se pudieron cargar las citas');
      },
    });
  }

  protected updateStatus(appointmentId: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as 'CANCELADA' | 'ATENDIDA';

    if (!newStatus || this.updating()[appointmentId]) return;

    this.updating.update((u) => ({ ...u, [appointmentId]: true }));

    this.appointmentService.updateAppointmentStatus(appointmentId, { estado: newStatus }).subscribe({
      next: () => {
        this.updating.update((u) => ({ ...u, [appointmentId]: false }));
        this.toastr.success(`Cita marcada como ${newStatus === 'ATENDIDA' ? 'Atendida' : 'Cancelada'}`);
        this.loadAppointments();
      },
      error: (err) => {
        this.updating.update((u) => ({ ...u, [appointmentId]: false }));
        this.toastr.error(err?.error?.error ?? 'Error al actualizar estado');
        this.loadAppointments();
      },
    });
  }

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  protected formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  protected getStatusClass(estado: string): string {
    switch (estado) {
      case 'PROGRAMADA':
        return 'status-confirmed';
      case 'ATENDIDA':
        return 'status-completed';
      case 'CANCELADA':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  protected getStatusLabel(estado: string): string {
    switch (estado) {
      case 'PROGRAMADA':
        return 'Programada';
      case 'ATENDIDA':
        return 'Atendida';
      case 'CANCELADA':
        return 'Cancelada';
      default:
        return estado;
    }
  }

  protected getStatusOptions(current: string): { value: 'CANCELADA' | 'ATENDIDA'; label: string }[] {
    if (current === 'PROGRAMADA') {
      return [
        { value: 'CANCELADA', label: 'Cancelada' },
        { value: 'ATENDIDA', label: 'Atendida' },
      ];
    }
    return [];
  }

  protected getPatientInitials(patient?: Appointment['paciente']): string {
    const name = patient?.nombre ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  }

  protected isUpdating(appointmentId: number): boolean {
    return this.updating()[appointmentId] ?? false;
  }
}
