import { Component, signal } from '@angular/core';
import { Contact } from "./components/contact/contact";

@Component({
  selector: 'app-root',
  imports: [Contact],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('avalink');
}
