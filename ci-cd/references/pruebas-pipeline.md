# Pruebas en el pipeline de entrega continua

CD requiere una estrategia deliberada de pruebas que produzca feedback rápido, confiable y progresivamente más rico. No se trata de "tener muchos tests", sino de organizar tipos de prueba según la evidencia que aportan y el momento del pipeline en que conviene ejecutarlas.

## Los 4 cuadrantes (Humble & Farley)

Dos ejes: orientación (negocio vs tecnología) y función (apoyar el desarrollo vs criticar el proyecto).

| Cuadrante | Ejemplos | Rol en el pipeline |
|-----------|----------|--------------------|
| Business-facing / apoyan el desarrollo | Especificaciones ejecutables, pruebas de aceptación en lenguaje del dominio | Esenciales para confianza funcional temprana; acceptance stage |
| Technology-facing / apoyan el desarrollo | Unit tests, pruebas técnicas de componentes | **Las más críticas**: sostienen el feedback rápido del commit stage |
| Business-facing / critican el proyecto | Exploratorias, usabilidad, revisión funcional desde el usuario | Valiosas pero costosas/manuales; más tardías |
| Technology-facing / critican el proyecto | Performance, capacidad, seguridad, resiliencia | Importantes pero típicamente tardías y costosas |

- Las pruebas de aceptación corren en entorno similar a producción, deben ser deterministas, validar el **qué** (comportamiento funcional) y no el cómo; no necesariamente por UI. Funcionan como especificación ejecutable legible por negocio (BDD permite autogenerar documentación de requisitos siempre actualizada).
- No todo se automatiza: usabilidad, coherencia visual y pruebas exploratorias las hacen mejor las personas.

## Niveles de prueba (de más cerca del código a más cerca del sistema en ejecución)

1. **Unit tests**: primera línea de defensa; rápidas, aisladas, en cada build; si fallan, el build falla; dan confianza para refactorizar; deben ser muchas más que las de niveles superiores; insuficientes solas.
2. **Integration tests**: verifican que cada parte funcione con lo que depende (BD, colas, servicios, APIs, otro módulo). Alcance acotado: escenarios enormes vuelven lento el diagnóstico y frágil el mantenimiento.
3. **Package/component y system tests**: las primeras validan un bloque técnico autónomo (focalizadas, baratas); las segundas el comportamiento observable del sistema completo (amplias, lentas, costosas).
4. **Acceptance tests**: validan criterios de aceptación de negocio, tras las unitarias y sobre entorno desplegado.
5. **Smoke tests**: pocas verificaciones post-deploy de disponibilidad operativa (ver `pipeline-despliegue.md`).

Ningún nivel reemplaza a los demás; una estrategia sana combina niveles para reducir incertidumbre rápido y con buen costo.

## Dobles de prueba (Meszaros)

- **Dummy**: se pasa como argumento pero nunca se usa; rellena parámetros.
- **Fake**: implementación funcional con atajo inadecuado para producción (ej. BD en memoria).
- **Stub**: respuestas predefinidas a las llamadas de la prueba.
- **Spy**: stub que además registra cómo fue llamado (ej. cuántos mails se enviaron).
- **Mock**: preprogramado con expectativas de llamadas; falla ante llamadas inesperadas y se verifica al final.

## Pruebas según la madurez del proyecto

- **Proyecto nuevo**: empezar con pruebas de aceptación automatizadas desde el inicio. Proceso: negocio define criterios de aceptación → testers y devs los automatizan → devs implementan el comportamiento → cualquier test que falla se corrige con prioridad. Testear desde el inicio produce mejor encapsulación, intención más clara y separación de responsabilidades.
- **Proyecto intermedio**: automatizar primero los flujos de mayor valor de negocio (conversación con el cliente para identificarlos), aceptando más pruebas manuales proporcionales mientras se cubre solo el caso ideal.
- **Proyecto legacy**: primero build automatizado; luego un esqueleto de smoke tests sobre la funcionalidad de mayor valor (sin sobreinvertir); después pruebas incrementales para el comportamiento nuevo, por capas (primera capa: lo que bloquea probar/desarrollar; segunda: lo crítico de cada historia). Validar con cuidado el estado de la aplicación al final de cada prueba, porque el código poco modular produce efectos colaterales lejanos.

## Análisis estático en el commit stage

Examen automático del código sin ejecutarlo: si ciertas métricas no cumplen umbrales definidos, el commit stage **falla como fallaría un test**. Las pruebas validan comportamiento; el análisis estático inspecciona propiedades estructurales. Juntos mejoran la señal temprana.

Métricas relevantes:
- **Cobertura**: señal parcial, nunca objetivo fetichizado. Detectar zonas sin protección y caídas abruptas; no premiar tests triviales ni bloquear por décimas.
- **Duplicación**: mirar duplicación nueva, módulos críticos y tendencia, no solo la foto absoluta.
- **Complejidad ciclomática**: señala candidatos a refactorización; no es criterio único de diseño.
- **Acoplamiento aferente/eferente**: cuántos dependen de un módulo / de cuántos depende. El costo de cambio sube aunque el build siga verde.
- **Warnings**: congelar línea base, impedir warnings nuevos en código modificado, reducir el stock gradualmente.
- **Estilo**: barato de automatizar; libera la revisión humana para lo importante.
- **Reglas de arquitectura y dependencias**: capas que no deben depender entre sí, ausencia de ciclos, APIs prohibidas. Suelen valer más que las métricas superficiales porque atacan la erosión arquitectónica.

Umbrales: pocas reglas de alto valor; bloquear degradaciones nuevas antes que exigir corregir todo lo histórico; vigilar falsos positivos; **mantener el commit stage rápido** — si medir lo vuelve lento, se perdió una propiedad central. Una métrica convertida en objetivo aislado deja de informar y distorsiona el comportamiento.
