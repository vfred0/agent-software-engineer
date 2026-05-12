// Ejemplo práctico: Detail simplificado
// Basado en pages/user/detail/user.component.ts

import { Component, inject } from '@angular/core';
import { KBQ_SIDEPANEL_DATA, KbqSidepanelService } from '@koobiq/components/sidepanel';
import { USER_SERVICE_TOKEN } from '../service.tokens';
import { UserDto, UserCreateDto } from '../user.mock';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-example-detail',
  template: `
    <kbq-sidepanel-header>
      <div class="kbq-title">
        {{ inEditMode ? 'Editar' : 'Crear' }} Usuario
      </div>
    </kbq-sidepanel-header>

    <kbq-sidepanel-body>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <input formControlName="fullName" placeholder="Nombre completo" />

        <button type="submit">
          {{ inEditMode ? 'Actualizar' : 'Crear' }}
        </button>
      </form>
    </kbq-sidepanel-body>
  `,
})
export class ExampleDetailComponent {
  panelData = inject(KBQ_SIDEPANEL_DATA);
  service = inject(USER_SERVICE_TOKEN);
  private sidePanel = inject(KbqSidepanelService);

  form = new FormGroup({
    fullName: new FormControl(''),
  });

  get inEditMode(): boolean {
    return this.panelData.inEditMode;
  }

  constructor() {
    // Si es edición, carga datos existentes
    if (this.inEditMode) {
      this.form.patchValue(this.panelData.item);
    }
  }

  submit() {
    if (this.form.invalid) return;

    const op = this.inEditMode
      ? this.service.patch(this.panelData.item.id, this.form.value)
      : this.service.create(this.form.value);

    op.onSuccess(() => this.sidePanel.closeAll());
  }

  // Computed para datos relacionados (ej. consultas)
  relatedData = computed(() => {
    const all = this.service.findAll.result() || [];
    return all.filter((item: any) => item.userId === this.panelData.item?.id);
  });
}
