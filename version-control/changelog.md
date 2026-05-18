# Changelog

## 1. PROPÓSITO

El changelog es el contrato de comunicación con los consumidores del proyecto. Responde a: "¿qué cambió entre la versión que tengo y la que voy a actualizar?"

Un buen changelog:
- Está escrito para el **usuario del paquete**, no para el desarrollador.
- Lista solo lo que **impacta al usuario** (no saltos de versión internos ni cambios puros de CI).
- Tiene **links verificables** a los commits para auditoría y trazabilidad.
- Sigue un formato **consistente, limpio y directo**.

---

## 2. FORMATO EXPERTO (LISTA PLANA)

A diferencia del formato tradicional agrupado por `### Features` o `### Bug Fixes`, el estándar experto (usado en repositorios corporativos maduros) mantiene una **lista plana** de cambios para cada versión bajo un subtítulo de proyecto, utilizando el tipo de commit como prefijo en texto plano.

Esto reduce el ruido visual, evita encabezados vacíos y facilita la lectura rápida cronológica.

```markdown
# 1.5.0 (2024-03-15)

### Nombre del Proyecto

 * bug fix  **tooltip:** allow iframe for examples in stable documentation ([3c2fd9c](link))
 * bug fix  **breadcrumbs:** overflow handling to include margin ([6b9246c](link))
 * feature  **modal:** make `KbqModalService` providedIn root ([4c304d7](link))
 * feature  **tags:** call onChange only on UI-initiated changes ([c20500e](link))

# 1.4.2 (2024-02-20)

### Nombre del Proyecto

 * bug fix  **navbar:** icon color in active state ([5a97c22](link))
```

**Mapeo de Conventional Commits al texto plano:**
- `feat` → `feature`
- `fix` → `bug fix`
- `refactor` → `refactor`
- `chore` → `chore`
- `docs` → `docs`

---

## 3. FORMATOS CLÁSICOS O LEGACY (A EVITAR)

### Keep a Changelog (Manual)
Usa agrupadores `### Added`, `### Fixed`, `### Changed`, etc. Difícil de mantener automatizado.

### Angular Preset (Generado Agrupado)
Agrupa automáticamente bajo `### Features`, `### Bug Fixes`, `### Chores`. Genera mucho ruido visual (encabezados repetitivos) en releases con pocos commits.

*Se prefiere siempre el Formato Experto de lista plana frente a este formato agrupado.*

---

## 4. QUÉ COMMITS APARECEN EN EL CHANGELOG

| Tipo | Aparece en el Changelog Experto |
|---|---|
| `feat` | ✅ (como `feature`) |
| `fix` | ✅ (como `bug fix`) |
| `refactor` | ✅ (como `refactor` - si aporta valor estructural) |
| `chore` | ✅ (como `chore` - dependencias clave o scripts relevantes) |
| `docs` | ✅ (como `docs` - documentación pública) |
| `BREAKING CHANGE` | ✅ (Requiere mención explícita o salto MAJOR) |
| internos (`bump version`, `initial commit`) | ✗ (Se deben **filtrar siempre**) |

---

## 5. GENERACIÓN AUTOMATIZADA

Para mantener el formato experto de lista plana y sincronizarlo perfectamente con los **GitHub Releases**, se recomienda utilizar un script (ej: bash parser con `git log`) que extraiga los commits convencionales y aplique el formato directamente. Esto evita dependencias pesadas como `semantic-release` y mantiene el control total del formato.

---

## 6. HEADING LEVEL POR TIPO DE VERSIÓN

Convención de jerarquía visual:

| Tipo de versión | Heading en Formato Experto |
|---|---|
| MINOR (`X.Y.0`) | `#` (H1) |
| MAJOR (`X.0.0`) | `#` (H1) |
| PATCH (`X.Y.Z`) | `#` (H1) |

Se utiliza `H1` para todas las versiones en el formato de lista plana para mantener el archivo limpio, acompañado de un subtítulo `### Nombre del Proyecto` o `### Koobiq` / `### Dental System` para separar el contexto si hay monorepos.

---

## 7. COMMIT DE ACTUALIZACIÓN DEL CHANGELOG

El commit que hace el bump de versión y actualiza `CHANGELOG.md` debe:

- Ser un `chore:` (este será filtrado y no aparecerá en la próxima versión).
- Dejar claro que incluye el changelog.

```
chore: bump version to 1.5.0 w/ changelog
```

---

## 8. ANTI-PATRONES CRÍTICOS

- **Changelog escrito a mano sin formato consistente** — imposible de parsear ni auditar.
- **Agrupar en exceso (Features / Fixes / Chores / etc.)** — rompe la legibilidad y genera títulos huecos.
- **Incluir cambios internos basura** (ej: `chore: bump version`) — ensucia la lista que los usuarios leen.
- **No linkear commits** — sin links cortos `([hash](url))` se pierde trazabilidad.
- **"See commit history for changes"** — el historial de git puro NO es un changelog.