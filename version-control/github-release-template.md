# GitHub Release Template

Este documento establece el estándar profesional para generar las notas de versión (Release Notes) en GitHub. 

A diferencia del archivo `CHANGELOG.md` que puede tener secciones agrupadas (`### Features`, `### Bug Fixes`, etc.), los GitHub Releases deben presentar una **lista plana, limpia y directa** de los cambios, enlazando directamente al código. 

No agrupes los commits por tipo en el GitHub Release. Deja que el mensaje del commit (Conventional Commits) hable por sí mismo.

---

## 1. El Formato Estándar

Todo GitHub Release debe seguir exactamente esta estructura: un encabezado `## What's Changed`, la lista plana de commits con su autor y enlace, y un pie de página con el enlace al comparador completo.

```markdown
## What's Changed
* {commit_message_1} in {commit_url_1}
* {commit_message_2} in {commit_url_2}
* {commit_message_3} in {commit_url_3}

**Full Changelog**: https://github.com/{owner}/{repo}/compare/{previous_tag}...{new_tag}
```

---

## 2. Ejemplo Práctico

```markdown
## What's Changed
* refactor(treatments): move TreatmentUtil logic to TreatmentDto in https://github.com/vfred0/dental-system-frontend/commit/ffee3c6
* refactor(dental-services): use explicit imports in explorer component in https://github.com/vfred0/dental-system-frontend/commit/972b6ae
* chore(treatments): comment out complexity and dentalServices in detail view in https://github.com/vfred0/dental-system-frontend/commit/02b6f38

**Full Changelog**: https://github.com/vfred0/dental-system-frontend/compare/0.1.1...0.1.2
```

---

## 3. Script Generador

Para evitar escribir esto a mano, puedes autogenerar el contenido exacto utilizando `git log` y enviarlo directamente a un archivo temporal para luego crear o editar el release con la herramienta `gh`.

### A. Generar las notas

Reemplaza las variables según corresponda. Si es el primer release, omite el rango y usa solo el tag. Filtra (con `grep -v`) los commits de salto de versión ("bump version").

```bash
echo "## What's Changed" > release_notes.md

git --no-pager log {PREV_TAG}..{NEW_TAG} --no-decorate --format="* %s in https://github.com/{OWNER}/{REPO}/commit/%h" \
  | grep -v "chore: bump version" >> release_notes.md

echo "" >> release_notes.md
echo "**Full Changelog**: https://github.com/{OWNER}/{REPO}/compare/{PREV_TAG}...{NEW_TAG}" >> release_notes.md
```

### B. Publicar en GitHub usando `gh`

```bash
# Crear un nuevo release
gh release create {NEW_TAG} -t "{NEW_TAG}" -F release_notes.md

# O editar un release existente
gh release edit {NEW_TAG} -F release_notes.md

# Limpiar archivo temporal
rm release_notes.md
```
