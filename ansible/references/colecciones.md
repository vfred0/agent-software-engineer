# Colecciones de Ansible — Convenciones del Proyecto

El proyecto fija en `requirements.yml` toda colección no-builtin. Docs completas:
<https://docs.ansible.com/ansible/latest/collections_guide/> y
<https://galaxy.ansible.com>.

## Reglas

1. **Siempre FQCN** (`namespace.collection.module`) — nunca nombre de módulo desnudo ni keyword `collections:` a nivel de play.
2. **Fijar en `requirements.yml`** — versión exacta (`"8.6.0"`) o mínima (`">=8.0.0"`). Nunca sin fijar.
3. **Declarar dependencias de colección en el meta del rol** (`roles/<name>/meta/main.yml`) cuando el rol usa módulos no-builtin.
4. **Documentar dependencias de Python** — muchas colecciones necesitan paquetes pip extra; listarlos en el README del rol/playbook.

## Forma de `requirements.yml`

```yaml
---
collections:
  - name: community.general
    version: ">=8.0.0"
  - name: ansible.posix
    version: ">=1.5.0"
  - name: amazon.aws
    version: ">=9.0.0"
  - name: community.docker
    version: ">=3.0.0"

roles:
  - name: geerlingguy.nginx
    version: "3.1.4"
```

Instalar: `ansible-galaxy install -r requirements.yml`

## Declaración en meta del rol

```yaml
# roles/<role>/meta/main.yml
---
dependencies: []
collections:
  - community.general
  - ansible.posix
```

## Catálogo de módulos — colecciones populares

Agentes LLM: **no** inventar nombres de módulo. Verificar con `ansible-doc -l <collection>`.

### Colecciones clave (verificar módulos con `ansible-doc -l <collection>`)

| Colección | Dominio | `pip install` |
|---|---|---|
| `community.general` | Propósito general (docker, npm, terraform, ini_file, archive) | – |
| `ansible.posix` | POSIX (firewalld, selinux, mount, sysctl, authorized_key) | – |
| `amazon.aws` | AWS (ec2, s3, rds, iam, cloudformation) | `boto3` `botocore` |
| `community.docker` | Docker (container, image, network, compose_v2) | `docker` |
| `kubernetes.core` | K8s (k8s, helm, k8s_info) | `kubernetes` |
| `community.postgresql` | PostgreSQL (db, user, query, privs) | `psycopg2-binary` |
| `community.mysql` | MySQL (db, user, query) | `PyMySQL` |

No inventar nombres de módulo. Verificar: `ansible-doc -l <collection>`.

## Ejemplo de uso

```yaml
- name: Install nginx container
  community.docker.docker_container:
    name: nginx
    image: nginx:1.27.0
    state: started
    ports: ["80:80"]
```

## Skeleton de colección propia

Solo cuando se extraen módulos in-repo a un paquete distribuible.

```bash
ansible-galaxy collection init my_namespace.my_collection
```

```text
my_namespace/my_collection/
├── galaxy.yml        # namespace, name, version, deps
├── README.md
├── plugins/{modules,inventory,lookup,filter}/
├── roles/
├── playbooks/
└── tests/
```

Build + instalación local:

```bash
ansible-galaxy collection build
ansible-galaxy collection install my_namespace-my_collection-1.0.0.tar.gz
```

## Referencia rápida del CLI

| Comando | Uso |
|---|---|
| `ansible-galaxy collection install <name>` | instalar una colección |
| `ansible-galaxy collection install -r requirements.yml` | instalar desde archivo |
| `ansible-galaxy collection install -r requirements.yml --upgrade` | actualizar existentes |
| `ansible-galaxy collection list` | listar instaladas |
| `ansible-doc <ns>.<col>.<mod>` | docs de un módulo |
| `ansible-doc -l <ns>.<col>` | listar todos los módulos de una colección |
| `ansible-galaxy collection build` | compilar tarball |
| `ansible-galaxy collection publish <tarball>` | publicar en Galaxy |

## Troubleshooting

- **"Module not found"** → colección faltante o FQCN incorrecto. Revisar `ansible-galaxy collection list` y `ansible-doc -l <collection>`.
- **Conflicto de versión** → múltiples rutas tienen la misma colección. Revisar `collections_path` en `ansible.cfg`.
- **"Python library missing"** → instalar las dependencias pip de la colección (tabla arriba).
