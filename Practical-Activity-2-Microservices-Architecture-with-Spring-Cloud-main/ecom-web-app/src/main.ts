import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes, withComponentInputBinding } from '@angular/router';
import { AppComponent } from './app/app.component';

registerLocaleData(localeFr);

const routes: Routes = [
  { path: '', redirectTo: 'customers', pathMatch: 'full' },
  {
    path: 'customers',
    title: 'Clients · Facturation',
    loadComponent: () => import('./app/customers.component').then((m) => m.CustomersComponent),
  },
  {
    path: 'products',
    title: 'Produits · Facturation',
    loadComponent: () => import('./app/products.component').then((m) => m.ProductsComponent),
  },
  {
    path: 'bills/:customerId',
    title: 'Factures · Facturation',
    loadComponent: () => import('./app/bills.component').then((m) => m.BillsComponent),
  },
  {
    path: 'bill-details/:billId',
    title: 'Détail de la facture · Facturation',
    loadComponent: () => import('./app/bill-details.component').then((m) => m.BillDetailsComponent),
  },
  { path: '**', redirectTo: 'customers' },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes, withComponentInputBinding()),
    { provide: LOCALE_ID, useValue: 'fr' },
  ],
}).catch((error: unknown) => console.error(error));
