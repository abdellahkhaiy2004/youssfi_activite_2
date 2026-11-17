import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, input, numberAttribute } from '@angular/core';
import { RouterLink } from '@angular/router';
import { billResource, formatApiError } from './billing-api';
import { ViewStateComponent } from './view-state.component';

@Component({
  imports: [CurrencyPipe, DatePipe, RouterLink, ViewStateComponent],
  template: `
    @if (bill.hasValue()) {
      @let detail = bill.value();
      <a class="back-link" [routerLink]="['/bills', detail.customerId]">
        <i class="bi bi-arrow-left" aria-hidden="true"></i> Retour aux factures
      </a>
      <header class="page-heading">
        <div class="page-icon"><i class="bi bi-receipt" aria-hidden="true"></i></div>
        <h1>Facture n° {{ detail.id }}</h1>
        <p>Émise le {{ detail.billingDate | date:'d MMMM y' }}</p>
      </header>

      <div class="invoice-summary">
        <section class="panel invoice-customer" aria-labelledby="invoice-customer">
          <h2 id="invoice-customer"><i class="bi bi-person" aria-hidden="true"></i> Client facturé</h2>
          <strong>{{ detail.customer?.name ?? 'Client n° ' + detail.customerId }}</strong>
          @if (detail.customer?.email; as email) {
            <span>{{ email }}</span>
          }
        </section>
        <section class="panel invoice-total" aria-labelledby="invoice-total">
          <h2 id="invoice-total"><i class="bi bi-cash-stack" aria-hidden="true"></i> Total de la facture</h2>
          <strong>{{ detail.total | currency:'MAD':'code' }}</strong>
        </section>
      </div>

      <section class="panel" aria-labelledby="invoice-articles">
        <div class="panel-heading"><h2 id="invoice-articles">Articles facturés</h2></div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th scope="col">Produit</th><th scope="col" class="text-end">Quantité</th>
                  <th scope="col" class="text-end">Prix unitaire</th><th scope="col" class="text-end">Montant</th></tr>
            </thead>
            <tbody>
              @for (item of detail.productItems; track item.id) {
                <tr>
                  <th scope="row">{{ item.product?.name ?? 'Produit n° ' + item.productId }}</th>
                  <td class="text-end numeric">{{ item.quantity }}</td>
                  <td class="text-end numeric">{{ item.unitPrice | currency:'MAD':'code' }}</td>
                  <td class="text-end numeric">{{ item.lineTotal | currency:'MAD':'code' }}</td>
                </tr>
              }
            </tbody>
            <tfoot>
              <tr><th scope="row" colspan="3">Total</th><td class="text-end numeric">{{ detail.total | currency:'MAD':'code' }}</td></tr>
            </tfoot>
          </table>
        </div>
      </section>
    } @else {
      <a class="back-link" routerLink="/customers"><i class="bi bi-arrow-left" aria-hidden="true"></i> Tous les clients</a>
      <header class="page-heading"><h1>Facture n° {{ billId() }}</h1></header>
      <div class="panel">
        <app-view-state [loading]="bill.isLoading()" [error]="error()"
                        empty="Cette facture est introuvable." (retry)="bill.reload()" />
      </div>
    }
  `,
})
export class BillDetailsComponent {
  readonly billId = input.required({ transform: numberAttribute });
  protected readonly bill = billResource(this.billId);
  protected readonly error = computed(() => {
    const error = this.bill.error();
    if (error instanceof HttpErrorResponse && error.status === 404) return '';
    return error ? formatApiError(error, 'Impossible de charger la facture.') : '';
  });
}
