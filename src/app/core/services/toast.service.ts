import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

const DEFAULT_DURATION = 4000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;

  readonly toasts = signal<Toast[]>([]);

  success(message: string, duration = DEFAULT_DURATION): void {
    this.push('success', message, duration);
  }

  error(message: string, duration = DEFAULT_DURATION): void {
    this.push('error', message, duration);
  }

  info(message: string, duration = DEFAULT_DURATION): void {
    this.push('info', message, duration);
  }

  warning(message: string, duration = DEFAULT_DURATION): void {
    this.push('warning', message, duration);
  }

  remove(id: number): void {
    this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  private push(type: ToastType, message: string, duration: number): void {
    const id = ++this.counter;
    this.toasts.update((toasts) => [...toasts, { id, type, message }]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }
}
