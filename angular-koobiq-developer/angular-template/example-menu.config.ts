// Ejemplo práctico: Configuración de menú
// Basado en core/utils/menu/menu.config.ts y route.paths.ts

export const RoutePath = {
  Dashboard: 'dashboard',
  Users: 'usuarios',
  Treatments: 'tratamientos',
} as const;

export interface Menu {
  icon: string;
  name: string;
  redirectTo?: string;
}

const dashboardMenu: Menu = {
  icon: 'house',
  name: 'Dashboard',
  redirectTo: RoutePath.Dashboard,
};

const userMenu: Menu = {
  icon: 'user',
  name: 'Usuarios',
  redirectTo: RoutePath.Users,
};

// Estrategia de menú
class AllMenuStrategy {
  getItems(): Menu[] {
    return [dashboardMenu, userMenu];
  }
}

// Factory para crear estrategia (puedes cambiar según rol)
export class MenuStrategyFactory {
  static create(): Menu[] {
    return new AllMenuStrategy().getItems();
  }
}

// ---- Uso en Navbar ----
/*
@Component({ ... })
export class ExampleNavbar {
  menuItems = MenuStrategyFactory.create();
}
*/
