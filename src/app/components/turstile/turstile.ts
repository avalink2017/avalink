import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-turstile',
  standalone: true,
  template: `<div #turnstileContainer></div>`,
})
export class Turstile implements AfterViewInit, OnDestroy {
  @ViewChild('turnstileContainer') container!: ElementRef;

  @Input() siteKey: string = 'TU_SITE_KEY_AQUI';
  @Output() resolved = new EventEmitter<string | null | undefined>();

  private widgetId: string | null = null;

  ngAfterViewInit() {
    this.renderWidget();
  }

  renderWidget() {
    // Accedemos al objeto global de window
    const ts = (window as any).turnstile;

    if (ts) {
      this.widgetId = ts.render(this.container.nativeElement, {
        sitekey: this.siteKey,
        callback: (token: string) => {
          this.resolved.emit(token);
        },
        'error-callback': () => {
          //this.resolved.emit(null);
        },
        'expired-callback': () => {
          //this.resolved.emit(null);
        },
        'refresh-expired': 'never',
        'refresh-timeout': 'never',
      });
    }
  }

  ngOnDestroy() {
    if (this.widgetId) {
      (window as any).turnstile.remove(this.widgetId);
    }
  }
}
