// Ejemplo práctico: Formulario dinámico
// Basado en pages/user/detail/user.form.ts

import { Component, input, viewProvider } from '@angular/core';
import { ControlContainer, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { GenderOptions } from './example-core-enum';

@Component({
  selector: 'app-example-form',
  imports: [ReactiveFormsModule, KbqTabsModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
  template: `
    <!-- El formGroup lo hereda del padre via ControlContainer -->
    <kbq-tab-group>
      <kbq-tab label="Datos Personales">
        <div class="kbq-form-vertical">
          <!-- formGroupKey vincula a la clave del FormGroup padre -->
          <input
            formGroupKey="fullName"
            placeholder="Nombres y apellidos"
            class="o-layout-fill-available"
          />

          <select formGroupKey="gender" class="o-layout-fill-available">
            @for (opt of GenderOptions; track opt.id) {
              <option [value]="opt.id">{{ opt.name }}</option>
            }
          </select>
        </div>
      </kbq-tab>

      <kbq-tab label="Contacto">
        <input formGroupKey="phone" placeholder="Teléfono" />
      </kbq-tab>
    </kbq-tab-group>
  `,
})
export class ExampleFormComponent {
  // Inputs dinámicos desde el padre
  extraOptions = input<Option<any>[]>();
}
