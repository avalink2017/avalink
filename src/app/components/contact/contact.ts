import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import Swal from 'sweetalert2';
import { finalize } from 'rxjs';
import { Turstile } from '../turstile/turstile';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, FormsModule, NgClass, Turstile],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  env = environment;

  formBuilder = inject(FormBuilder);
  http = inject(HttpClient);

  @ViewChild(Turstile) turnstile!: Turstile;

  siteKey?: string;

  isSubmiting = false;
  turnstileToken: string | null = null;

  constructor() {
    this.siteKey = this.env.turnstileKey;           
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
    console.log('Expired');
    this.hasExpired = true;
  }

  hasExpired = false;
  onReset() {
    this.turnstile.onReset();
    this.hasExpired = false;
  }

  onSubmit() {
    if (this.fg.valid) {
      const url = `${this.env.apiUrl}/resend/contact`; 

      const dto = this.fg.getRawValue();

      const payload = {
        ...dto,
        token: this.turnstileToken,
      };

      this.isSubmiting = true;
      this.controlsSubmitingState(true);
      this.http
        .post(url, payload, {
          headers: { 'X-AVALINK-KEY': this.env.apiKey! },
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
