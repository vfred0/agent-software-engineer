# Ansible Vault — Convenciones del Proyecto

Referencia completa del CLI de vault:
<https://docs.ansible.com/ansible/latest/vault_guide/index.html>.

## Cuándo usar vault

Vault es para **secretos estáticos** en el repo: passwords de BD, tokens de API, claves privadas SSH/TLS.

**No** usar vault para:

- Configuración no sensible (puertos, rutas, nombres de paquetes).
- Certificados públicos.
- Secretos que rotan frecuentemente → secret manager externo.

## Layout — `vars.yml` + `vault.yml` separados

Único layout usado en este proyecto. Sin blobs `!vault` inline.

```text
group_vars/
└── all/
    ├── vars.yml       # texto plano
    └── vault.yml      # cifrado
```

`vars.yml` referencia las variables de vault con prefijo `vault_*`; `vault.yml` las define. Los diffs quedan legibles; el archivo cifrado solo cambia cuando cambia el secreto.

```yaml
# vars.yml
db_host: db.example.com
db_port: 5432
db_user: app_user
db_password: "{{ vault_db_password }}"

# vault.yml (cifrado)
vault_db_password: "supersecret123"
vault_api_key: "abc123xyz"
```

## Cheatsheet del CLI

| Comando | Uso |
|---|---|
| `ansible-vault create <file>` | crear archivo cifrado nuevo |
| `ansible-vault edit <file>` | editar in-place |
| `ansible-vault view <file>` | leer sin descifrar en disco |
| `ansible-vault encrypt <file>` | cifrar un archivo plano existente |
| `ansible-vault decrypt <file>` | descifrar (escribe texto plano) |
| `ansible-vault rekey <file>` | cambiar el password |
| `ansible-vault encrypt_string 'val' --name 'k'` | blob inline puntual |

### `encrypt_string` desde stdin (CI-friendly, evita el shell history)

```bash
echo -n 'supersecret123' | ansible-vault encrypt_string --stdin-name 'vault_api_key'
```

## Fuentes del password

Orden de preferencia:

1. `vault_password_file = ~/.vault_pass` en `ansible.cfg` (máquina de desarrollo, `chmod 600`).
2. `--vault-password-file <path>` en CI, escrito desde un secreto de CI a un archivo temporal, eliminado tras la corrida.
3. `--ask-vault-pass` solo para casos ad-hoc/puntuales.

Password basado en script (obtenido de una variable de entorno):

```bash
#!/bin/bash
# ~/.vault_pass.sh - chmod 700
echo "$VAULT_PASSWORD"
```

```bash
ansible-playbook playbook.yml --vault-password-file ~/.vault_pass.sh
```

## Vault IDs para multi-entorno

```bash
ansible-vault create --vault-id prod@prompt group_vars/production/vault.yml
ansible-vault create --vault-id stg@prompt  group_vars/staging/vault.yml

ansible-playbook playbook.yml \
  --vault-id prod@~/.vault_pass_prod \
  --vault-id stg@~/.vault_pass_stg
```

## Integración con CI/CD

```bash
# Patrón genérico de CI - funciona en GitHub Actions, GitLab CI, Jenkins, etc.
echo "$VAULT_PASSWORD" > /tmp/vault_pass
ansible-playbook playbook.yml --vault-password-file /tmp/vault_pass
rm -f /tmp/vault_pass
```

Obtener `$VAULT_PASSWORD` desde el secret store del CI (GitHub Secrets, GitLab CI Variables, Jenkins Credentials, etc.).

## Secret managers externos

Para secretos dinámicos/rotativos, usar plugins `lookup()` en vez de archivos cifrados con vault:

| Proveedor | Colección | Llamada lookup |
|---|---|---|
| HashiCorp Vault | `hvac` pip | `lookup('hashi_vault', 'secret=...')` |
| AWS Secrets Manager | `boto3` pip | `lookup('amazon.aws.aws_secret', '...')` |
| Azure Key Vault | `azure-keyvault-secrets` pip | `lookup('azure.azcollection.azure_keyvault_secret', '...')` |

Agregar siempre `no_log: true` en tareas que consumen el secreto.

## Reglas

1. Nunca commitear archivos `vault_pass*` — agregar a `.gitignore`:

   ```text
   **/vault_pass*
   **/.vault_pass*
   ```

2. Las tareas que consumen el secreto llevan `no_log: true`:

   ```yaml
   - name: Create database user
     community.postgresql.postgresql_user:
       name: app_user
       password: "{{ vault_db_password }}"
     no_log: true
   ```

3. Rotar el password de vault ante cambios de personal: `ansible-vault rekey <file>`.
4. Tras editar un archivo vault, verificación de sanidad:

   ```bash
   ansible-vault view group_vars/all/vault.yml
   ansible-playbook playbook.yml --syntax-check --ask-vault-pass
   ```

## Errores comunes

- **"Decryption failed"** → password incorrecto, o falta `--vault-id` cuando hay múltiples IDs en uso.
- **"unhexlify error"** → el archivo se editó fuera de `ansible-vault edit` estando cifrado; restaurar desde backup.
- **"no vault secrets found"** → no hay fuente de password configurada (cfg / flag / prompt). Este mismo error puede aparecer al correr `lint_file`/`syntax_check` sobre un proyecto con vault si `vault_password_file` no está configurado — setear en `ansible.cfg` o vía `ANSIBLE_VAULT_PASSWORD_FILE` en el entorno del proceso MCP.
