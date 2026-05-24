# Release Workflow

## 1. FLUJO UNIVERSAL

Independientemente del lenguaje, framework o herramienta, todo release sigue este esquema:

```
Commits en main (o rama de release)
        ↓
Decidir el bump de versión (MAJOR / MINOR / PATCH)
        ↓
Generar changelog
        ↓
Commit de bump: "chore: bump version to X.Y.Z w/ changelog"
        ↓
Tag anotado: X.Y.Z
        ↓
Push del commit + push del tag
        ↓
CI/CD: publish al registry (npm, PyPI, Maven, etc.)
```

---

## 2. NIVELES DE AUTOMATIZACIÓN

| Nivel | Descripción | Herramientas |
|---|---|---|
| **Manual** | El equipo decide el bump, escribe el changelog y publica manualmente | Solo git + npm/pip/mvn |
| **Semi-automático** | CLI que genera el changelog y bump, pero el release manager decide cuándo | `standard-version`, `changesets`, CLI custom |
| **Automático** | CI/CD detecta el tipo de bump por los commits y publica sin intervención | `semantic-release` |

**Recomendación general:** empezar semi-automático. El release automático requiere mucha confianza en el proceso de commits y CI.

> **Ejemplo real (koobiq):** usa un enfoque semi-automático con una CLI custom. El release manager ejecuta `yarn run release:stage` de forma interactiva, elige el bump, y el CLI genera el changelog y el commit. El push del tag dispara la publicación automática en CI.

---

## 3. COMMIT DE BUMP

El commit que actualiza la versión en `package.json` (o `pyproject.toml`, `pom.xml`, etc.) y el changelog usa `chore:` para que no aparezca en el changelog del usuario:

```
chore: bump version to 1.5.0 w/ changelog
```

Variantes equivalentes según la herramienta:
```
chore(release): 1.5.0                    # semantic-release
chore: release 1.5.0                     # alternativa manual
```

---

## 4. TAG ANOTADO

Siempre usar tags anotados para releases — incluyen autor, fecha y mensaje:

```bash
# Crear tag anotado
git tag -a 1.5.0 -m "Release 1.5.0

- feat(tooltip): add placement input
- fix(select): prevent value reset on async options"

# Verificar
git show 1.5.0
```

**Convención de nombre del tag:** decidir si usar prefijo `v` o no, y ser consistente. El patrón del tag debe coincidir con el trigger de CI/CD.

```bash
# Sin prefijo v (patrón CI: *.*.*  o [0-9]+.[0-9]+.[0-9]+)
git tag -a 1.5.0

# Con prefijo v (patrón CI: v*.*.*)
git tag -a v1.5.0
```

---

## 5. PUSH Y TRIGGER DE CI

```bash
git push origin main          # sube el commit de bump
git push origin 1.5.0         # sube el tag → activa publish en CI
```

En GitHub Actions, el trigger se configura en el workflow de publish:

```yaml
# Sin prefijo v
on:
  push:
    tags:
      - '*.*.*'

# Con prefijo v
on:
  push:
    tags:
      - 'v*.*.*'
```

**El push del tag es lo que dispara la publicación.** El push del commit de bump solo actualiza el historial.

---

## 5b. GITHUB RELEASES — SINCRONIZAR EL CHANGELOG

GitHub tiene su propia sección de Releases (distinta del tag). Es la forma canónica de comunicar qué cambió a usuarios que no leen el `CHANGELOG.md` del repo. El puente entre ambos es `gh release create`.

### Flujo completo con `gh`

```bash
# 1. Push del commit de bump
git push origin main

# 2. Push del tag (DEBE hacerse antes de crear el release)
git push origin 1.5.0

# 3. Crear el GitHub Release apuntando al tag
gh release create 1.5.0 \
  --title "1.5.0" \
  --notes "$(cat <<'EOF'
## What's Changed
* feat(tooltip): add placement input as replacement for position in https://github.com/{owner}/{repo}/commit/{hash}
* feat(select): add clearable option in https://github.com/{owner}/{repo}/commit/{hash}
* fix(navbar): icon color in active state in https://github.com/{owner}/{repo}/commit/{hash}
* fix(select): prevent value reset on async options load in https://github.com/{owner}/{repo}/commit/{hash}

**Full Changelog**: https://github.com/{owner}/{repo}/compare/1.4.0...1.5.0
EOF
)"
```

