import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-list-search',
  template: `
    <form class="list-search" role="search" (submit)="$event.preventDefault(); search.emit(query.value)">
      <i class="bi bi-search" aria-hidden="true"></i>
      <input #query type="search" [value]="value()" [placeholder]="placeholder()" [attr.aria-label]="placeholder()">
      <button type="submit" class="button button-secondary">Chercher</button>
    </form>
  `,
})
export class ListSearchComponent {
  readonly value = input('');
  readonly placeholder = input.required<string>();
  readonly search = output<string>();
}

@Component({
  selector: 'app-list-pagination',
  template: `
    <div class="table-footer">
      <span>{{ total() }} {{ total() === 1 ? 'résultat' : 'résultats' }}</span>
      @if (pages() > 1) {
        <nav class="page-navigation" aria-label="Pagination">
          <button type="button" class="button button-secondary icon-button"
                  [disabled]="index() === 0" (click)="move.emit(index() - 1)" aria-label="Page précédente">
            <i class="bi bi-chevron-left" aria-hidden="true"></i>
          </button>
          <span>Page {{ index() + 1 }} sur {{ pages() }}</span>
          <button type="button" class="button button-secondary icon-button"
                  [disabled]="index() >= pages() - 1" (click)="move.emit(index() + 1)" aria-label="Page suivante">
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        </nav>
      }
    </div>
  `,
})
export class ListPaginationComponent {
  readonly total = input.required<number>();
  readonly pages = input.required<number>();
  readonly index = input.required<number>();
  readonly move = output<number>();
}
