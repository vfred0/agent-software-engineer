# Configuración de Ansible (`ansible.cfg`) — Convenciones del Proyecto

Patrones de `ansible.cfg` del proyecto. Referencia completa:
<https://docs.ansible.com/ansible/latest/reference_appendices/config.html>.

## Orden de resolución

Ansible busca en este orden, usa el **primero** que encuentra:

1. Variable de entorno `ANSIBLE_CONFIG`.
2. `./ansible.cfg` en el directorio actual.
3. `~/.ansible.cfg`.
4. `/etc/ansible/ansible.cfg`.

Commitear siempre un `ansible.cfg` local al repo, en la raíz. Sin depender de configuración global — los playbooks deben comportarse igual en cualquier máquina de desarrollo y en CI.

## Configuración mínima recomendada

```ini
# ansible.cfg
[defaults]
inventory            = inventory/hosts.yml
roles_path           = roles:~/.ansible/roles
collections_path     = collections:~/.ansible/collections
host_key_checking    = False
forks                = 20
timeout              = 30
gathering            = smart
fact_caching         = jsonfile
fact_caching_connection = .ansible/facts
fact_caching_timeout = 7200
stdout_callback      = yaml
callbacks_enabled    = profile_tasks, timer
retry_files_enabled  = False
interpreter_python   = auto_silent

[ssh_connection]
pipelining           = True
ssh_args             = -o ControlMaster=auto -o ControlPersist=60s -o PreferredAuthentications=publickey
control_path         = %(directory)s/%%h-%%r

[privilege_escalation]
become               = True
become_method        = sudo
become_user          = root
become_ask_pass      = False
```

## Referencia de secciones (convenciones del proyecto)

### `[defaults]`

| Clave | Valor del proyecto | Por qué |
|-----|--------------|-----|
| `inventory` | `inventory/hosts.yml` o `inventory/` | Ver `inventario.md` |
| `roles_path` | `roles:~/.ansible/roles` | Roles locales primero, luego Galaxy |
| `collections_path` | `collections:~/.ansible/collections` | Mismo patrón |
| `host_key_checking` | `False` | Seguro para CI; known_hosts gestionado aparte |
| `forks` | `20` | Default razonable; subir para flotas grandes |
| `gathering` | `smart` | Se salta facts cuando ya están cacheados |
| `fact_caching` | `jsonfile` | Reruns más rápidos; cache dir bajo `.ansible/` |
| `stdout_callback` | `yaml` | Diffs y salida de tareas legibles |
| `callbacks_enabled` | `profile_tasks, timer` | Expone tareas lentas en desarrollo |
| `retry_files_enabled` | `False` | Sin ruido de archivos `.retry` |
| `interpreter_python` | `auto_silent` | Silencia warnings de discovery de intérprete |

### `[ssh_connection]`

| Clave | Valor del proyecto | Por qué |
|-----|--------------|-----|
| `pipelining` | `True` | ~30% más rápido en ejecución de módulos; no requiere `requiretty` en sudoers |
| `ssh_args` | `ControlMaster=auto`, `ControlPersist=60s` | Multiplexado de conexiones |
| `control_path` | `%(directory)s/%%h-%%r` | Evita path-too-long en FQDNs largos |

### `[privilege_escalation]`

Declarar siempre aunque coincida con los defaults — explícito mejor que implícito. Nunca poner `become_ask_pass = True` en config commiteada; usar `--ask-become-pass` en CLI o vault para passwords de sudo.

### `[inventory]` (plugins)

Habilitar plugins para inventario dinámico:

```ini
[inventory]
enable_plugins = host_list, script, auto, yaml, ini, toml, amazon.aws.aws_ec2
```

Ver `inventario.md` para el patrón completo de inventario dinámico.

## Configuración por entorno

**No** distribuir múltiples archivos `ansible.cfg`. Override vía variable de entorno:

```bash
ANSIBLE_CONFIG=ansible.prod.cfg ansible-playbook playbooks/site.yml
```

O CWD por directorio: cada entorno con su propio subdirectorio y su propio `ansible.cfg`. Preferir la variable de entorno para CI.

## Integración con vault

```ini
[defaults]
vault_password_file = .vault_pass        # gitignored
# o para múltiples vault IDs:
vault_identity_list = dev@.vault_pass_dev, prod@.vault_pass_prod
```

Ver `vault.md` para gestión del archivo de password de vault.

## Anti-patrones

- `host_key_checking = True` sin aprovisionar `known_hosts` antes → la primera corrida falla en cada host nuevo. Desactivarlo (`ANSIBLE_HOST_KEY_CHECKING=False`) puede ser aceptable en pipelines de CI, runners efímeros o tests en contenedor donde el riesgo de MITM está acotado — la decisión depende del modelo de confianza de red.
- `forks = 100+` sin subir `ulimit -n` y `MaxSessions` de SSH.
- `pipelining = True` cuando sudoers exige `requiretty` — la tarea falla con "sudo: sorry, you must have a tty".
- Commitear el contenido de `vault_password_file`. La ruta va en el cfg; el archivo en sí va gitignored.
- Mezclar estilos de `roles_path` entre el equipo — fijarlo en `ansible.cfg`, sin depender de la env var `ANSIBLE_ROLES_PATH`.

## Validación

`ansible-config dump --only-changed` muestra todo valor que difiere de los defaults — usarlo para auditar drift de configuración del proyecto.