### Extraer el bloque de una versión desde CHANGELOG.md

Si el `CHANGELOG.md` ya tiene el contenido formateado, se puede extraer el bloque de esa versión y pasarlo directamente:

```bash
# Extraer desde el heading de la versión hasta el siguiente heading de mismo nivel
awk '/^# 1\.5\.0/,/^# [0-9]/' CHANGELOG.md | head -n -1 | \
  gh release create 1.5.0 --title "1.5.0" --notes-file -
```

### Prereleases en GitHub Releases

```bash
gh release create 2.0.0-rc.1 \
  --title "2.0.0-rc.1 (Release Candidate)" \
  --prerelease \
  --notes "Pre-release for testing. Not recommended for production."
```

El flag `--prerelease` marca el release como pre-release en GitHub — no aparece como "Latest" para los usuarios.

### Verificar el release publicado

```bash
gh release view 1.5.0
gh release list              # lista todos los releases del repo
```

---

## 5c. GOTCHA — SSH vs HTTPS CON `gh`

`gh` autentica por HTTPS. Si el remote usa SSH (`git@github.com:...`), los push fallan con `Permission denied (publickey)` aunque `gh auth status` muestre "Logged in".

**Diagnóstico:**
```bash
gh auth status              # muestra: "Git operations protocol: https"
git remote -v               # si muestra git@github.com: → hay conflicto
```

**Fix:**
```bash
git remote set-url origin https://github.com/owner/repo.git
```

Después de este cambio, `git push` y `gh release create` funcionan sin configuración adicional.

---

## 6. PRERELEASES

```bash
# 1. Crear prerelease
git tag -a 2.0.0-rc.1 -m "Release 2.0.0-rc.1"
git push origin 2.0.0-rc.1

# npm: publicar con tag distinto a 'latest'
npm publish --tag next

# 2. Promover a estable cuando esté listo
git tag -a 2.0.0 -m "Release 2.0.0"
git push origin 2.0.0

# npm: publicar como latest
npm publish --tag latest
```

Los consumidores que usan `npm install @scope/package` solo reciben `latest`. Los que prueban prereleases instalan explícitamente: `npm install @scope/package@next`.

---

## 7. RELEASE BRANCHES (HOTFIXES)

Para proyectos que mantienen múltiples versiones activas simultáneamente:

```
main          →  1.5.x (development)
1.4.x branch  →  1.4.z (hotfixes para usuarios en 1.4)
1.3.x branch  →  1.3.z (hotfixes para usuarios en 1.3)
```

Un hotfix en `1.4.x`:

```bash
git checkout 1.4.x
# ... fix ...
git commit -m "fix(select): prevent crash on null options"
git tag -a 1.4.3 -m "Hotfix 1.4.3"
git push origin 1.4.x
git push origin 1.4.3
# → CI publica 1.4.3 en npm
```

---

## 8. CHECKLIST PRE-RELEASE

Antes de ejecutar el release, verificar manualmente:

```bash
# 1. main está limpio y actualizado
git status                    # sin cambios sin commitear
git log origin/main..HEAD     # sin commits sin pushear

# 2. Todos los checks de CI pasan en main

# 3. API pública no tiene cambios no aprobados (si aplica)
yarn run check-api            # o el equivalente del proyecto

# 4. No hay dependencias con vulnerabilidades críticas
npm audit --audit-level=critical   # o equivalente

# 5. El CHANGELOG.md refleja todos los cambios
```

---

## 9. ANTI-PATRONES CRÍTICOS

| Anti-patrón | Consecuencia |
|---|---|
| Push del tag sin commit de bump previo | El tag apunta al commit equivocado |
| Tag lightweight en lugar de anotado | Se pierden las release notes y metadata |
| Inconsistencia en el prefijo del tag | El trigger de CI no matchea y no hay publish |
| Breaking change publicado como MINOR | Rompe proyectos de usuarios — destruye confianza |
| Publicar desde local en lugar de CI | Inconsistencia de entorno, builds no reproducibles |
| Release sin CI verde en main | Publica código con tests fallando |
| Prerelease como excusa para saltear proceso | Un `rc` con bugs sin resolver es peor que no publicar |
| Remote SSH con `gh` en HTTPS | `Permission denied (publickey)` — usar `git remote set-url` para cambiar a HTTPS |
| Crear `gh release` antes de pushear el tag | El release apunta a un tag que no existe en GitHub |
