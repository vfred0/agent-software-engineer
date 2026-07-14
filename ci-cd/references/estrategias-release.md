# Estrategias de release: base de datos, configuración e infraestructura

Todo lo que condiciona el comportamiento del sistema en producción debe estar **versionado, ser reproducible y formar parte del pipeline**. Código, esquema de BD, configuración e infraestructura comparten la misma cadena de confianza; si cualquiera queda fuera, el pipeline tiene un punto ciego que se manifiesta como incidente en el peor momento.

## Panorama de estrategias de release

| Estrategia | Qué hace | Cuándo aplica |
|------------|----------|---------------|
| Blue-green deployment | Dos entornos productivos; se rutea el tráfico al nuevo cuando está listo | Rollback inmediato a nivel de infraestructura |
| Canary release | Nueva versión expuesta a un subconjunto pequeño de usuarios | Observar comportamiento real con bajo blast radius |
| Dark launching | Código nuevo corre en paralelo al viejo sin ser visible | Validar performance/corrección contra tráfico real |
| Feature flags | Código en el artefacto, activación selectiva por configuración | Desacoplar deploy de release por funcionalidad (ver `feature-flags.md`) |

## Cambios de base de datos en el pipeline

Perfil de riesgo por sublenguaje SQL:

| Tipo | Modifica | Reversibilidad | Riesgo en deploy |
|------|----------|----------------|------------------|
| DDL (CREATE/ALTER/DROP) | Estructura | Baja (un DROP COLUMN pierde datos) | Alto: puede romper compatibilidad con el código |
| DML (INSERT/UPDATE/DELETE) | Datos | Media | Medio: puede corromper datos sin validación |
| DCL (GRANT/REVOKE) | Permisos | Alta | Bajo, pero puede bloquear el sistema |

La BD es parte constitutiva del sistema entregable, no un recurso externo. Si el código pasa por validación continua pero la BD se modifica con scripts manuales "de alguien que sabe", la entrega es parcial con un punto ciego operativo.

### Principios

1. **Versionar todo cambio de esquema**: cada migración es un archivo versionado en el mismo repositorio que el código. Permite recrear el esquema desde cero, saber qué versión de esquema corresponde a qué versión de código y reproducir el estado en cualquier entorno.
2. **Migraciones como código**: nombres descriptivos, orden explícito (`001_...`, `002_...`), idempotentes o seguras de ejecutar una vez, ejecutables sin intervención manual, con verificación.
3. **Cambios aditivos y compatibles**: no romper la versión actual ni las inmediatamente anteriores de la aplicación. Agregar columnas con default/null; no renombrar ni eliminar columnas en uso; cambios destructivos **en fases** (ej. renombrar columna: Fase 1 agregar `username`, poblar, código nuevo la usa mientras el viejo lee `user_name`; Fase 2 eliminar `user_name` cuando ningún código en producción la usa). Es branch by abstraction aplicado al esquema. Objetivo: desacoplar el despliegue de la aplicación de la migración de la BD.
4. **Migraciones integradas al pipeline**: el commit stage ejecuta migraciones sobre BD de prueba, verifica consistencia del esquema y corre integración contra él; cada deploy a un entorno ejecuta sus migraciones pendientes. Los DBA participan sin ser cuello de botella.
5. **Rollback o mitigación**: si es revertible, incluir script de rollback junto a la migración; si no, diseñarlo para no romper la versión anterior; si es destructivo e irreversible, tratarlo como release de alto riesgo con plan explícito. La pregunta no es "¿puedo revertir siempre?" sino "¿qué hago cuando no puedo?": fases, compatibilidad transitoria, validación previa.

Mecanismo de migración: orden determinista, tracking de migraciones aplicadas, invocable automatizadamente, visibilidad de qué versión de esquema tiene cada entorno. Ejemplos: Flyway (JVM), Alembic (Python), EF Migrations (.NET), Knex/Prisma (Node).

### Anti-patrones (BD)
Scripts manuales sin versionar; migraciones que asumen un estado del esquema sin verificarlo; cambios destructivos sin fase de transición; BD de prueba que no refleja el esquema real; migración acoplada al deploy con coordinación humana; datos de referencia insertados a mano; migraciones probadas por primera vez en producción.

## Configuración de entornos

Configuración = todo lo que varía entre ambientes: cadenas de conexión, URLs de servicios, credenciales, flags, parámetros de infraestructura. Debe almacenarse **con la aplicación pero separada de ella**.

### Principios

1. **Separar configuración del artefacto**: un solo artefacto, la configuración se inyecta por entorno. Un binario "armado para producción" viola construir-una-sola-vez.
2. **Versionar la configuración**: registro trazable de qué configuración se aplicó en cada entorno y cuándo.
3. **Verificar la configuración en el pipeline**: smoke tests de configuración (conexión a BD y servicios), validación de esquema de config (variables requeridas presentes y tipadas), drift detection (declarada vs efectiva).
4. **Secretos separados**: nunca en texto plano en el repo. Se versiona la estructura y los valores no sensibles; los secretos se referencian (vault/pipeline) pero no se almacenan.
5. **Reproducibilidad del entorno**: creación automatizada, configuración trazable, sin "ajustes manuales" que se pierden al recrear.

Gestión conjunta — código + esquema + configuración avanzan coordinados por el pipeline:

| Elemento | Se versiona | Se verifica | Se promueve |
|----------|-------------|-------------|-------------|
| Código | Repositorio | Compilación, unit y acceptance tests | Artefacto único entre etapas |
| Esquema BD | Migraciones en el repo | Migraciones en BD de prueba + integración | Migraciones ejecutadas en cada deploy |
| Configuración | Archivos versionados + vault | Smoke tests, validación de esquema, drift detection | Inyección por entorno en el deploy |

### Anti-patrones (configuración)
Configuración solo en el servidor; secretos en el repositorio; entornos snowflake (irrepetibles e inauditables); "no se puede probar porque depende de la config de producción".

## Infraestructura como código (IaC)

Tratar la definición de infraestructura (máquinas, redes, SO, servicios) como artefactos de software: texto versionado, revisado como el código, aplicado por procesos automatizados. Resuelve los entornos snowflake: servidores con años de ajustes manuales no registrados que nadie puede reconstruir.

Propiedades del proceso (independientes de la herramienta):
- **declarativo**: describir estado deseado, no secuencia de comandos;
- **idempotente**: aplicar la misma definición converge siempre al mismo estado;
- **reproducible**: recrear el entorno completo desde definiciones versionadas;
- **auditable**: todo cambio con autor, momento y motivo en el historial.

Principios: versionar todas las definiciones; automatizar el aprovisionamiento desde un estado conocido; servidores como **ganado, no mascotas** (se reemplazan, no se reparan in situ); probar cambios de infraestructura en entorno aislado con smoke y acceptance tests antes de producción; integrar la IaC al pipeline (lint en commit stage, apply por entorno); separar provisioning / configuración / despliegue. La diferencia entre entornos pasa de estructural a **paramétrica**: mismas definiciones con valores específicos.

### Anti-patrones (IaC)
Scripts de provisioning sin versionar; IaC aplicada solo la primera vez y luego cambios a mano; cambios manuales "de emergencia" sin actualizar definiciones antes de cerrar el incidente; definiciones divergentes por entorno; probar la IaC solo en producción; secretos mezclados en las definiciones.
