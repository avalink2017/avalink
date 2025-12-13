import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config: any;

  constructor(private http: HttpClient) {}

  async load(): Promise<void> {
    const data = await firstValueFrom(this.http.get('/config.json'));
    this.config = data;
  }

  get apiUrl(): string {
    return this.config?.urlApi ?? '';
  }

  get apiKey(): string {
    return this.config.apiKey ?? '';
  }

  get turnsTile(): string {
    return this.config.turnstileSiteKey ?? '';
  }
}
