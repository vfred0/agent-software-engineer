# Estructura de Roles de Ansible

Reglas de lint y guía general de módulos: ver `buenas-practicas.md`.
Especificación completa de layout de roles:
<https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html>.

## Layout de directorio requerido

```text
roles/<role_name>/
├── tasks/
│   ├── main.yml          # entry point - hace include_tasks del resto
│   ├── install.yml
│   ├── configure.yml
│   ├── debian.yml        # opcional, específico de SO
│   └── redhat.yml
├── handlers/main.yml
├── defaults/main.yml     # sobreescribible, cada var comentada
├── vars/main.yml         # interno, no pensado para sobreescribir
├── templates/*.j2
├── files/*
├── meta/main.yml
└── README.md
```

## Skeleton de `tasks/main.yml`

```yaml
---
- name: Include OS-specific variables
  ansible.builtin.include_vars: "{{ ansible_os_family | lower }}.yml"
  when: ansible_os_family is defined
  tags: always

- name: Install {{ role_name }}
  ansible.builtin.include_tasks: install.yml
  tags: install

- name: Configure {{ role_name }}
  ansible.builtin.include_tasks: configure.yml
  tags: configure
```

## `import_tasks` vs `include_tasks`

| | `import_tasks` | `include_tasks` |
|---|---|---|
| Resolución | tiempo de parseo (estático) | tiempo de ejecución (dinámico) |
| `when:` en la directiva | se evalúa **una sola vez** — lint marca `import-task-no-when` | se evalúa en cada llamada |
| Tags visibles en `--list-tags` | sí | no |
| Usar para | includes estáticos incondicionales | carga condicional / específica de SO |

```yaml
# BIEN — include_tasks para carga condicional / dinámica por host
- name: Include OS-specific tasks
  ansible.builtin.include_tasks: "{{ ansible_os_family | lower }}.yml"
  when: ansible_os_family is defined

# BIEN — import_tasks para includes estáticos incondicionales, los tags funcionan bien
- name: Import hardening tasks
  ansible.builtin.import_tasks: hardening.yml

# MAL — import-task-no-when, el when: solo aplica en tiempo de parseo
- name: Import tasks conditionally
  ansible.builtin.import_tasks: optional.yml
  when: some_condition   # <- usar include_tasks en su lugar
```

## Patrones de `changed_when`

```yaml
# Solo lectura — nunca marca changed
- name: Check app version
  ansible.builtin.command: { cmd: /usr/bin/myapp --version }
  register: app_version
  changed_when: false

# Condición explícita basada en el resultado
- name: Run migration
  ansible.builtin.command: { cmd: /usr/bin/migrate }
  register: migration
  changed_when: "'applied' in migration.stdout"
  failed_when: migration.rc not in [0, 2]   # 2 = no-op
```

## Naming de variables — el prefijo de rol es obligatorio

El lint `var-naming[no-role-prefix]` exige que toda variable de rol empiece con el nombre del rol. Nada de nombres genéricos (`port`, `enabled`, `package`).

```yaml
# Rol: install_nginx
install_nginx_port: 80
install_nginx_conf_dir: /etc/nginx
install_nginx_vhosts: []
```

## Variables de loop — prefijo `__` o `<role>_`

`item` colisiona en loops anidados. Configurar `loop_control.loop_var` con un nombre prefijado. Patrón de `.ansible-lint`: `loop_var_prefix: "^(__|{role}_)"`.

```yaml
- name: Create vhosts
  ansible.builtin.template:
    src: vhost.conf.j2
    dest: "/etc/nginx/conf.d/{{ __nginx_vhost.name }}.conf"
    mode: 'u=rw,g=r,o=r'
  loop: "{{ nginx_vhosts }}"
  loop_control:
    loop_var: __nginx_vhost
    label: "{{ __nginx_vhost.name }}"
```

## `defaults/main.yml` — comentar cada variable

Cada var: comentario breve, prefijo de rol, default razonable. Las vars tipo lista llevan un ejemplo comentado debajo del default vacío, para que se vea la forma esperada.

```yaml
---
# Whether the role is active
my_role_enabled: true

# Package to install (pin version)
my_role_package: nginx-1.24.0

# Listening port
my_role_port: 80

# Configuration directory
my_role_conf_dir: /etc/nginx

# List of vhosts
my_role_vhosts: []
# my_role_vhosts:
#   - { name: example.com, port: 80, root: /var/www/example }
```

## `vars/main.yml` — solo interno

```yaml
---
# Role: my_role
# Internal values that callers SHOULD NOT override.
my_role__pkg_lookup:
  Debian: nginx
  RedHat: nginx
my_role__service_name: nginx
```

El prefijo de doble guion bajo señala "interno".

## Encabezado de plantilla Jinja2

Todo `.j2` empieza con:

```jinja
{# Managed by Ansible – role: {{ role_name }} #}
{# Manual changes will be overwritten on the next Ansible run! #}
```

## Handlers

Usar `listen:` — varios notificadores pueden disparar el mismo handler.

```yaml
# handlers/main.yml
---
- name: Restart nginx
  ansible.builtin.service: { name: nginx, state: restarted }
  listen: "Restart nginx"

- name: Reload nginx
  ansible.builtin.service: { name: nginx, state: reloaded }
  listen: "Reload nginx"
```

## `meta/main.yml` — dependencias

```yaml
---
dependencies:
  - role: common
  - role: geerlingguy.git   # también fijado en requirements.yml
    vars:
      git_version: "2.40"
collections:
  - community.general
  - ansible.posix

galaxy_info:
  role_name: my_role
  author: Your Team
  description: What this role does
  license: MIT
  min_ansible_version: "2.20"
  platforms:
    - name: Ubuntu
      versions: [jammy, noble]
    - name: EL
      versions: ["9"]
```

## Orden de claves de tarea

El lint solo obliga a que `name` vaya primero y `block`/`rescue`/`always` al final. Convención del proyecto:

```text
name → module → when → loop → register → notify → tags → block/rescue/always
```

## Flujo con herramientas MCP

Al crear o modificar un rol: `syntax_check` sobre `tasks/main.yml` → `lint_file` con `profile="production"` sobre el **directorio completo del rol** (las reglas a nivel de rol solo se activan sobre el árbol completo, no sobre un archivo de tarea aislado) → corregir violaciones.
