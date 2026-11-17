import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-view-state',
  template: `
    @if (loading()) {
      <div class="view-state" role="status">
        <span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Chargement…
      </div>
    } @else if (error()) {
      <div class="view-state">
        <i class="bi bi-exclamation-circle" aria-hidden="true"></i>
        <p role="alert">{{ error() }}</p>
        <button type="button" class="button button-secondary" (click)="retry.emit()">Réessayer</button>
      </div>
    } @else {
      <div class="view-state">
        <i class="bi bi-inbox" aria-hidden="true"></i>
        <p>{{ empty() }}</p>
      </div>
    }
  `,
})
export class ViewStateComponent {
  readonly loading = input(false);
  readonly error = input('');
  readonly empty = input('');
  readonly retry = output<void>();
}
