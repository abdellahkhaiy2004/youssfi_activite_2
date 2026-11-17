import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed } from '@angular/core';
import { formatApiError, productCollection } from './billing-api';
import { ListPaginationComponent, ListSearchComponent } from './list-controls.component';
import { ViewStateComponent } from './view-state.component';

@Component({
  imports: [CurrencyPipe, DecimalPipe, ListSearchComponent, ListPaginationComponent, ViewStateComponent],
  template: `
    <header class="page-heading">
      <div class="page-icon"><i class="bi bi-box-seam" aria-hidden="true"></i></div>
      <h1>Produits</h1>
      <p>Consultez les articles du catalogue, leurs prix et leurs quantités.</p>
    </header>
    <section class="panel" aria-labelledby="products-title">
      <div class="panel-heading">
        <h2 id="products-title">Catalogue produits</h2>
        <app-list-search [value]="collection.query()" placeholder="Nom du produit"
                         (search)="collection.search($event)" />
      </div>
      @if (collection.rows().length) {
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th scope="col">Produit</th><th scope="col" class="text-end">Prix unitaire</th><th scope="col" class="text-end">En stock</th></tr>
            </thead>
            <tbody>
              @for (product of collection.rows(); track product.id) {
                <tr>
                  <th scope="row">
                    <div class="table-identity">
                      <span class="avatar product-avatar" aria-hidden="true"><i class="bi bi-box-seam"></i></span>
                      <span>{{ product.name }} <small class="subline">Réf. {{ product.id }}</small></span>
                    </div>
                  </th>
                  <td class="text-end numeric">{{ product.price | currency:'MAD':'code' }}</td>
                  <td class="text-end numeric"><span class="stock" [class.stock-empty]="product.quantity === 0">{{ product.quantity | number }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <app-view-state [loading]="collection.isLoading()" [error]="error()"
                        empty="Aucun produit trouvé." (retry)="collection.reload()" />
      }
      @if (collection.metadata(); as page) {
        <app-list-pagination [total]="page.totalElements" [pages]="page.totalPages" [index]="page.number"
                             (move)="collection.move($event)" />
      }
    </section>
  `,
})
export class ProductsComponent {
  protected readonly collection = productCollection();
  protected readonly error = computed(() => {
    const error = this.collection.error();
    return error ? formatApiError(error, 'Impossible de charger les produits.') : '';
  });
}
