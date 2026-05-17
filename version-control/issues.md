# Issues

## 1. PROPÓSITO DE UN ISSUE

Un issue es una unidad de trabajo rastreable. Puede ser un bug, una feature request o una pregunta. La clave es que sea **accionable**: quien lo lea debe poder entender exactamente qué hay que hacer (o investigar) sin necesidad de contexto adicional.

---

## 2. TIPOS DE ISSUE

| Tipo | Cuándo usar |
|---|---|
| **Bug report** | Comportamiento inesperado, error reproducible |
| **Feature request** | Nueva funcionalidad o mejora al comportamiento actual |
| **Question / Discussion** | Duda sobre el uso, diseño o dirección del proyecto |
| **Task** | Trabajo técnico que no es bug ni feature (refactor, deuda técnica) |

---

## 3. BUG REPORT — ESTRUCTURA MÍNIMA

Un bug sin pasos de reproducción no se puede verificar. Sin verificación, no se puede cerrar. Estructura obligatoria:

```markdown
## Description
Qué está fallando y en qué contexto.

## Reproduction steps
1. Hacer X
2. Configurar Y con valor Z
3. Observar el resultado

## Expected behavior
Lo que debería suceder en lugar de lo que pasa.

## Environment
- Versión del paquete/librería:
- Sistema operativo:
- Browser (si aplica):
```

Campos adicionales útiles: screenshots, GIFs, logs de consola, versión del lenguaje/runtime.

**En GitHub** se define como un template YAML en `.github/ISSUE_TEMPLATE/BUG-REPORT.yml`. Esto permite marcar campos como requeridos y agregar dropdowns para browsers y OS.

> **Ejemplo real (koobiq):** el template YAML asigna automáticamente el label `bug` y fuerza el título al formato `🐛 [BUG] - <descripción>`. Los campos de reproduction steps y expected behavior son `render: bash`, lo que los muestra como bloques de código.

---

## 4. FEATURE REQUEST — ESTRUCTURA MÍNIMA

```markdown
## Problem
Qué problema resuelve esta feature. Por qué existe la necesidad.

## Proposed solution
Cómo debería comportarse la nueva funcionalidad.

## Alternatives considered
Qué otras opciones se evaluaron y por qué se descartaron.
```

---

## 5. LABELS

Los labels permiten filtrar y priorizar. Esquema mínimo recomendado:

| Label | Significado |
|---|---|
| `bug` | Comportamiento incorrecto confirmado |
| `feature` | Nueva funcionalidad |
| `good first issue` | Apto para contribuidores nuevos |
| `wontfix` | Reconocido pero no se va a resolver |
| `needs-reproduction` | Falta un caso de reproducción claro |
| `blocked` | Depende de otro issue o PR |

---

## 6. RELACIÓN ISSUES ↔ COMMITS ↔ PRs

```
Issue #42 (bug: select resets value)
    ↓
Commit: fix(select): prevent value reset on async options load
    ↓
PR: fix(select): prevent value reset on async options load
    body: "Closes #42"
    ↓
Merge → issue #42 se cierra automáticamente
```

**Para cerrar un issue automáticamente al mergearse el PR**, incluir en el body del PR (no en el commit):

```
Closes #42
Fixes #17
Resolves #99
```

GitHub (y GitLab) reconocen estas keywords y cierran el issue al hacer merge a la rama default.

---

## 7. TRACKERS INTERNOS VS ISSUES PÚBLICOS

Muchos equipos usan un tracker interno (Jira, Linear, Notion) para la planificación y GitHub Issues para la comunidad. Son dos sistemas distintos:

| Sistema | Para qué |
|---|---|
| Tracker interno (`DS-XXXX`, `PROJ-123`) | Planificación interna, sprints, roadmap |
| GitHub Issues (`#42`) | Reporte público de bugs y features |

Un mismo trabajo puede tener referencia en ambos. En ese caso, el commit puede citar los dos:

```
fix(select): prevent value reset (#DS-5019)

Closes #42
```

---

## 8. ANTI-PATRONES

- **Bug sin pasos de reproducción** — sin ellos no se puede verificar ni cerrar
- **Un issue para múltiples bugs** — un issue = un problema
- **Usar issues como chat** — para discusiones usar Discussions o Slack
- **Dejar issues abiertos sin triage** — issues sin respuesta en más de 2 semanas alejan contribuidores
