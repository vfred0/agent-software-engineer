# Flujo de Trabajo de Playbooks de Ansible

## Estructura requerida de todo playbook

```yaml
---
- name: <Descripción corta y precisa>
  hosts: <group_or_host>
  gather_facts: true          # siempre explícito
  become: false               # solo true si root es estrictamente necesario
  tags:
    - <playbook-name>

  vars:
    # ¡Sin passwords acá! → ansible-vault, env vars, secretos de CI/CD, o secret manager externo (p.ej. HashiCorp Vault)

  pre_tasks:
    - name: Assert prerequisites
      ansible.builtin.assert:
        that: [...]
      tags: always

  tasks:
    - name: <Verbo + Objeto, p.ej. "Install nginx package">
      ansible.builtin.<module>:
        ...
      tags: [...]
      notify: <handler si aplica>

  handlers:
    - name: <Mayúscula, descriptivo>
      ansible.builtin.service:
        ...
```

## Convenciones de naming de tareas

- Formato: `Verbo + Objeto` → "Install nginx", "Configure sshd", "Start application".
- Idioma: inglés.
- Sin abreviaturas: `Configure`, no `Cfg`.
- Lint `name[casing]`: la primera letra DEBE ir en mayúscula.
- Lint `name[missing]`: toda tarea DEBE tener `name:`.

## `no-free-form` — nunca sintaxis de comando inline

```yaml
# BIEN
- name: Run migration
  ansible.builtin.command:
    cmd: /usr/bin/migrate --env production

# MAL — ansible-lint falla
- name: Run migration
  ansible.builtin.command: /usr/bin/migrate --env production
```

## Qué NUNCA va en un playbook

- Passwords en texto plano → `ansible-vault encrypt_string` o secreto externo (CI/CD, HashiCorp Vault) vía `-e`.
- `ignore_errors: true` sin comentario explicando por qué.
- `shell:`/`command:` cuando existe un módulo de Ansible equivalente.
- Booleanos `yes`/`no`/`True`/`False` → siempre `true`/`false` (`yaml[truthy]`).

## Estrategia de tags

Todo play y toda tarea llevan tags:

```yaml
tags:
  - install     # tareas de instalación
  - configure   # tareas de configuración
  - service     # gestión de servicios
  - never       # tareas que solo deben correr explícitamente
```

## Checklist de idempotencia

Verificar antes de hacer commit:

- [ ] ¿El playbook corre dos veces sin errores y sin cambios no deseados?
- [ ] ¿Todas las tareas `command:`/`shell:` tienen `changed_when:`?
- [ ] ¿Las tareas `command:`/`shell:` con exit codes poco confiables tienen `failed_when:`?
- [ ] ¿Los archivos con `state: present` no se reescriben constantemente?

## Flujo con herramientas MCP

1. Preguntar: nombre del playbook + qué debe hacer (hosts, become, tareas, vars).
2. Escribir `<nombre>.yml` siguiendo el skeleton — sin tareas placeholder tipo "Example task".
3. Si no hay inventario: crear `inventory/hosts.yml` + `group_vars/<group>.yml` (ver `inventario.md`).
4. `syntax_check` → `lint_file` con `profile="production"` → corregir violaciones.
5. `list_hosts` + `list_tags` para verificar alcance y filtros.
6. Reportar: ruta, cantidad de tareas, estado del lint, siguiente paso sugerido (`diff_check`).

Al actualizar un playbook existente: correr `lint_file` primero como baseline, editar preservando el skeleton, y volver a correr `syntax_check` → `lint_file` (sin violaciones nuevas vs. baseline) → `diff_check`. `diff_check` se conecta a hosts reales por SSH — siempre confirmar con el usuario antes de ejecutarlo, y preferir `limit="staging"` en la primera corrida.
