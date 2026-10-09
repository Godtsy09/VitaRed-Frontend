import { Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

@Component({
  imports: [],
  selector: 'app-toast',
  styleUrl: './toast.scss',
  templateUrl: './toast.html',
})
export class Toast {
  protected readonly toastService = inject(ToastService);
}
