# Fundamentos de CI/CD

## Integración vs Entrega vs Despliegue Continuo

- **Integración Continua (CI)**: integrar frecuentemente en una línea principal compartida, validando cada integración con build y pruebas automáticas. Su objetivo no es desplegar, sino evitar que la integración sea un evento tardío, traumático y costoso.
- **Entrega Continua (CD)**: extiende CI asegurando que el sistema quede **siempre en estado liberable**. Cualquier cambio aceptado por el pipeline podría llegar a producción de forma rutinaria. La decisión de release deja de depender de trabajo técnico pendiente: liberar es una decisión de negocio, no una limitación técnica.
- **Despliegue Continuo**: caso extremo — todo cambio que pasa el pipeline se despliega automáticamente a producción. Se puede hacer Entrega Continua sin Despliegue Continuo.

Objetivo (Humble & Farley): que la entrega desde las manos de los desarrolladores hasta producción sea un proceso confiable, predecible, visible y en gran medida automatizado, con riesgos cuantificables.

## Lote, feedback y riesgo

Tres conceptos que atraviesan toda la práctica:

- **Lote de cambio**: cuántas modificaciones se acumulan antes de integrar o desplegar.
- **Feedback**: cuánto tarda el sistema en decir si el cambio está bien o mal.
- **Riesgo**: cuánta incertidumbre se acumula antes de detectar un problema.

Relación directa: cuanto más grande el lote → más tarde llega el feedback → más caro entender qué pasó → mayor riesgo operativo y de negocio. Reducir el tamaño de lote no es estilo: disminuye variabilidad, acelera detección de errores y reduce el costo de corrección.

Por qué importa:
- la integración tardía incrementa el costo del error;
- los lotes grandes acumulan incertidumbre y complejidad cognitiva;
- los procesos manuales aumentan variabilidad e imprevisibilidad;
- el feedback tardío vuelve más costosa la corrección;
- la falta de recuperación rápida eleva el impacto de las fallas.

Rapidez sin estabilidad no es madurez de delivery: es **aceleración del desorden**.

## Propiedades deseables de un sistema apto para CD

1. **Siempre liberable**: sin trabajo técnico pendiente para poder liberar.
2. **Cambios pequeños e integración frecuente**: evitar ramas largas como modo normal.
3. **Diseñado para testabilidad**: responsabilidades claras, dependencias controladas, aislamiento fácil, comportamiento observable.
4. **Bajo acoplamiento y dependencias explícitas**: un cambio local no debe obligar a coordinar múltiples partes.
5. **Deploy separado de release**: desplegar sin exponer inmediatamente toda funcionalidad nueva.
6. **Compatibilidad evolutiva**: cambios aditivos y reversibles; nunca exigir sincronización perfecta entre componentes (APIs, contratos, esquemas de BD).
7. **Configuración, infraestructura y datos como parte del sistema**: versionables, repetibles, automatizables.
8. **Artefactos verdaderamente desplegables**: autosuficientes, portables entre ambientes, promovibles sin reconstrucción.
9. **Comportamiento observable en operación**: health, readiness, logging, monitoreo.
10. **Automatizar lo repetible sobre un proceso primero entendido**: sin pasos manuales opacos ni conocimiento tribal.

## Variables organizacionales que habilitan o bloquean CD

- **Tamaño de lote**: si la organización impone comités o ventanas de cambio, el lote está fijado desde afuera.
- **WIP (Work In Progress)**: más WIP → ramas más largas → integración más costosa. Limitar el trabajo en curso.
- **Definition of Done**: una DoD que termina en "código mergeado" es incompatible con CD; debe alcanzar al menos *desplegado a producción y observable*.
- **Ownership**: "you build it, you run it" correlaciona con alto desempeño; la separación estricta dev/ops con handoffs, con bajo desempeño.
- **Cultura de aprendizaje**: culturas generativas (postmortems sin culpa, fallas como señal) sostienen CD; las de búsqueda de culpables la bloquean.

Señales de organización incompatible: gates burocráticos sin información nueva, releases calendarizados, métricas de actividad en vez de flujo, QA manual obligatorio pre-release, incidentes tratados como fallas individuales.

## De dónde vienen las prácticas

| Origen | Aporte |
|--------|--------|
| XP (Beck, 1999) | Nivel técnico: CI, TDD, refactoring, small releases, simple design |
| Agile (2001) | Gestión: iteración corta, entrega incremental, feedback temprano |
| Lean (2003) | Flujo, tamaño de lote, eliminar desperdicio |
| DevOps (2009) | Condición organizacional: ownership compartido de build y run |
| Continuous Delivery (2010) | Pipeline de despliegue como práctica sistematizada |
| Accelerate (2018) | Evidencia empírica de qué prácticas correlacionan con desempeño |

- **TDD** (Red → Green → Refactor): feedback de diseño, cobertura emergente, habilita refactoring continuo. Sus pruebas pueblan el commit stage.
- **BDD** (Given-When-Then): especificación ejecutable en lenguaje de negocio. Sus pruebas pueblan el acceptance stage y definen "terminado".

Agile "de ceremonias" sin fundamentos técnicos (CI, tests, refactoring) produce mayor frecuencia de entrega con peor estabilidad.
