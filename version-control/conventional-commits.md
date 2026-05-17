# Conventional Commits

Especificación universal: https://www.conventionalcommits.org

## 1. FORMATO OBLIGATORIO

```
<type>(<scope>): <subject>

[body opcional]

[footer opcional]
```

- Header máximo recomendado: **72–120 caracteres** (cada proyecto define su límite; configurable en commitlint)
- `type` y `subject`: obligatorios
- `scope`: opcional según la convención del proyecto, pero fuertemente recomendado en monorepos

---

## 2. TIPOS ESTÁNDAR

| Tipo | Cuándo usarlo | Aparece en changelog |
|---|---|---|
| `feat` | Nueva funcionalidad visible para el usuario | ✅ |
| `fix` | Corrección de bug | ✅ |
| `perf` | Mejora de rendimiento | ✅ |
| `revert` | Revertir un commit anterior | ✅ |
| `docs` | Solo documentación | según config |
| `refactor` | Reestructuración sin nueva funcionalidad ni fix | según config |
| `test` | Agregar o corregir tests | ✗ |
| `ci` | Cambios en workflows de CI/CD | ✗ |
| `build` | Sistema de build, scripts, tooling | ✗ |
| `chore` | Mantenimiento general | ✗ |
| `style` | Formato, espacios — sin cambio de lógica | ✗ |

> `feat`, `fix` y `perf` siempre generan entrada en el changelog. El resto depende de la configuración de la herramienta de changelog del proyecto.

---

## 3. SCOPES

El scope identifica **qué parte del sistema** afecta el commit. Su definición es específica de cada proyecto.

**Patrones comunes:**

| Tipo de proyecto | Scopes típicos |
|---|---|
| Monorepo de paquetes | nombres de paquetes (`core`, `ui`, `cli`, `api`) |
| Librería de componentes | nombres de componentes (`button`, `select`, `modal`) |
| App por features | nombres de features (`auth`, `billing`, `dashboard`) |
| Infraestructura | servicios (`db`, `cache`, `queue`, `deploy`) |

**Cómo se validan:** los proyectos pueden definir un enum de scopes permitidos mediante `commitlint`. Si el proyecto no tiene commitlint configurado, el scope sigue siendo recomendado — solo que no se valida automáticamente.

```bash
# Ejemplo — scope de componente en librería de UI:
fix(select): prevent focus loss on external click

# Ejemplo — scope de feature en app:
feat(auth): add OAuth2 provider support

# Ejemplo — scope de paquete en monorepo:
chore(deps): bump typescript to 5.4.0
```

---

## 4. REGLAS DEL SUBJECT

- Imperativo presente: `add`, `fix`, `remove`, `update` — NO pasado ni gerundio
- Minúscula inicial
- Sin punto al final

```bash
# Correcto
fix(select): prevent focus loss on external click
feat(button): add loading state indicator

# Incorrecto
fix(select): Prevented focus loss.   # mayúscula + punto
feat(button): Adding loading state   # gerundio
```

---

## 5. BODY

Explicar **por qué** cambia el código, no qué cambia (el diff ya lo muestra).

```
fix(select): prevent value reset on async options load

Previously the control reset to null when options were provided
asynchronously, causing a visual flicker and form dirty state.
```

---

## 6. FOOTER — BREAKING CHANGES Y REFERENCIAS

### Breaking Change

```
refactor(button): remove deprecated `color` input

BREAKING CHANGE: The `color` input has been removed.
Use the `variant` input instead: [basic, primary, secondary].
```

El token `BREAKING CHANGE:` en el footer es lo que eleva el bump semver a **MAJOR** en herramientas automáticas (semantic-release, conventional-changelog).

### Deprecación

```
feat(tooltip): add `placement` as replacement for `position`

DEPRECATED: The `position` input will be removed in the next major version.
Use `placement` instead.
```

### Cierre de issue

```
Closes #42
Fixes #17
```

---

## 7. INTEGRACIÓN CON TRACKERS INTERNOS

Si el proyecto usa un tracker interno (Jira, Linear, etc.), la convención es incluir la referencia en el subject:

```
fix(navbar): icon color for active state (#DS-5019)
```

La posición y el formato de la referencia (`#DS-XXXX`, `[PROJ-123]`, etc.) la define cada equipo — lo importante es que sea consistente.

> **Ejemplo real (koobiq/angular-components):** los commits incluyen el ticket de su tracker interno `(#DS-XXXX)` en el subject y el número de PR `(#1234)` que GitHub agrega automáticamente al hacer squash-merge.
> ```
> fix(navbar): icon color for active state (#DS-5019) (#1572)
> ```

---

## 8. HERRAMIENTAS DE ENFORCEMENT

| Herramienta | Qué hace |
|---|---|
| `commitlint` | Valida el mensaje de cada commit contra las reglas definidas |
| `husky` | Ejecuta commitlint como hook `commit-msg` en cada `git commit` local |
| CI (GitHub Actions, GitLab CI) | Valida el título del PR / commits en el pipeline |

**Punto clave sobre PRs:** si el proyecto usa squash-merge, el mensaje del commit resultante en `main` es el **título del PR**. Esto significa que el título del PR también debe seguir el formato de conventional commit — y puede (y debe) validarse en CI.

---

## 9. COMMIT ESPECIAL: BUMP DE VERSIÓN

Cuando el proceso de release hace el bump de versión y actualiza el changelog, el commit de bump debe ser:

```
chore: bump version to X.Y.Z w/ changelog
```

Algunos equipos usan `chore(release):` como scope. Lo importante es que sea mecánico, legible y excluido del changelog de usuario.

> **Ejemplo real (koobiq):** el mensaje exacto es `chore: bump version to 19.8.0 w/ changelog`, generado por su CLI custom.
