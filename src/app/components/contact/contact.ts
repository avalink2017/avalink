import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, model, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConfigService } from '../../core/services/config.service';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs';
import { Turstile } from '../turstile/turstile';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, FormsModule, NgClass, Turstile],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  config = inject(ConfigService);
  formBuilder = inject(FormBuilder);
  http = inject(HttpClient);

  @ViewChild(Turstile) turnstile!: Turstile;

  siteKey?: string;

  isSubmiting = false;
  turnstileToken: string | null = null;

  constructor() {
    this.siteKey = this.config.turnsTile;
  }

  private buildUrl(endpoint: string): string {
    const base = this.config.apiUrl.endsWith('/')
      ? this.config.apiUrl.slice(0, -1)
      : this.config.apiUrl;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }

  fg = this.formBuilder.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  onCaptchaResolved(token: string | null | undefined) {
    if (token) this.turnstileToken = token;
  }

  onExpired() {
    this.hasExpired = true;
  }

  hasExpired = false;
  onReset() {
    this.turnstile.onReset();
    this.hasExpired = false;
  }

  onSubmit() {
    if (this.fg.valid) {
      const url = this.buildUrl('resend/contact');

      const dto = this.fg.getRawValue();

      const payload = {
        ...dto,
        token: this.turnstileToken,
      };

      this.isSubmiting = true;
      this.controlsSubmitingState(true);
      this.http
        .post(url, payload, {
          headers: { 'X-AVALINK-KEY': this.config.apiKey },
        })
        .pipe(
          finalize(() => {
            this.controlsSubmitingState(false);
          })
        )
        .subscribe({
          next: () => {
            this.isSubmiting = false;
            this.turnstileToken = null;

            Swal.fire(
              'Contacto',
              'Mensaje enviado correctamente, uno de nuestros acesores se pondrá en contacto contigo.',
              'success'
            );

            this.fg.reset();
          },
          error: (err) => {
            this.isSubmiting = false;

            Swal.fire('Error', 'No se pudo enviar el mensaje', 'error');
          },
        });
    }
  }

  isInvalid(controlName: string) {
    const control = this.fg!.get(controlName);
    return control?.invalid && control.touched;
  }

  controlsSubmitingState(submit: boolean) {
    if (submit) {
      this.fg.controls.name.disable();
      this.fg.controls.email.disable();
      this.fg.controls.subject.disable();
      this.fg.controls.message.disable();
    } else {
      this.fg.controls.name.enable();
      this.fg.controls.email.enable();
      this.fg.controls.subject.enable();
      this.fg.controls.message.enable();
    }
  }
}
