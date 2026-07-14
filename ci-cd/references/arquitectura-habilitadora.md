# La arquitectura como habilitador de la entrega continua

La integración continua no depende solo de herramientas: exige propiedades del software. Con alto acoplamiento, responsabilidades confusas o complejidad innecesaria, incluso cambios pequeños se vuelven costosos de probar, difíciles de integrar y riesgosos de desplegar — el pipeline existe pero la capacidad real de integrar con frecuencia no.

## Dimensiones de una arquitectura apta para CD

- **Soportar cambios pequeños e integración frecuente**: modificaciones graduales, compatibilidad transitoria; una variación no debe obligar a reestructurar demasiadas partes a la vez.
- **Testabilidad**: facilidad de aislamiento, control de dependencias, verificación automatizada temprana. Si un sistema es difícil de probar, es difícil de integrar y liberar con confianza.
- **Gestión del acoplamiento y las dependencias**: dependencias explícitas, trazables y versionables; un cambio local no debe volverse intervención global.
- **El sistema entregable no es solo el código**: configuración, infraestructura y datos son decisiones de arquitectura, no elementos externos.
- **Compatibilidad progresiva**: cambios aditivos, tolerar estados de transición, desacoplar el despliegue aplicativo de transformaciones irreversibles de datos.
- **Observabilidad operativa**: exponer señales de vivo/listo/comportamiento aceptable tras un cambio.
- **Separar deploy de release**: desplegar sin exponer; la exposición es decisión de negocio (ver `feature-flags.md`).
- **Artefactos desplegables**: el build produce artefactos autosuficientes, portables y promovibles sin reconstrucción ad hoc.

## Calidad interna y costo de cambio

La calidad interna (arquitectura) no la percibe el usuario, pero determina el costo de cambio: con mala calidad interna el progreso es rápido al principio y luego cada cambio pequeño exige entender grandes áreas de código y produce fallos inesperados. **Abordar la calidad interna desde la perspectiva económica**: alta calidad interna reduce el costo de futuras funcionalidades (Fowler). Un code smell es una señal superficial de un problema más profundo — indicador, no el problema en sí.

Síntomas de diseño incompatible con integración frecuente:
- cambios chicos de negocio que obligan a tocar muchas clases;
- pruebas que requieren demasiada infraestructura;
- conflictos de merge frecuentes sobre los mismos archivos;
- coordinación excesiva entre personas para cerrar una tarea;
- miedo a integrar porque "todavía no está todo listo".

## Componentes y dependencias

- **Librería**: paquete que el equipo no controla, se actualiza poco. **Componente**: pieza desarrollada por el equipo u otros equipos de la organización, se actualiza con frecuencia.
- Un componente es una unidad manejable de construcción, dependencia, versionado y prueba. Dividir en componentes solo sirve si las dependencias siguen siendo comprensibles, controlables y versionables.
- **Evitar ciclos entre componentes**: un ciclo incrementa acoplamiento y reduce la capacidad de cambiar, probar y desplegar con seguridad. Una estructura acíclica (o por capas) da dirección de dependencias clara y reduce el impacto del cambio.

### Cohesión de paquetes (Clean Architecture)

- **REP** (Reuse/Release Equivalence): la unidad que se reutiliza debe coincidir con la unidad que se libera/versiona.
- **CCP** (Common Closure): las clases que cambian por las mismas razones van juntas en el mismo paquete.
- **CRP** (Common Reuse): las clases que se reutilizan juntas van juntas; no depender de clases que no se necesitan.

## Arquitecturas de referencia

- **Hexagonal (puertos y adaptadores)**: la asimetría relevante es interior/exterior, no izquierda/derecha. La aplicación se comunica por **puertos** (API con protocolo definido); cada dispositivo externo tiene un **adaptador** (GUI, tests automatizados, batch, HTTP, BD real o en memoria). Resuelve la infiltración de lógica de negocio en UI/infraestructura, que impide probar automatizadamente y controlar el sistema desde otros programas.
- **Clean Architecture**: sistemas independientes de frameworks, UI, base de datos y agentes externos; comprobables sin elementos externos. **Regla de dependencia**: las dependencias de código apuntan solo hacia adentro (entidades ← casos de uso ← adaptadores de interfaz ← detalles). Los círculos son esquemáticos; la regla es lo invariante.

Ambas producen exactamente lo que CD necesita: reglas de negocio testeables en aislamiento, dependencias controladas y detalles reemplazables.
