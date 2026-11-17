import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  template: `
    <a class="skip-link" href="#main">Aller au contenu</a>
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" routerLink="/customers">
          <span class="brand-mark"><i class="bi bi-receipt" aria-hidden="true"></i></span>
          <span>Facturation</span>
        </a>
        <nav class="workspace-nav" aria-label="Navigation principale">
          <a routerLink="/customers"
             [class.active]="!inProducts()"
             [attr.aria-current]="!inProducts() ? 'location' : null">
            <i class="bi bi-people" aria-hidden="true"></i> Clients
          </a>
          <a routerLink="/products"
             [class.active]="inProducts()"
             [attr.aria-current]="inProducts() ? 'page' : null">
            <i class="bi bi-box-seam" aria-hidden="true"></i> Produits
          </a>
        </nav>
      </aside>
      <main id="main" class="workspace" tabindex="-1">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AppComponent {
  private readonly router = inject(Router);
  protected readonly inProducts = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.split(/[?#]/)[0] === '/products'),
    ),
    { initialValue: false },
  );
}
