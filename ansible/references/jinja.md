# Jinja2 en Ansible — Convenciones del Proyecto

Referencia completa de Jinja2: <https://jinja.palletsprojects.com/en/stable/templates/>.
Filtros/tests/lookups específicos de Ansible: <https://docs.ansible.com/ansible/latest/collections/ansible/builtin/>.

## Reglas obligatorias

1. **Toda expresión Jinja entre comillas** — `"{{ var }}"`, nunca `{{ var }}` desnudo al inicio de un valor. Lint: `jinja[invalid]`, `yaml[implicit-mapping]`.
2. **Espacios dentro de las llaves** — `{{ var }}`, nunca `{{var}}`. Lint: `jinja[spacing]`.
3. **Sin variable-en-llaves en `when:`** — `when: foo` está bien; `when: "{{ foo }}"` no. Lint: `jinja[invalid]`, `no-jinja-when`.
4. **`default`/`mandatory` para vars opcionales vs. requeridas** — ver sección Defaults abajo para semántica y casos borde.
5. **`to_json`/`to_yaml` para contenido estructurado** — nunca stringificación implícita (ver `avoid-implicit` en `buenas-practicas.md`).

## Expresión vs. statement

```jinja
{{ expression }}   {# emite el valor en la salida        #}
{% statement %}    {# control de flujo, sin salida        #}
{# comment #}      {# se elimina de la salida renderizada #}
```

## Defaults y valores requeridos

```yaml
# Opcional con fallback
nginx_port: "{{ user_port | default(80) }}"

# Opcional, cae a otra variable
nginx_user: "{{ override_user | default(app_user) }}"

# Requerido — falla el render si no está definida
nginx_root: "{{ webroot | mandatory('webroot must be set') }}"

# Default solo cuando la var no está definida O es vacía/false (segundo argumento = true)
nginx_log_level: "{{ user_level | default('info', true) }}"
```

## Tests vs. filtros

Los tests usan `is`; los filtros usan `|`. Mezclarlos es el bug de Jinja más común.

```yaml
# Tests — devuelven bool
- when: my_var is defined
- when: my_var is not none
- when: my_list is iterable
- when: ansible_distribution is match('Ubuntu|Debian')
- when: result is succeeded
- when: result is changed
- when: result is failed
- when: result is skipped

# Filtros — transforman el valor
- "{{ my_list | length }}"
- "{{ my_string | upper }}"
- "{{ my_dict | combine(other_dict) }}"
```

## Filtros clave con semántica específica del proyecto

Filtros estándar (`upper`, `trim`, `length`, `sort`, `replace`, `int`, `bool`, `basename`, `regex_replace`, `b64encode`, `urlencode`, `from_json`, `from_yaml`, `to_nice_yaml`/`to_nice_json`): ver docs builtin de Ansible.

| Filtro | Nota |
|---|---|
| `mandatory('msg')` | Falla el render si la var no está definida — usar en vez de un default silencioso |
| `combine(other, recursive=true)` | Deep merge de dicts; sin `recursive`, las claves anidadas se sobreescriben |
| `map(attribute='k')` | Extrae un atributo de cada dict; **siempre** `\| list` después — ver anti-patrones |

## Control de whitespace

Jinja inserta un salto de línea por cada bloque `{% ... %}`. Usar `-` en el lado correspondiente para recortarlo. Crítico en plantillas que deben quedar diff-clean.

```jinja
{# Estándar - deja líneas en blanco #}
{% for vhost in nginx_vhosts %}
server {
  server_name {{ vhost.name }};
}
{% endfor %}

{# Recortado - sin blancos extra #}
{%- for vhost in nginx_vhosts %}
server {
  server_name {{ vhost.name }};
}
{%- endfor %}
```

El trimming se controla por plantilla vía parámetros del módulo (defaults: `trim_blocks=true`, `lstrip_blocks=false`):

```yaml
# Override por tarea
- ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    mode: 'u=rw,g=r,o=r'
    trim_blocks: true      # default true
    lstrip_blocks: true    # default false - activar para salida más limpia
```

