# Inventario de Ansible — Convenciones del Proyecto

Referencia de plugins de inventario + inventario dinámico:
<https://docs.ansible.com/ansible/latest/inventory_guide/>.

## Formato

- `hosts.ini` para proyectos pequeños / scaffolds rápidos.
- `hosts.yml` para grupos anidados + proyectos más grandes.

Las herramientas MCP resuelven el inventario en este orden:

1. Variable de entorno `ANSIBLE_INVENTORY`.
2. `ansible.cfg` → `[defaults] inventory =`.
3. Rutas de fallback: `hosts.yml`, `hosts.yaml`, `hosts.ini`, `inventory/hosts.*`.

## Inventario YAML con entornos

Usar `children:` para componer grupos de entorno a partir de grupos funcionales. Layout recomendado para todo proyecto con más de un entorno.

```yaml
# inventory/hosts.yml
---
all:
  children:
    webservers:
      hosts:
        web01.example.com:    # FQDN como clave del inventario - no necesita ansible_host
        web02.example.com:
      vars:
        nginx_port: 80

    dbservers:
      hosts:
        db01.example.com:
          postgresql_version: 14

    production:
      children:
        webservers:
        dbservers:

    staging:
      hosts:
        staging01.example.com:
```

## Regla de `ansible_host`

Configurar `ansible_host` solo cuando el nombre del inventario **no** es el nombre DNS real — alias, host solo-IP, o nombre distinto del destino de conexión. Si no aplica, omitirlo; la clave FQCN del inventario ya es el destino de conexión.

```yaml
all:
  hosts:
    db-primary:                        # alias lógico
      ansible_host: db01.example.com
    legacy-app:
      ansible_host: 10.0.3.15          # sin entrada DNS
```

## Naming de grupos

- Minúsculas, guiones bajos: `web_servers`, no `WebServers`.
- Grupos funcionales: `webservers`, `dbservers`, `loadbalancers`.
- Grupos de entorno: `production`, `staging`, `development`.
- Combinar vía `children:`, no con nombres aplanados.

## Layout de variables

```text
inventory/
├── hosts.yml
├── group_vars/
│   ├── all.yml
│   ├── all/                # split al usar vault
│   │   ├── vars.yml
│   │   └── vault.yml
│   └── webservers.yml
└── host_vars/
    └── web01.example.com/
        ├── vars.yml
        └── vault.yml
```

Usar la forma de directorio (`group_vars/<group>/vars.yml` + `vault.yml`) siempre que el grupo tenga variables cifradas con vault.

## Multi-inventario (estático + dinámico)

Apuntar `inventory =` a un directorio; Ansible mergea todos los archivos dentro. O listar archivos explícitamente separados por `:`.

```ini
# ansible.cfg
[defaults]
inventory = inventory/                                # modo directorio
# o
inventory = inventory/static/hosts.yml:inventory/aws_ec2.yml
```

## Inventario dinámico

Usar plugins, no scripts legacy.

```yaml
# inventory/aws_ec2.yml
plugin: amazon.aws.aws_ec2
regions: [eu-central-1]
filters:
  instance-state-name: running
keyed_groups:
  - { key: tags.Role, prefix: role }
  - { key: tags.Environment, prefix: env }
compose:
  ansible_host: public_ip_address
```

Habilitar el plugin en `ansible.cfg`:

```ini
[defaults]
inventory = inventory/
enable_plugins = amazon.aws.aws_ec2
```

## Verificación con herramientas MCP

Tras crear o modificar el inventario, correr `list_hosts` sobre cualquier playbook para confirmar que el grupo/host objetivo resuelve como se espera. Si `list_hosts` devuelve vacío o `gather_facts` falla sobre un nombre de grupo, revisar el orden de resolución arriba antes de asumir un problema de conectividad.
