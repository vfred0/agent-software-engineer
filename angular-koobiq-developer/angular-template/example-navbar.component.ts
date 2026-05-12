// Ejemplo práctico: Navbar con toggle Desktop/Mobile
// Basado en shared/components/navbar/navbar.component.ts

import { Component, inject } from '@angular/core';
import { BreakpointService } from './breakpoint.service';

@Component({
  selector: 'app-example-navbar',
  template: `
    @if (breakpoint.isMobile()) {
      <!-- Mobile: Menú compacto -->
      <div class="mobile-nav">
        @for (item of menuItems; track item.name) {
          <a [href]="item.redirectTo">{{ item.name }}</a>
        }
      </div>
    } @else {
      <!-- Desktop: Sidebar + menú -->
      <div class="desktop-nav" style="width: 240px;">
        <div class="logo">Mi App</div>
        @for (item of menuItems; track item.name) {
          <a [routerLink]="item.redirectTo">{{ item.name }}</a>
        }
      </div>
    }
  `,
})
export class ExampleNavbarComponent {
  breakpoint = inject(BreakpointService);
  menuItems = [
    { icon: 'house', name: 'Dashboard', redirectTo: '/dashboard' },
    { icon: 'user', name: 'Usuarios', redirectTo: '/usuarios' },
  ];
}
