// Ejemplo práctico: Configuración de entorno
// Basado en environments/environment.ts

export interface AppConfig {
  apiBaseUrl: string;
  useInMemory: boolean;
}

const baseUrl = 'http://localhost:3000';

// Producción (o desarrollo sin InMemory)
export const environment: AppConfig = {
  apiBaseUrl: `${baseUrl}/api`,
  useInMemory: false, // <-- CAMBIAR A true para InMemory
};

// ---- Cómo usar en servicio ----
import { environment } from './environment';

export class ExampleService {
  private apiUrl = `${environment.apiBaseUrl}/users`;

  constructor() {
    if (environment.useInMemory) {
      console.log('Usando servicio InMemory');
    } else {
      console.log('Usando JSON-Server en', this.apiUrl);
    }
  }
}
