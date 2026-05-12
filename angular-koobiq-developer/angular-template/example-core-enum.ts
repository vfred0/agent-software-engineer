// Ejemplo práctico: Enum y opciones para select
// Basado en core/enums/user.enum.ts

// 1. Definir el enum
export enum Gender {
  Male = 'M',
  Female = 'F',
  Other = 'O',
}

// 2. Interfaz Option (de core/utils/utils)
export interface Option<T> {
  id: T;
  name: string;
  data?: unknown;
}

// 3. Opciones para select (usa el enum)
export const GenderOptions: Option<Gender>[] = [
  { id: Gender.Male, name: 'Masculino' },
  { id: Gender.Female, name: 'Femenino' },
  { id: Gender.Other, name: 'Otro' },
];

// 4. Uso en componente de formulario
/*
<app-select
  formGroupKey="gender"
  label="Sexo"
  [options]="GenderOptions"
/>
*/
