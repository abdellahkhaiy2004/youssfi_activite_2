import { HttpClient, HttpErrorResponse, HttpParams, httpResource } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { EMPTY, expand, map, reduce } from 'rxjs';

export interface Customer {
  id: number;
  name: string;
  email: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface BillSummary {
  id: number;
  billingDate: string;
  customerId: number;
  lineCount: number;
  total: number;
}

export interface BillDetail extends Omit<BillSummary, 'lineCount'> {
  customer: Customer | null;
  productItems: {
    id: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    product: Product | null;
  }[];
}

interface HalPage<T> {
  _embedded?: Record<string, T[]>;
  page: { number: number; size: number; totalPages: number; totalElements: number };
}

type BillLineInput = { productId: number; quantity: number };

const GATEWAY = 'http://localhost:8888';
const CUSTOMERS = GATEWAY + '/CUSTOMER-SERVICE/customers';
const PRODUCTS = GATEWAY + '/INVENTORY-SERVICE/products';
const BILLING = GATEWAY + '/BILLING-SERVICE';
const HAL = { Accept: 'application/hal+json' };
const PAGE_SIZE = 10;

function pagedCollection<T>(base: string, relation: string, searchEmail = false) {
  const page = signal(0);
  const query = signal('');
  const response = httpResource<HalPage<T>>(() => {
    let params = new HttpParams().set('page', page()).set('size', PAGE_SIZE).set('sort', 'id,asc');
    const search = query();
    if (search) {
      params = params.set('name', search);
      if (searchEmail) params = params.set('email', search);
    }
    return { url: base + (search ? '/search/by-query' : ''), params, headers: HAL };
  });
  const data = computed(() => response.hasValue() ? response.value() : undefined);

  return {
    page: page.asReadonly(),
    query: query.asReadonly(),
    rows: computed(() => data()?._embedded?.[relation] ?? []),
    metadata: computed(() => data()?.page),
    isLoading: response.isLoading,
    error: response.error,
    reload: () => response.reload(),
    move: (index: number) => page.set(index),
    search: (value: string) => {
      page.set(0);
      query.set(value.trim());
    },
  };
}

export function customerCollection() {
  return pagedCollection<Customer>(CUSTOMERS, 'customers', true);
}

export function productCollection() {
  return pagedCollection<Product>(PRODUCTS, 'products');
}

export function customerResource(id: () => number) {
  return httpResource<Customer>(() => ({ url: CUSTOMERS + '/' + id(), headers: HAL }));
}

export function billsResource(customerId: () => number) {
  return httpResource<BillSummary[]>(() => BILLING + '/bills?customerId=' + customerId());
}

export function billResource(billId: () => number) {
  return httpResource<BillDetail>(() => BILLING + '/fullBill/' + billId());
}

export function formatApiError(error: unknown, fallback: string) {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0 || error.status === 503) {
      return 'Le service est temporairement indisponible. Réessayez dans un instant.';
    }

    const detail = error.error?.detail;
    if (typeof detail === 'string' && error.status === 422) return detail;
  }

  return fallback;
}

@Injectable({ providedIn: 'root' })
export class BillingApi {
  private readonly http = inject(HttpClient);

  allProducts() {
    const getPage = (page: number) => this.http.get<HalPage<Product>>(PRODUCTS, {
      headers: HAL,
      params: { page, size: 100, sort: 'name,asc' },
    });

    return getPage(0).pipe(
      expand(({ page }) => page.number + 1 < page.totalPages ? getPage(page.number + 1) : EMPTY),
      map((data) => data._embedded?.['products'] ?? []),
      reduce((all, products) => all.concat(products), [] as Product[]),
    );
  }

  createBill(customerId: number, items: BillLineInput[]) {
    return this.http.post<BillDetail>(BILLING + '/bills', { customerId, items });
  }
}
