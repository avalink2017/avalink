import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  model,
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
  @Output() expired = new EventEmitter<void>()  

  private widgetId: string | null = null;

  ts?:any

  ngAfterViewInit() {
    this.renderWidget();
  }  

  onReset(){
    if(this.widgetId && this.ts)
      this.ts.reset(this.widgetId)
  }

  renderWidget() {
    // Accedemos al objeto global de window
    this.ts = (window as any).turnstile;

    if (this.ts) {
      this.widgetId = this.ts.render(this.container.nativeElement, {
        sitekey: this.siteKey,
        callback: (token: string) => {
          this.resolved.emit(token);
        },
        'error-callback': () => {
          //this.resolved.emit(null);
        },
        'expired-callback': () => {
          this.expired.emit();
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
