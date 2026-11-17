import { CurrencyPipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, input, output, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BillingApi, formatApiError } from './billing-api';
import { ViewStateComponent } from './view-state.component';

interface DraftLine {
  key: number;
  productId: number | null;
  quantity: number | null;
}

@Component({
  selector: 'app-create-bill',
  imports: [CurrencyPipe, FormsModule, ViewStateComponent],
  template: `
    <section class="panel create-panel" aria-labelledby="new-bill-title">
      <div class="panel-heading">
        <h2 id="new-bill-title">Nouvelle facture</h2>
        <button type="button" class="button button-secondary" [disabled]="saving()" (click)="cancel.emit()">Annuler</button>
      </div>
      @if (products(); as catalog) {
        @if (catalog.length) {
          <form class="bill-form" (ngSubmit)="submit()">
            <fieldset [disabled]="saving()">
              <legend class="visually-hidden">Articles à facturer</legend>
              @for (line of lines(); track line.key; let index = $index) {
                <div class="bill-form-row">
                  <label class="bill-product">Produit {{ index + 1 }}
                    <select class="form-select" required [name]="'product-' + line.key"
                            [ngModel]="line.productId" (ngModelChange)="update(line.key, { productId: $event })">
                      <option [ngValue]="null">Sélectionner un article</option>
                      @for (product of catalog; track product.id) {
                        <option [ngValue]="product.id">{{ product.name }} · {{ product.price | currency:'MAD':'code' }}</option>
                      }
                    </select>
                  </label>
                  <label>Quantité
                    <input class="form-control" type="number" min="1" max="2147483647" step="1" required
                           [name]="'quantity-' + line.key" [ngModel]="line.quantity"
                           (ngModelChange)="update(line.key, { quantity: $event })">
                  </label>
                  <button class="button button-secondary icon-button" type="button" [disabled]="lines().length === 1"
                          [attr.aria-label]="'Supprimer la ligne ' + (index + 1)" (click)="remove(line.key)">
                    <i class="bi bi-trash" aria-hidden="true"></i>
                  </button>
                </div>
              }
              <button class="button button-secondary" type="button" (click)="add()">
                <i class="bi bi-plus-lg" aria-hidden="true"></i> Ajouter une ligne
              </button>
            </fieldset>
            @if (submitError()) {
              <p class="form-error" role="alert">{{ submitError() }}</p>
            }
            <div class="bill-form-actions">
              <div><small class="subline">Total estimé</small><strong>{{ estimate() | currency:'MAD':'code' }}</strong></div>
              <button class="button button-primary" type="submit" [disabled]="saving() || !valid()">
                {{ saving() ? 'Enregistrement…' : 'Enregistrer la facture' }}
              </button>
            </div>
          </form>
        } @else {
          <app-view-state empty="Aucun article disponible dans le catalogue." />
        }
      } @else {
        <app-view-state [loading]="catalogResource.isLoading()" [error]="catalogError()"
                        (retry)="catalogResource.reload()" />
      }
    </section>
  `,
})
export class CreateBillComponent {
  private readonly api = inject(BillingApi);
  private readonly destroyRef = inject(DestroyRef);
  private nextKey = 2;

  readonly customerId = input.required<number>();
  readonly cancel = output<void>();
  readonly created = output<number>();
  protected readonly lines = signal<DraftLine[]>([{ key: 1, productId: null, quantity: 1 }]);
  protected readonly saving = signal(false);
  protected readonly submitError = signal('');
  protected readonly catalogResource = rxResource({ stream: () => this.api.allProducts() });
  protected readonly products = computed(() => this.catalogResource.hasValue() ? this.catalogResource.value() : undefined);
  protected readonly catalogError = computed(() => {
    const error = this.catalogResource.error();
    return error ? formatApiError(error, 'Impossible de charger le catalogue.') : '';
  });
  protected readonly valid = computed(() => this.lines().every((line) =>
    line.productId !== null && line.quantity !== null && Number.isInteger(line.quantity) &&
    line.quantity >= 1 && line.quantity <= 2147483647,
  ));
  protected readonly estimate = computed(() => {
    const prices = new Map(this.products()?.map(({ id, price }) => [id, price]));
    return this.lines().reduce((total, line) => {
      const price = line.productId === null ? 0 : prices.get(line.productId) ?? 0;
      return total + Math.round(price * 100) * (line.quantity ?? 0);
    }, 0) / 100;
  });

  protected update(key: number, patch: Partial<Omit<DraftLine, 'key'>>) {
    this.lines.update((lines) => lines.map((line) => line.key === key ? { ...line, ...patch } : line));
  }

  protected add() {
    this.lines.update((lines) => [...lines, { key: this.nextKey++, productId: null, quantity: 1 }]);
  }

  protected remove(key: number) {
    this.lines.update((lines) => lines.filter((line) => line.key !== key));
  }

  protected submit() {
    if (this.saving() || !this.valid()) return;

    this.submitError.set('');
    this.saving.set(true);
    const items = this.lines().map((line) => ({ productId: line.productId!, quantity: line.quantity! }));
    this.api.createBill(this.customerId(), items).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.saving.set(false)),
    ).subscribe({
      next: (bill) => this.created.emit(bill.id),
      error: (error: unknown) => this.submitError.set(formatApiError(error, 'Impossible de créer la facture.')),
    });
  }
}
