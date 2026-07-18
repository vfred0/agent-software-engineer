# Buenas Prácticas de Ansible

Reglas del proyecto + violaciones de `ansible-lint` que la herramienta `lint_file` detecta.
Documentación general: <https://docs.ansible.com/ansible/latest/>.

## Reglas obligatorias

1. **Solo FQCN** — todo módulo se llama como `ansible.builtin.<nombre>` (o `<coleccion>.<nombre>` cuando no es builtin). Lint: `fqcn[action]`.
2. **Modo en `ugo`, nunca octal** — `mode: 'u=rw,g=r,o=r'`, no `'0644'`. La `o=` es obligatoria incluso sin permisos para otros (`mode: 'u=rw,g=r,o='`).
3. **Versiones fijadas** — `state: present` + versión pineada, nunca `state: latest`. Lint: `package-latest`.
4. **Toda tarea tiene `name:`** con mayúscula inicial. Lint: `name[missing]`, `name[casing]`.
5. **`command`/`shell` con clave `cmd:`** — nunca argumentos libres. Lint: `no-free-form`. Siempre `changed_when:` (`false` si es de solo lectura). Lint: `no-changed-when`.
6. **Sin coerción implícita de tipos** — usar filtros Jinja (`to_json`) al pasar dicts/listas. Lint: `avoid-implicit`.
7. **Tags en cada tarea** para permitir `--tags`/`--skip-tags`.
8. **Booleanos truthy** — solo `true`/`false`, nunca `yes/no/True/False`. Lint: `yaml[truthy]`.
9. **Naming de variables de rol** — prefijadas con el nombre del rol. Lint: `var-naming[no-role-prefix]`.

## Skeleton de play

```yaml
---
- name: Configure web servers
  hosts: webservers
  become: true
  tags: [webservers]

  vars:
    nginx_port: 80
    app_user: webapp

  tasks:
    - name: Install nginx
      ansible.builtin.package:
        name: nginx-1.24.0
        state: present
      tags: [packages]
      notify: Restart nginx

    - name: Copy nginx configuration
      ansible.builtin.template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
        owner: root
        group: root
        mode: 'u=rw,g=r,o=r'
      tags: [config]
      notify: Restart nginx

  handlers:
    - name: Restart nginx         # mayúscula, coincide exacto con notify
      ansible.builtin.service:
        name: nginx
        state: restarted
```

## Idempotencia — la regla crítica

Toda tarea debe producir el mismo resultado en la 2da ejecución que en la 1ra. Usar la semántica de estado del módulo (`state: present/absent`) o `creates:`/`removes:` en `command`/`shell`.

```yaml
# BIEN — idempotente, módulo package
- name: Install nginx
  ansible.builtin.package: { name: nginx, state: present }

# BIEN — idempotente, marcador creates:
- name: Download app archive
  ansible.builtin.command:
    cmd: wget https://example.com/app.tar.gz -O /opt/app.tar.gz
    creates: /opt/app.tar.gz

# MAL — no idempotente, redescarga en cada corrida
- name: Download app archive
  ansible.builtin.command:
    cmd: wget https://example.com/app.tar.gz

# MAL — no idempotente, sigue agregando líneas
- name: Append config
  ansible.builtin.shell:
    cmd: echo "config=value" >> /etc/app.conf
```

## Precedencia de variables

De menor a mayor: role defaults < group_vars < host_vars < play vars < role vars < extra vars (`-e`).
Referencia completa: <https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html#understanding-variable-precedence>.

## Manejo de errores

```yaml
# Condición de falla personalizada
- name: Run command
  ansible.builtin.command: { cmd: /usr/bin/mycommand }
  register: result
  failed_when: "'ERROR' in result.stderr"

# Comando de solo lectura — nunca marca changed
- name: Check configuration
  ansible.builtin.command: { cmd: /usr/bin/check_config }
  register: config_check
  changed_when: false

# block / rescue / always
- name: Risky workflow
  block:
    - name: Risky task
      ansible.builtin.command: { cmd: /usr/bin/risky_operation }
  rescue:
    - name: Handle failure
      ansible.builtin.debug: { msg: "Operation failed, running recovery" }
  always:
    - name: Cleanup
      ansible.builtin.debug: { msg: "Cleanup complete" }
```

## Anti-patrones de lint

### `no-handler` — usar `notify`, no `when: result.changed`

```yaml
# MAL
- ansible.builtin.copy: { src: nginx.conf, dest: /etc/nginx/nginx.conf, mode: 'u=rw,g=r,o=r' }
  register: result
- ansible.builtin.service: { name: nginx, state: restarted }
  when: result.changed

# BIEN
- ansible.builtin.copy: { src: nginx.conf, dest: /etc/nginx/nginx.conf, mode: 'u=rw,g=r,o=r' }
  notify: Restart nginx
```

### `partial-become` — `become_user` exige `become: true` en el mismo nivel

```yaml
# BIEN
- ansible.builtin.service: { name: myapp, state: started }
  become: true
  become_user: appuser
```

### `risky-shell-pipe` — `set -o pipefail` al usar pipes en `shell:`

```yaml
- ansible.builtin.shell:
    cmd: |
      set -o pipefail
      cat /etc/hosts | grep localhost
    executable: /bin/bash
  changed_when: false
```

