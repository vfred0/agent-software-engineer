# Semantic Versioning (Semver)

Especificación: https://semver.org

## 1. ESQUEMA

```
MAJOR.MINOR.PATCH

1.4.2   ✅
v1.4.2  puede usarse en tags de git, pero el prefijo v es convención — definirlo por proyecto
```

**Significado de cada número:**

| Parte | Cuándo se incrementa | Los otros números |
|---|---|---|
| `MAJOR` | Breaking change — rompe la API pública | MINOR y PATCH vuelven a 0 |
| `MINOR` | Nueva funcionalidad — backwards compatible | PATCH vuelve a 0 |
| `PATCH` | Bug fix — backwards compatible | — |

---

## 2. QUÉ ES UN BREAKING CHANGE

Un breaking change es cualquier modificación que obliga a los consumidores a cambiar su código para seguir funcionando:

- Eliminar o renombrar una función/método de la API pública
- Cambiar la firma de una función (tipos de parámetros, nombre de parámetros obligatorios)
- Cambiar el tipo de retorno
- Cambiar el comportamiento de una función de forma incompatible
- Eliminar un campo de una estructura de datos pública
- Cambiar el formato de un archivo de configuración

Lo que NO es breaking change: agregar funcionalidad nueva, agregar parámetros opcionales, cambios internos de implementación, mejoras de performance.

---

## 3. PRERELEASES

Para versiones aún no estables:

```
1.0.0-alpha.1     # primera alpha
1.0.0-beta.3      # tercera beta
1.0.0-rc.1        # primer release candidate
1.0.0-rc.12       # doceavo release candidate
1.0.0             # versión estable final (promueve el rc)
```

Orden de precedencia: `alpha < beta < rc < stable`

Las prereleases son útiles para:
- Recopilar feedback de early adopters antes del release oficial
- Probar breaking changes en proyectos reales sin afectar a todos los usuarios
- Habilitar CI/CD de proyectos dependientes contra la versión candidata

---

## 4. TAGS DE GIT

Los tags de git marcan commits específicos como versiones. Dos tipos:

| Tipo | Comando | Cuándo usar |
|---|---|---|
| **Anotado** | `git tag -a 1.4.2 -m "Release 1.4.2"` | Releases — incluye metadata (autor, fecha, mensaje) |
| **Lightweight** | `git tag 1.4.2` | Tags temporales o locales — sin metadata |

**Siempre usar tags anotados para releases.** El mensaje del tag puede contener las release notes.

**Convención de prefijo:** algunos proyectos usan `v1.4.2`, otros `1.4.2`. Elegir uno y ser consistente. Lo importante es que el patrón sea predecible para los workflows de CI/CD.

> **Ejemplo real (koobiq):** usa `X.Y.Z` sin prefijo `v`. Su `publish.yml` se activa con el patrón `*.*.*`. Si se usara `v1.4.2`, el trigger `*.*.*` no lo matchearía — definir el patrón en CI y en los tags de forma consistente.

---

## 5. RELACIÓN CONVENTIONAL COMMITS → SEMVER

Con herramientas automáticas (semantic-release, conventional-changelog + bumping script):

| Tipo de commit | Bump automático |
|---|---|
| `fix:` | PATCH |
| `feat:` | MINOR |
| `BREAKING CHANGE:` en footer | MAJOR |

**Sin automatización:** el bump es una decisión humana deliberada basada en el análisis de los commits desde el último tag. El release manager decide qué bump corresponde.

> **Ejemplo real (koobiq):** el bump es siempre manual vía un CLI interactivo. No se determina automáticamente por los commits — la decisión es consciente.

---

## 6. MONOREPOS — VERSIONING STRATEGIES

| Estrategia | Descripción | Cuándo usar |
|---|---|---|
| **Versión unificada** | Todos los paquetes comparten la misma versión | Paquetes altamente cohesivos que siempre se liberan juntos |
| **Versiones independientes** | Cada paquete tiene su propio ciclo de versiones | Paquetes con ciclos de vida independientes |

> **Ejemplo real (koobiq):** versión unificada — los 6 paquetes (`@koobiq/components`, `@koobiq/cdk`, etc.) siempre tienen el mismo número de versión.

Herramientas para monorepos: Lerna, Nx Release, Changesets (para versiones independientes con CHANGELOG por paquete).

---

## 7. CONTEXTO ESPECIAL: SINCRONIZACIÓN CON DEPENDENCIAS MAYORES

Algunos proyectos síncronían su MAJOR con una dependencia core. Ejemplo: una librería de componentes para Angular puede llevar el mismo MAJOR que Angular (Angular 19 → librería `19.x.x`). Esto le comunica a los usuarios de forma inmediata qué versión de Angular es compatible.

Esta es una decisión de proyecto, no parte de la especificación semver. Se documenta explícitamente en el README o CONTRIBUTING del proyecto.

---

## 8. ANTI-PATRONES

- **MAJOR para todo** — si cada release es major, semver pierde sentido
- **Ignorar breaking changes** — publicar breaking changes como MINOR destruye la confianza
- **Tags sin anotar** — se pierden las release notes y la metadata de quién hizo el release
- **Inconsistencia de prefijo `v`** — mezclar `v1.4.2` y `1.4.3` en el mismo repo rompe los triggers de CI
- **Prerelease sin plan de estabilización** — publicar `rc.1` y nunca el estable es peor que no publicar
