# Pull Requests

## 1. PRINCIPIO FUNDAMENTAL

El PR es la unidad de revisión. Su título, descripción y proceso de merge deben ser predecibles y consistentes para que el historial de `main` sea legible meses después.

---

## 2. TÍTULO DEL PR

Si el proyecto usa **squash-merge** (un PR = un commit en `main`), el título del PR se convierte en el mensaje del commit. Por eso:

**El título del PR debe ser un mensaje de conventional commit válido.**

```
fix(select): prevent value reset on async options load    ✅
Feature: new button states                                ✗
Fixed the button                                          ✗
WIP                                                       ✗
```

Este principio se puede (y debe) validar automáticamente en CI ejecutando `commitlint` sobre el título del PR.

> **Ejemplo real (koobiq/angular-components):** `commitlint.yml` valida el título del PR en cada CI run. Si el título falla, el check bloquea el merge.

---

## 3. TEMPLATE DE PR

Un buen template de PR tiene tres preguntas que el autor debe responder:

```markdown
## Summary

<!-- Qué cambia y por qué. 2-4 oraciones. -->

## Notable changes

<!--
- **added** X because Y
- **updated** Z to fix W
- **removed** deprecated A
-->

## What should reviewers focus on?

<!-- Una área de riesgo o pregunta específica para el reviewer. -->
```

**Verbos recomendados para los bullets:** `added`, `updated`, `removed`, `fixed`, `refactored`.

El template se define en `.github/pull_request_template.md` (GitHub) o el equivalente de la plataforma.

---

## 4. FLUJO DE VIDA DE UN PR

```
1. Crear rama desde main
   git checkout -b fix/select-async-reset

2. Commits con conventional commits (pueden ser múltiples)

3. Abrir PR
   - Título = conventional commit válido
   - Llenar el template completo
   - Si no está listo: marcar como Draft

4. Cuando esté listo para review
   - Sacar del modo Draft ("Ready for review")
   - Asegurarse de que CI pasa

5. Code review
   - Al menos 1-2 approvals (según la política del equipo)

6. Merge
   - Estrategia: squash-merge (recomendado para mantener historial limpio)
   - El título del PR se convierte en el commit message en main
```

---

## 5. ESTRATEGIAS DE MERGE

| Estrategia | Historial en main | Cuándo usarla |
|---|---|---|
| **Squash merge** | Un commit por PR, limpio | Proyectos con muchos commits WIP por PR |
| **Merge commit** | Todos los commits del branch + merge commit | Cuando el historial granular del branch importa |
| **Rebase merge** | Commits del branch, sin merge commit | Cuando cada commit del branch es limpio y atómico |

**Recomendación:** squash-merge para la mayoría de los proyectos. Combina todos los commits del PR en uno solo cuyo mensaje es el título del PR — que ya validamos como conventional commit.

---

## 6. CHECKS DE CI ESPERADOS

Los checks mínimos que debe pasar un PR antes del merge:

| Categoría | Qué valida |
|---|---|
| **Commit format** | Título del PR como conventional commit |
| **Linting** | Estilo de código, formateo, reglas del linter (0 warnings) |
| **Tests** | Suite completa de tests unitarios |
| **Build** | El proyecto compila sin errores |
| **API guard** | Si el proyecto tiene API pública, que no haya cambios no aprobados |

Checks adicionales según el proyecto: e2e tests, cobertura mínima, análisis de seguridad, licencias, type-check.

---

## 7. SNAPSHOTS Y ASSETS VISUALES

Si el proyecto tiene tests de regresión visual (Playwright, Storybook visual tests, etc.) y los snapshots están desactualizados:

```
/approve-snapshots
# o el comando equivalente configurado en el proyecto
```

Esta convención — un comentario en el PR que dispara un workflow de actualización — evita tener que hacer el update manual en local y subir los archivos cambiados.

> **Ejemplo real (koobiq):** comentar `/approve-snapshots` dispara `e2e-approve-snapshots.yml`, que actualiza los `.png` y hace commit con `test: updated e2e snapshots`.

---

## 8. DRAFT PRs

Usar Draft PR cuando:
- El trabajo está en progreso y se quiere feedback temprano
- Se quiere que CI corra sin esperar review formal
- La rama aún no está lista para merge

No usar Draft como excusa para dejar PRs sin terminar indefinidamente. Un PR Draft que lleva más de una semana abierto es una señal de que algo está mal en la planificación.

---

## 9. ANTI-PATRONES

- **Título libre** — si hay squash-merge, el historial de `main` queda ilegible
- **Template vacío** — obliga al reviewer a adivinar el contexto
- **PR gigante** — más de 400 líneas de diff dificulta la review; dividir en PRs encadenados
- **Merge sin CI verde** — aunque "sea una corrección pequeña"
- **Mezclar concerns** — un PR debe tener una sola razón para existir