### `no-log-password` — `no_log: true` al iterar sobre secretos

```yaml
- ansible.builtin.user:
    name: "{{ item.name }}"
    password: "{{ item.password }}"
  loop: "{{ users }}"
  no_log: true
```

### `avoid-implicit` — Jinja explícito para valores no-string

```yaml
# MAL
- ansible.builtin.copy:
    content: { "key": "value" }
    dest: /tmp/config.json

# BIEN
- vars: { config: { "key": "value" } }
  ansible.builtin.copy:
    content: "{{ config | to_json }}"
    dest: /tmp/config.json
```

### `import-task-no-when` — `when:` en `import_tasks` se evalúa una sola vez

Usar `include_tasks` cuando la condición depende de estado en tiempo de ejecución.

### `when:` solo debe referenciar facts / variables registradas

```yaml
# BIEN
- ansible.builtin.package: { name: nginx, state: present }
  when: ansible_os_family == "Debian"

# BIEN
- ansible.builtin.service: { name: nginx, state: restarted }
  when: config_result.changed

# MAL — shell-command-in-when, frágil y no declarativo
- ansible.builtin.debug: { msg: "exists" }
  when: "{{ lookup('pipe', 'test -f /etc/nginx/nginx.conf') }}"
```

## Loops

Usar `loop:`, nunca `with_items:`. Configurar siempre `loop_control.label` para que la salida siga siendo legible.

```yaml
- name: Create users
  ansible.builtin.user:
    name: "{{ item.name }}"
    groups: "{{ item.groups }}"
    state: present
  loop:
    - { name: alice, groups: admin,developers }
    - { name: bob,   groups: developers }
  loop_control:
    label: "{{ item.name }}"
```

En roles, prefijar la variable de loop para evitar colisiones con loops externos (ver `estructura-roles.md`).

## Elección de módulo

Preferir `ansible.builtin.*` (copy, template, package, service, command, shell, systemd).
`command`/`shell` solo cuando no existe módulo dedicado — siempre con `cmd:` + `changed_when:`.
Verificar módulos disponibles: `ansible-doc -l`.

## Estrategia de tags

Los tags controlan `--tags`/`--skip-tags`. Dos tags especiales:

- `always` — corre sin importar el filtro `--tags`.
- `never` — corre solo cuando se lista explícitamente en `--tags`.

```yaml
tasks:
  - name: Pre-flight assertions
    ansible.builtin.assert: { that: ["app_user is defined"] }
    tags: [always]

  - name: Install packages
    ansible.builtin.package: { name: nginx, state: present }
    tags: [packages, nginx]

  - name: Destructive test
    ansible.builtin.command: { cmd: /usr/local/bin/test_nginx.sh }
    changed_when: false
    tags: [never, testing]   # solo con --tags testing
```

## Tareas asíncronas

Operaciones de larga duración: usar `async:` con `poll: 0`, luego `ansible.builtin.async_status` para esperar el resultado.
Patrón completo: <https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_async.html>.

## Escalada de privilegios

```yaml
# A nivel de play
- hosts: all
  become: true
  become_method: sudo

# Por tarea — ambas claves al mismo nivel
- name: Start as app user
  ansible.builtin.service: { name: myapp, state: started }
  become: true
  become_user: appuser
```

## Rendimiento

En `ansible.cfg`: `forks=20`, `pipelining=True`, `ControlMaster=auto`/`ControlPersist=60s`.
Poner `gather_facts: false` en plays que no necesitan facts.

## Secretos

Nunca en texto plano en el repo. Usar una de estas opciones:

- Strings cifrados con `ansible-vault` (ver `vault.md`)
- `lookup('env', 'VAR')`
- `lookup('hashi_vault', 'secret=...')`

## Baseline de `.ansible-lint`

```yaml
profile: production
offline: true
enable_list: [no-log-password, loop-var-prefix]
loop_var_prefix: "^(__|{role}_)"
var_naming_pattern: "^[a-z_][a-z0-9_]*$"
```

Supresiones por archivo → `.ansible-lint-ignore`, no `skip_list`.

## Flujo de validación (herramientas MCP)

`mcp-ansible` aplica este orden, cada etapa se encarece si la anterior falla:

1. `syntax_check` — chequeo estructural rápido, sin inventario ni SSH.
2. `lint_file` con `profile="production"` — reglas de buenas prácticas descritas arriba.
3. `diff_check` — dry-run con `--check --diff` contra hosts reales (requiere SSH, siempre confirmar con el usuario antes de correr contra producción).

Advertencias de `diff_check` (dry-run es predicción, no garantía):

- Los handlers no disparan en check mode por defecto — usar `force_handlers: true` si el orden importa.
- `command`/`shell`/`script` se saltan en check mode salvo `check_mode: false` por tarea.
- Módulos de colecciones de terceros sin soporte de check mode no muestran diff — verificar con `ansible-doc <fqcn> | grep check_mode`.

Lint limpio no garantiza sintaxis válida en runtime — correr siempre `syntax_check` además de `lint_file`. `lint_file` sobre un directorio de rol completo activa reglas que no aparecen al lintear un `tasks/main.yml` aislado.

Referencia completa de reglas: <https://docs.ansible.com/projects/lint/rules/>
