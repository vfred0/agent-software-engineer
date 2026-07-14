# Métricas de Accelerate / DORA

Accelerate (Forsgren, Humble, Kim) sintetiza 4 años de investigación (23.000+ respuestas, 2.000+ organizaciones). Tesis central: el desempeño en entrega de software **puede medirse** y se relaciona con el desempeño global de la organización. Las 4 métricas son de **resultado, no de actividad**, y obligan a mirar el delivery como sistema completo.

## Las 4 métricas

### 1. Deployment Frequency (velocidad)
Frecuencia con la que el equipo despliega a producción. Es un proxy del tamaño de lote: despliegue más frecuente → lote más pequeño → menos riesgo, feedback más rápido. Mide capacidad de entrega, no valor de negocio.

### 2. Lead Time for Changes (velocidad)
Tiempo desde que el código se commitea hasta que corre exitosamente en producción. Captura la velocidad real del flujo de entrega completo, no solo "cuánto tarda programar". Lead time corto también permite corregir incidentes con rapidez y confianza.

### 3. Change Failure Rate (estabilidad)
Porcentaje de cambios desplegados que degradan el servicio o requieren remediación (rollback, hotfix, patch, fix-forward). Métrica de calidad operativa del cambio: contrapeso de las métricas de velocidad. Anclada en cambios desplegados, no en bugs abstractos.

### 4. Time to Restore Service / MTTR (estabilidad)
Tiempo en restaurar el servicio ante incidente o degradación. Expresa resiliencia operativa; resume observabilidad, tamaño de cambios, trazabilidad del despliegue, facilidad de rollback/fix-forward y claridad de ownership.

## Lectura conjunta

- Dos métricas miden **tiempo** (lead time, deployment frequency); dos miden **estabilidad** (MTTR, change failure rate).
- **No existe trade-off inevitable entre velocidad y estabilidad**: los high performers mejoran ambas a la vez. En 2017, vs low performers: 46x más despliegues, lead time 440x más rápido, recuperación 170x más rápida, 5x menos fallas por cambio.
- Las categorías (high/medium/low, luego elite) surgen empíricamente por análisis de clusters, no por umbrales arbitrarios.
- Los ejecutivos tienden a sobreestimar la madurez respecto de quienes hacen el trabajo: medir con precisión y comunicar resultados es necesario para decidir.

## Capacidades que explican el desempeño

24 capacidades en 5 áreas: continuous delivery, arquitectura, producto/proceso, lean management/monitoring, cultura. Entre las más decisivas:
control de versiones, deployment automation, integración continua, test automation, trunk-based development, arquitectura desacoplada, equipos empoderados, trabajo en lotes pequeños, feedback de cliente, límites de WIP, monitoreo, cultura generativa.

Complemento: la utilización al 100% empeora el lead time — sin holgura no hay capacidad de absorber variación, trabajo no planificado ni mejora.

## Relación con métricas de código

- Métricas de análisis estático (cobertura, complejidad, acoplamiento) hablan de la **salud estructural del código**.
- Métricas DORA hablan del **desempeño del sistema de entrega**.
- No se reemplazan: unas detectan riesgo técnico temprano, otras evalúan si el proceso completo mejora o se degrada.