## Patrones `selectattr`/`rejectattr`

```yaml
vars:
  servers:
    - { name: web01, env: prod, port: 80 }
    - { name: web02, env: stg,  port: 80 }
    - { name: db01,  env: prod, port: 5432 }

  # Todos los servidores prod
  prod_servers: "{{ servers | selectattr('env', 'eq', 'prod') | list }}"

  # Nombres de todos los servidores prod
  prod_names: "{{ servers | selectattr('env', 'eq', 'prod') | map(attribute='name') | list }}"

  # Todos los no-prod
  non_prod: "{{ servers | rejectattr('env', 'eq', 'prod') | list }}"

  # Que tengan el atributo 'port' definido
  with_port: "{{ servers | selectattr('port', 'defined') | list }}"
```

## Lookups

Corren en el controller. Usar para datos externos que no están en variables de Ansible.

| | Lookup | Filtro |
|---|---|---|
| Origen | externo (archivo, env, vault, password) | valor ya recibido |
| Ejemplo | `{{ lookup('env', 'HOME') }}` | `{{ my_path \| basename }}` |

```yaml
ssh_user: "{{ lookup('env', 'DEPLOY_USER') | default('deploy', true) }}"
db_pw: "{{ lookup('password', '/tmp/db_pw chars=ascii_letters,digits length=24') }}"
```

`query()` es un alias de `lookup(..., wantlist=true)`. Para `lookup('template', ...)` ver docs de Ansible.

## Encabezado de plantilla (obligatorio en todo `.j2`)

```jinja
{# Managed by Ansible – role: {{ role_name | default('<playbook>') }} #}
{# Manual changes will be overwritten on the next Ansible run! #}
```

## Anti-patrones

### Variable desnuda como valor YAML

```yaml
# MAL — YAML parsea {{ var }} de forma ambigua, dispara jinja[invalid]
listen: {{ port }}

# BIEN
listen: "{{ port }}"
```

### `when:` con delimitadores Jinja

```yaml
# MAL — when: ya evalúa Jinja, doble render incorrecto
- ansible.builtin.debug: { msg: hi }
  when: "{{ enabled }}"

# BIEN
- ansible.builtin.debug: { msg: hi }
  when: enabled | bool
```

### Truthiness implícito sobre strings

```yaml
# MAL — "false" (string) es truthy en Jinja
- when: my_var

# BIEN — cast explícito
- when: my_var | bool
```

### Comparar strings de facts sin normalizar

```yaml
# MAL — frágil, el casing de la distro cambia entre releases
- when: ansible_distribution == "ubuntu"

# BIEN
- when: ansible_distribution | lower == 'ubuntu'

# MEJOR — consciente de la versión
- when: ansible_distribution == 'Ubuntu' and ansible_distribution_major_version | int >= 22
```

### `default()` tragándose valores falsy legítimos

```yaml
# MAL — el default dispara aunque el usuario pase 0, '' o false
nginx_workers: "{{ user_workers | default(4) }}"

# BIEN — solo dispara cuando está indefinida
nginx_workers: "{{ user_workers if user_workers is defined else 4 }}"
```

### Olvidar `| list` después de `map`/`select`/`selectattr`

`map`/`select`/`selectattr` devuelven generadores en Jinja2. Sin `| list`, `length` y la re-iteración dan resultados incorrectos.

```yaml
# MAL — generador, length siempre 0 tras la primera iteración
names: "{{ servers | map(attribute='name') }}"

# BIEN
names: "{{ servers | map(attribute='name') | list }}"
```

## Debuggear plantillas

```yaml
- ansible.builtin.debug: { var: my_complex_var }
- ansible.builtin.debug: { msg: "{{ servers | selectattr('env','eq','prod') | list }}" }
```

Renderizar una plantilla localmente sin correr el playbook:

```bash
ansible localhost -m template -a "src=templates/nginx.conf.j2 dest=/tmp/out.conf" \
  -e @group_vars/all.yml
```
