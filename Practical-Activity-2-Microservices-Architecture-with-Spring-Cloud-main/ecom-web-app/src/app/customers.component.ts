import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { customerCollection, formatApiError } from './billing-api';
import { ListPaginationComponent, ListSearchComponent } from './list-controls.component';
import { ViewStateComponent } from './view-state.component';

@Component({
  imports: [RouterLink, ListSearchComponent, ListPaginationComponent, ViewStateComponent],
  template: `
    <header class="page-heading">
      <div class="page-icon"><i class="bi bi-people" aria-hidden="true"></i></div>
      <h1>Clients</h1>
      <p>Retrouvez vos clients et accédez à leurs factures.</p>
    </header>
    <section class="panel" aria-labelledby="clients-title">
      <div class="panel-heading">
        <h2 id="clients-title">Répertoire clients</h2>
        <app-list-search [value]="collection.query()" placeholder="Nom ou adresse e-mail"
                         (search)="collection.search($event)" />
      </div>
      @if (collection.rows().length) {
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th scope="col">Client</th><th scope="col">Adresse e-mail</th><th scope="col" class="text-end">Factures</th></tr>
            </thead>
            <tbody>
              @for (customer of collection.rows(); track customer.id) {
                <tr>
                  <th scope="row">
                    <div class="table-identity">
                      <span class="avatar" [attr.data-tone]="customer.id % 4" aria-hidden="true">{{ initials(customer.name) }}</span>
                      <span>{{ customer.name }}</span>
                    </div>
                  </th>
                  <td class="muted">{{ customer.email }}</td>
                  <td class="text-end">
                    <a class="button button-secondary" [routerLink]="['/bills', customer.id]"
                       [attr.aria-label]="'Voir les factures de ' + customer.name">
                      Voir les factures <i class="bi bi-arrow-right" aria-hidden="true"></i>
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <app-view-state [loading]="collection.isLoading()" [error]="error()"
                        empty="Aucun client trouvé." (retry)="collection.reload()" />
      }
      @if (collection.metadata(); as page) {
        <app-list-pagination [total]="page.totalElements" [pages]="page.totalPages" [index]="page.number"
                             (move)="collection.move($event)" />
      }
    </section>
  `,
})
export class CustomersComponent {
  protected readonly collection = customerCollection();
  protected readonly error = computed(() => {
    const error = this.collection.error();
    return error ? formatApiError(error, 'Impossible de charger les clients.') : '';
  });

  protected initials(name: string) {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }
}
