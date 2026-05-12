// Ejemplo práctico: Explorer completo con Filter Bar, SearchCriteria, PageService
// Basado en pages/user/explorer/user-explorer.component.ts

import { Component, computed, effect, inject } from '@angular/core';
import { KbqSidepanelService, KbqSidepanelSize } from '@koobiq/components/sidepanel';
import { USER_SERVICE_TOKEN } from '../service.tokens';
import { UserDto } from '../user.mock';
import { SearchCriteriaService, PageService } from '../crud';
import { userFilter } from '@core/models/filters/user.filter';
import { BreakpointService } from '@services/breakpoint.service';

@Component({
  selector: 'app-example-explorer',
  template: `
    <div class="o-layout-column" style="gap: var(--kbq-size-xl);">
      <!-- FILTER BAR con filter, searchable, y slot para botón -->
      <app-filter-bar
        [filter]="userFilter"        <!-- Configuración de filtros (date + role) -->
        [searchable]="true"             <!-- Muestra input de búsqueda -->
      >
        <!-- Botón de crear en el slot="action" -->
        <app-button
          slot="action"
          (action)="create()"
          [icon]="'plus'"
          [text]="'Crear usuario'"
          class="o-layout-max-width"
        />
      </app-filter-bar>

      <!-- Contenedor con transición suave -->
      <div class="c-transition-grid">
        @if (isLoading()) {
          <!-- SKELETON ANIMADO -->
          <div class="c-skeleton-table" animate.enter="c-animate-in" animate.leave="c-animate-out">
            <div class="c-skeleton-table__header">
              <kbq-skeleton [style.height.px]="20" />
              <kbq-skeleton [style.height.px]="20" />
              <kbq-skeleton [style.height.px]="20" />
            </div>
            @for (_ of Array.from({ length: 8 }); track $index) {
              <div class="c-skeleton-table__row">
                <kbq-skeleton [style.height.px]="20" />
                <kbq-skeleton [style.height.px]="20" />
                <kbq-skeleton [style.height.px]="20" />
              </div>
            }
          </div>
        } @else {
          @if (service.findAll.isCompleted()) {
            @if (service.findAll.containsData()) {
              <table
                [border]="true"
                class="o-layout-fill-available"
                kbq-table
                animate.enter="c-animate-in"
                animate.leave="c-animate-out"
              >
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Teléfono</th>
                    @if (!breakpointService.isMobile()) {
                      <th>Resumen Clínico</th>
                    }
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of service.findAll.result(); track user.id) {
                    <tr>
                      <td>{{ user.fullName }}</td>
                      <td><app-phone-badge [value]="user.phone" /></td>
                      @if (!breakpointService.isMobile()) {
                        <td>
                          <div class="o-layout-row o-layout-row-wrap">
                            <app-badge>
                              <div class="kbq-text-compact-strong">
                                {{ getConsultationsCount(user.id) }} Consulta{{ getConsultationsCount(user.id) !== 1 ? 's' : '' }}
                              </div>
                            </app-badge>
                            <app-badge>
                              <div class="kbq-text-compact-strong">
                                {{ getTreatmentsCount(user.id) }} Tratamiento{{ getTreatmentsCount(user.id) !== 1 ? 's' : '' }}
                              </div>
                            </app-badge>
                          </div>
                        </td>
                      }
                      <td>
                        @if (breakpointService.isMobile()) {
                          <app-popover-actions #actionsPopover [content]="actionsContent" [withLabel]="false" />
                          <ng-template #actionsContent>
                            <div class="o-layout-column" style="gap: var(--kbq-size-s);">
                              <app-button
                                (action)="openEdit(user); actionsPopover.hide()"
                                variant="edit"
                                text="Editar Datos"
                                class="o-layout-fill-available"
                              />
                              <app-button
                                (action)="this.onDelete(user.id); actionsPopover.hide()"
                                [requireConfirm]="true"
                                variant="trash"
                                text="Eliminar"
                                class="o-layout-fill-available"
                              />
                            </div>
                          </ng-template>
                        } @else {
                          <app-button (action)="openEdit(user)" variant="edit" text="" />
                          <app-button
                            (action)="this.onDelete(user.id)"
                            [requireConfirm]="true"
                            variant="trash"
                            text=""
                          />
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <kbq-empty-state style="min-height: 216px" animate.enter="c-animate-in" animate.leave="c-animate-out">
                <div kbq-empty-state-title>Sin resultados</div>
                <div kbq-empty-state-text>No se han encontrado usuarios registrados.</div>
              </kbq-empty-state>
            }
          }
        }
      </div>
    </div>
  `,
  providers: [SearchCriteriaService, PageService], // Cada explorer tiene sus propios criterios
})
export class ExampleExplorerComponent {
  protected readonly service = inject(USER_SERVICE_TOKEN);
  protected readonly userFilter = userFilter; // Importado de @core/models/filters/user.filter
  protected readonly breakpointService = inject(BreakpointService);
  private readonly sidePanel = inject(KbqSidepanelService);

  // Inyección de servicios de criterios (se proveen en 'providers')
  private readonly searchCriteriaService = inject(SearchCriteriaService);
  private readonly pageService = inject(PageService);

  constructor() {
    // Configura el servicio con los criterios y paginación
    this.service.configure({
      criteria: this.searchCriteriaService,
      page: this.pageService,
    });

    // Ejecuta findAll automáticamente cuando cambian los criterios
    effect(() => {
      this.service.findAll();
    });
  }

  // Loading combinado (podría incluir otros servicios)
  isLoading = computed(() =>
    this.service.findAll.isLoading()
  );

  // Helpers para mostrar datos relacionados
  getConsultationsCount = (userId: number) =>
    (this.otherService.findAll.result() || []).filter((c: any) => String(c.userId) === String(userId)).length;
  getTreatmentsCount = (userId: number) =>
    (this.treatmentService.findAll.result() || []).filter((t: any) => String(t.userId) === String(userId)).length;

  // Acciones
  create = () => this.openSidepanel({}, false, 'edit');
  openEdit = (user: UserDto) => this.openSidepanel(user, true, 'edit');
  openHistory = (user: UserDto) => this.openSidepanel(user, true, 'history');

  private openSidepanel(user: Partial<UserDto>, inEditMode: boolean, mode: 'edit' | 'history') {
    this.sidePanel.open(ExampleDetailComponent, {
      data: { user, inEditMode, mode },
      size: KbqSidepanelSize.Medium,
    });
  }

  protected onDelete = (id: number) => this.service.delete(id);

  // Opcional: otros servicios para datos relacionados
  private readonly otherService = inject(CONSULTATION_SERVICE_TOKEN);
  private readonly treatmentService = inject(TREATMENT_SERVICE_TOKEN);
}
