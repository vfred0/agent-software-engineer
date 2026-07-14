# Pipeline de despliegue

El deployment pipeline es la **manifestación automatizada del proceso para llevar software desde control de versiones hasta las manos de los usuarios** (Humble & Farley). Es el patrón clave que permite la entrega continua: un sistema de validación y promoción de cambios que entrega feedback temprano, conserva trazabilidad y hace rutinario el pasaje de commit a release.

Qué NO es: un servidor de CI a secas, tareas inconexas, aprobaciones humanas sin evidencia técnica nueva, un script de despliegue manual, ni recompilar el mismo código en cada ambiente.

## Anatomía mínima

Cada etapa agrega evidencia nueva sobre el **mismo candidato a release**; el cambio avanza por evidencia, no por aprobación administrativa. Filtrar temprano lo que ya está mal: la validación se encarece a medida que avanza.

| Etapa | Pregunta que responde | Evidencia principal | Decisión |
|-------|------------------------|---------------------|----------|
| Commit stage | ¿el cambio está sano técnicamente? | compilación, tests rápidos, análisis estático, artefacto | crear o descartar candidato |
| Acceptance test gate | ¿el sistema entrega el comportamiento esperado? | pruebas funcionales y de regresión en entorno más real | promover o bloquear |
| Etapas posteriores | ¿soporta exigencias adicionales reales? | pruebas no funcionales, exploratorias, capacidad, seguridad, UAT | habilitar release |
| Release / deployment | ¿puede desplegarse de forma segura y repetible? | despliegue automatizado, smoke tests, rollback, trazabilidad | liberar o revertir |

### Commit stage
- Se ejecuta en cada commit; idealmente < 5 minutos, nunca > 10.
- Incluye: compilación/empaquetado, tests de commit (predominantemente unitarios), análisis estático y creación del artefacto.
- Falla ante problemas de compilación, tests o umbrales de calidad. Elimina cuanto antes los candidatos obviamente malos.

### Acceptance test gate
- Reduce incertidumbre funcional: unit tests no alcanzan (un sistema con buena cobertura puede no arrancar).
- Corre sobre un entorno razonablemente parecido al real; no se terceriza a un equipo separado; si falla, el equipo reacciona de inmediato.

### Release
- Debe ser **push-button**: elegir una versión validada y desplegarla de modo repetible, ensayado muchas veces antes con el mismo mecanismo.
- Con capacidad de back-out/rollback y tratando configuración, infraestructura y datos como parte del sistema.

## Prácticas fundamentales

1. **Construir los binarios una sola vez**: el mismo artefacto que pasó commit stage y aceptación se promueve entre ambientes. Recompilar reintroduce variabilidad y rompe la trazabilidad entre lo probado y lo liberado.
2. **Desplegar del mismo modo en todos los ambientes**: misma mecánica de despliegue; la configuración varía externamente; sin "pasos especiales para producción".
3. **Separar binario y configuración**: el artefacto no viene "armado para staging" o "para producción"; la configuración se inyecta.
4. **Hacer visible el estado del pipeline**: qué commits rompieron, qué candidatos existen, qué versión corre en cada ambiente, duración de etapas, cuellos de botella.
5. **Medir para optimizar el flujo completo**: duración de etapas, tasa de fallas, esperas, retrabajo. Pregunta de fondo: ¿cuánto tarda un cambio en volverse liberable y llegar a usuarios?
6. **Release y rollback como procesos repetibles**: procedimiento automatizado, plan explícito, smoke tests post-deploy, criterio de aceptación del despliegue, estrategia de rollback o forward-fix. No debe existir un proceso distinto para rollback: cuanto menos practicado, menos confiable.

## Smoke tests y validación post-deploy

Un despliegue no es exitoso porque el script terminó en verde. Los smoke tests son pocas verificaciones rápidas sobre el sistema **ya desplegado**: ¿arrancó, quedó accesible, ejecuta comportamientos críticos?

- Detectan el problema clásico de "despliegue exitoso pero sistema roto": configuración incorrecta, wiring erróneo, credenciales, puertos, migraciones incompletas.
- Deben ser pocas, rápidas y críticas: la app levanta, responde healthcheck, se conecta a la BD, expone un endpoint crítico, ejecuta una operación principal simple.
- Se ejecutan inmediatamente después de cada deploy y producen una decisión rápida: apto / no apto.
- No reemplazan pruebas unitarias, de integración ni de aceptación.

## Anti-patrones

- **Recompilar en cada ambiente**: destruye la garantía de que lo liberado es lo probado.
- **Promover código fuente en lugar de artefactos**: sin cadena confiable entre evidencia y release.
- **Artefactos específicos por ambiente** ("para QA", "para producción"): no se promueve el mismo candidato.
- **Commit stage lento**: deja de dar feedback temprano y la disciplina de integración se degrada.
- **Acceptance tests rotos durante días**: un gate roto persistentemente deja de ser gate y se convierte en ruido.
- **Despliegue manual como evento excepcional**: pasos especiales, personas "indispensables", checklist irrepetible → no hay delivery continuo aunque haya CI.
- **Aprobar sin nueva evidencia**: una etapa manual solo se justifica si agrega información o una decisión de negocio real; si no, aumenta lead time sin reducir riesgo.
