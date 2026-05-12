// Ejemplo práctico: Servicio con Operation y InMemory
// Basado en shared/services/users/user.service.ts y user-in-memory.service.ts

import { createOperation } from './operations';
import { BaseCrudService } from './base-crud.service';
import { UserDto, UserCreateDto } from './user.mock';

// ---- SERVICIO REGULAR (JSON-Server) ----
export class UserService extends BaseCrudService {
  private apiUrl = 'http://localhost:3000/api/users';

  // Operation para listar todos
  readonly findAll = createOperation(
    () => {
      const query = this.criteria?.value?.query; // SearchCriteria
      const url = query ? `${this.apiUrl}?q=${query}` : this.apiUrl;
      return this.http.get<UserDto[]>(url); // HttpClient
    },
    (err) => this.handleError(err),
  );

  // Operation para crear (trackId = true)
  readonly create = createOperation(
    (data: UserCreateDto) => this.http.post<UserDto>(this.apiUrl, data),
    (err) => this.handleError(err),
    true, // trackId: evita duplicados
  ).onSuccess(() => {
    this.findAll(); // Refresca lista
    console.log('Usuario creado');
  });
}

// ---- SERVICIO IN-MEMORY ----
export class UserInMemoryService extends BaseCrudService {
  public store = new Map<number, UserDto>();
  private nextId = 1;

  constructor() {
    super();
    // Cargar mocks iniciales
    const mocks: UserDto[] = [
      { id: 1, fullName: 'Juan Pérez', gender: Gender.Male },
      // ... más mocks
    ];
    mocks.forEach(u => this.store.set(u.id, u));
  }

  readonly findAll = createOperation(
    () => {
      const query = this.criteria?.value?.query;
      let users = [...this.store.values()];
      if (query) {
        const q = query.toLowerCase();
        users = users.filter(u =>
          u.fullName.toLowerCase().includes(q)
        );
      }
      return of(users).pipe(delay(500)); // Simula latencia
    },
    (err) => this.handleError(err),
  );

  readonly create = createOperation(
    (data: UserCreateDto) => {
      const newUser: UserDto = { ...data, id: this.nextId++ };
      this.store.set(newUser.id, newUser);
      return of(newUser);
    },
    (err) => this.handleError(err),
    true,
  ).onSuccess(() => this.findAll());
}
