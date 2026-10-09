import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '@components/footer/footer';
import { Toast } from '@components/toast/toast';

@Component({
  imports: [RouterOutlet, Footer, Toast],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('VitaRed-Frontend');
}
