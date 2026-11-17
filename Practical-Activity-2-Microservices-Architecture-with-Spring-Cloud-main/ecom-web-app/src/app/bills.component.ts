import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input, numberAttribute, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { billsResource, customerResource, formatApiError } from './billing-api';
import { CreateBillComponent } from './create-bill.component';
import { ViewStateComponent } from './view-state.component';

@Component({
  imports: [CurrencyPipe, DatePipe, RouterLink, CreateBillComponent, ViewStateComponent],
  template: `
    <a class="back-link" routerLink="/customers"><i class="bi bi-arrow-left" aria-hidden="true"></i> Tous les clients</a>
    <header class="page-heading page-heading-actions">
      <div>
        <div class="page-icon"><i class="bi bi-receipt-cutoff" aria-hidden="true"></i></div>
        <h1>{{ customer.hasValue() ? customer.value().name : 'Client n° ' + customerId() }}</h1>
        <p>{{ customer.hasValue() ? customer.value().email : 'Historique des factures' }}</p>
      </div>
      @if (customer.hasValue() && !creating()) {
        <button type="button" class="button button-primary" (click)="creating.set(true)">
          <i class="bi bi-plus-lg" aria-hidden="true"></i> Nouvelle facture
        </button>
      }
    </header>

    @if (creating()) {
      <app-create-bill [customerId]="customerId()" (cancel)="creating.set(false)" (created)="openBill($event)" />
    }

    <section class="panel" aria-labelledby="bills-title">
      <div class="panel-heading">
        <h2 id="bills-title">Factures</h2>
        @if (bills.hasValue()) {
          <span class="result-count">{{ bills.value().length }} {{ bills.value().length === 1 ? 'facture' : 'factures' }}</span>
        }
      </div>
      @if (bills.hasValue() && bills.value().length) {
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th scope="col">Facture</th><th scope="col">Date</th><th scope="col" class="text-end">Lignes</th>
                  <th scope="col" class="text-end">Total</th><th scope="col"><span class="visually-hidden">Action</span></th></tr>
            </thead>
            <tbody>
              @for (bill of bills.value(); track bill.id) {
                <tr>
                  <th scope="row">Facture n° {{ bill.id }}</th>
                  <td class="muted">{{ bill.billingDate | date:'d MMM y' }}</td>
                  <td class="text-end numeric">{{ bill.lineCount }}</td>
                  <td class="text-end numeric">{{ bill.total | currency:'MAD':'code' }}</td>
                  <td class="text-end">
                    <a class="button button-secondary" [routerLink]="['/bill-details', bill.id]"
                       [attr.aria-label]="'Voir la facture n° ' + bill.id">
                      Voir le détail <i class="bi bi-arrow-right" aria-hidden="true"></i>
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <app-view-state [loading]="bills.isLoading()" [error]="error()"
                        empty="Ce client n’a pas encore de facture." (retry)="reload()" />
      }
    </section>
  `,
})
export class BillsComponent {
  private readonly router = inject(Router);
  readonly customerId = input.required({ transform: numberAttribute });

  protected readonly customer = customerResource(this.customerId);
  protected readonly bills = billsResource(this.customerId);
  protected readonly creating = signal(false);
  protected readonly error = computed(() => {
    const error = this.bills.error();
    return error ? formatApiError(error, 'Impossible de charger les factures.') : '';
  });

  protected reload() {
    this.customer.reload();
    this.bills.reload();
  }

  protected openBill(id: number) {
    this.creating.set(false);
    void this.router.navigate(['/bill-details', id]);
  }
}
