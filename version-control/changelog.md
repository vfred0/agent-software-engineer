# Changelog

## 1. PROPÓSITO

El changelog es el contrato de comunicación con los consumidores del proyecto. Responde a: "¿qué cambió entre la versión que tengo y la que voy a actualizar?"

Un buen changelog:
- Está escrito para el **usuario del paquete**, no para el desarrollador
- Lista solo lo que **impacta al usuario** (no refactors internos, no cambios de CI)
- Tiene **links verificables** a PRs y commits para auditoría
- Sigue un formato **consistente y parseable**

---

## 2. FORMATO KEEP A CHANGELOG

Estándar de la industria: https://keepachangelog.com

```markdown
# Changelog

## [Unreleased]

## [1.5.0] - 2024-03-15

### Added
- New `placement` input for `tooltip` component (#123)

### Fixed
- Select resets value when options load asynchronously (#117)

### Changed
- `position` input deprecated in favor of `placement`

### Removed
- Removed `color` input from `button` (use `variant` instead)

### Breaking Changes
- `color` input removed — update all usages to `variant`

## [1.4.2] - 2024-02-20

### Fixed
- Navbar icon color in active state (#109)
```

**Secciones estándar (en orden):** `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`, `Breaking Changes`.

---

## 3. FORMATO GENERADO POR CONVENTIONAL-CHANGELOG

El preset `angular` de `conventional-changelog` genera un formato distinto, más automatizado:

```markdown
# 1.5.0 (2024-03-15)         ← MINOR o MAJOR: H1

### Features

* **tooltip:** add `placement` input ([#DS-4901](link)) ([#123](link)) ([a3f2b1c](link))

### Bug Fixes

* **select:** prevent value reset on async options load ([#DS-4858](link)) ([#117](link)) ([c1a8e3f](link))

### BREAKING CHANGES

* **button:** `color` input removed. Use `variant` instead.

## 1.4.2 (2024-02-20)        ← PATCH: H2

### Bug Fixes

* **navbar:** icon color in active state ([#DS-5019](link)) ([#109](link)) ([5a97c22](link))
```

**Variante personalizada (koobiq):** usa categorías como texto plano (`bug fix`, `feature`) en lugar de headers, y el heading H1/H2 depende de si es minor/major vs patch.

---

## 4. QUÉ COMMITS APARECEN EN EL CHANGELOG

| Tipo | Aparece | Sección |
|---|---|---|
| `feat` | ✅ | Features / Added |
| `fix` | ✅ | Bug Fixes / Fixed |
| `perf` | ✅ | Performance |
| `revert` | ✅ | Reverts |
| `docs` | según config | Docs |
| `refactor` | según config | Refactors |
| `BREAKING CHANGE` footer | ✅ | Breaking Changes |
| `chore`, `test`, `ci`, `build`, `style` | ✗ | — |

---

## 5. HERRAMIENTAS DE GENERACIÓN

| Herramienta | Descripción | Cuándo usarla |
|---|---|---|
| `conventional-changelog-cli` | Genera changelog desde commits convencionales | CLI simple, control manual |
| `standard-version` | Bump de versión + changelog en un comando | Proyectos sin CI automatizado |
| `semantic-release` | Release completamente automatizado desde CI | Proyectos con CI sólido y confianza en el proceso |
| `changesets` | Manejo de changelog por paquete en monorepos | Monorepos con versiones independientes |
| CLI custom | Control total sobre el formato | Proyectos con necesidades muy específicas |

> **Ejemplo real (koobiq):** usa una CLI custom en `packages/cli/src/release/` que internamente usa `conventional-changelog` con el preset `angular` y templates Handlebars propios — para tener un formato de changelog particular sin adoptar ninguna herramienta completa.

---

## 6. HEADING LEVEL POR TIPO DE VERSIÓN

Convención del preset angular de conventional-changelog:

| Tipo de versión | Heading |
|---|---|
| MINOR (`X.Y.0`) | `#` (H1) |
| MAJOR (`X.0.0`) | `#` (H1) |
| PATCH (`X.Y.Z`) | `##` (H2) |

Esto hace que las versiones de feature sean más prominentes visualmente que los hotfixes.

---

## 7. COMMIT DE ACTUALIZACIÓN DEL CHANGELOG

El commit que hace el bump de versión y actualiza `CHANGELOG.md` debe:

- Ser un `chore:` (no aparece en el changelog del usuario)
- Dejar claro que incluye el changelog

```
chore: bump version to 1.5.0 w/ changelog
chore(release): 1.5.0                         # alternativa con semantic-release
```

---

## 8. ANTI-PATRONES

- **Changelog escrito a mano sin formato consistente** — imposible de parsear ni comparar entre versiones
- **"See commit history for changes"** — el commit history no es un changelog para usuarios
- **Incluir cambios internos** (`chore`, refactors) — ruido sin valor para el consumidor
- **No linkear PRs ni commits** — sin links no hay trazabilidad para auditorías
- **Acumular "Unreleased" sin versionar** — si hay muchos cambios sin fecha, el changelog pierde utilidad
