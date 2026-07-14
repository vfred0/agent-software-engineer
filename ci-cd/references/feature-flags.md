# Feature flags

## Desacoplar deploy de release

- **Deploy**: poner una versión del software en un entorno. Operación técnica.
- **Release**: exponer una funcionalidad a los usuarios. Decisión de negocio.

Cuando están acoplados, cada despliegue expone lo nuevo; el equipo se protege desplegando menos, acumula cambios y cada release se vuelve un evento excepcional. La estrategia de CD invierte la relación: desplegar barato y frecuente; activar cada funcionalidad como decisión separada, controlada, reversible y granular.

Un **feature flag** condiciona la ejecución de una funcionalidad a un valor de configuración, sin modificar ni redesplegar código. Lo relevante no es el `if`, sino lo que permite:
- integrar código incompleto en la rama principal sin exponerlo;
- desplegar varias veces al día aunque una funcionalidad no esté terminada;
- activar por subconjunto de usuarios, apagar en producción sin redeploy;
- experimentos controlados (A/B) y separación deploy/release.

Con trunk-based development: **branch by abstraction** para cambios estructurales en fases; **feature flags** para cambios funcionales ya en el artefacto que no deben ser visibles. Ambos mantienen el sistema siempre desplegable sin ramas largas.

## Tipos de flags (Hodgson)

| Tipo | Propósito | Duración esperada | Dinamismo |
|------|-----------|-------------------|-----------|
| Release toggle | Ocultar funcionalidad en progreso | Corta (días/semanas) | Estático por deploy o config |
| Experiment toggle | Dividir tráfico para A/B testing | Media (semanas) | Dinámico por usuario |
| Ops toggle | Apagar/degradar funcionalidad en incidentes | Larga (permanente) | Dinámico, rápido |
| Permission toggle | Habilitar por usuarios o planes | Muy larga (permanente) | Dinámico por usuario |

La distinción importa: costo de mantenimiento, granularidad y mecanismo de decisión cambian por tipo. Un release toggle activo dos años no es un toggle: es deuda técnica disfrazada.

## Ciclo de vida de un release flag

1. **Introducción**: flag apagado; el código nuevo convive con el viejo.
2. **Desarrollo**: se integra código detrás del flag en cada commit.
3. **Validación**: activación en entornos internos, luego canary/staff.
4. **Rollout**: porcentajes crecientes de usuarios.
5. **Estabilización**: activo al 100%.
6. **Limpieza**: se elimina el flag y el código del camino viejo.

El paso 6 es el más descuidado y **no es opcional**: es parte de entregar la funcionalidad. Un flag sin fecha tentativa de retiro probablemente no debía introducirse como release toggle. Un flag olvidado deja dos caminos de código que nadie prueba, complejidad condicional acumulada y pérdida de certeza sobre qué hace el sistema en producción.

## Implementación

- **Mínimo**: variable de configuración leída al inicio; alcanza para un release toggle estático por entorno.
- **Deseable** (canary, A/B, kill switch): evaluación en tiempo real sin redeploy; decisión por contexto (usuario, tenant, región, porcentaje); auditoría de quién cambió qué y cuándo; visibilidad de flags activos por entorno; integración con observabilidad. Construir vs adoptar depende de volumen de flags, granularidad y costo operativo.

## Flags y testing

Cada flag agrega una dimensión combinatoria (n flags → 2^n combinaciones). Probar el producto cartesiano es inviable e innecesario. Práctica razonable:
- probar la combinación por defecto (lo que está en producción hoy);
- probar todos los flags nuevos activados (estado futuro post-rollout);
- probar cada flag nuevo individualmente, con el resto en default;
- no probar combinaciones de flags funcionalmente independientes.

Si dos flags interactúan, es una señal de acoplamiento a tratar como diseño, no como caso de prueba extra.

## Observabilidad

Un flag que no se puede observar no sirve como control operativo. Para kill switch o rollout se necesita responder en tiempo real: ¿qué flags están activos, con qué valor y para qué segmento? ¿qué error rate/latencia/conversión tiene el camino activo vs el inactivo? ¿quién cambió el flag por última vez y cuándo? Sin eso, apagar un flag ante un incidente es un acto de fe.

## Anti-patrones

- **Flags permanentes que nacieron como temporales**: un `if` estructural que nadie revisa.
- **Proliferación sin inventario**: nadie sabe cuántos flags hay, cuáles están activos ni cuándo retirarlos.
- **Flags anidados**: condicionales dependientes de combinaciones; complejidad exponencial.
- **Flag como sustituto de diseño**: mantener dos variantes vivas por meses en lugar de decidir.
- **Sin auditoría ni observabilidad**: cambios en producción sin log ni visibilidad de efectos.
- **Probar solo la rama activa**: el camino apagado deja de funcionar silenciosamente.
- **Flag solo en el repositorio**: si cambiarlo requiere deploy, se pierde el desacople deploy/release.
- **Usuarios hardcodeados en el código** en lugar de modelar segmentación.
