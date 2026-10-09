import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderUser } from '@components/headers/header-user/header-user';
import { AppointmentService } from '@core/services/appointment.service';
import { Appointment, Doctor } from '@core/models';
import { ToastService } from '@core/services/toast.service';
import { getInitials } from '@core/utils/initials';

@Component({
  imports: [HeaderUser, RouterLink],
  selector: 'app-my-appointments',
  styleUrl: './my-appointments.scss',
  templateUrl: './my-appointments.html',
})
export class MyAppointments implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly toastr = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);

  protected appointments = signal<Appointment[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadAppointments();
  }

  private loadAppointments(): void {
    this.loading.set(true);
    this.error.set(null);
    this.appointmentService.getMyAppointments().subscribe({
      next: (data: Appointment[]) => {
        this.appointments.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.error ?? 'Error al cargar citas');
        this.toastr.error('No se pudieron cargar tus citas');
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

  protected getDoctorInitials(doctor?: Doctor): string {
    return getInitials(doctor?.usuario?.nombre, doctor?.usuario?.apellido);
  }
}
