# ROL: SYSTEM DIRECTIVE: MODULAR DESIGN DECISION & EXECUTION ENGINE

**PROPÓSITO:** Instrucciones comprimidas para evaluar, decidir y ejecutar arquitecturas de software basadas en Diseño Modular.

---

## 1. CONTEXTO DECISIONAL: ¿POR QUÉ APLICARLO? (Matriz de Riesgo)
Aplica estas directivas si el proyecto presenta síntomas de "Código Podrido" (mala mantenibilidad) o riesgos económicos.

* **El Problema Económico:** Prevenir el incumplimiento del alcance, tiempo y coste del proyecto.
* **El Problema Técnico (Deuda):** Evitar software *viscoso* (difícil de entender), *rígido* (difícil de cambiar), *frágil* (se rompe al probarlo) e *inmóvil* (imposible de reutilizar).
* **El Engaño del "Experto de la Información":** Inspirarse puramente en el mundo real genera "Objetos Dios". Asignar múltiples responsabilidades tecnológicas (UI, BD, lógicas) a una entidad solo porque "tiene los datos" dispara el acoplamiento y destruye la cohesión.

## 2. EL OBJETIVO: ¿PARA QUÉ APLICARLO? (Criterio de Éxito)
El diseño se aprueba únicamente si transforma el sistema hacia la mantenibilidad extrema:
* **Fluidez:** Clases pequeñas sin dependencias cíclicas.
* **Flexibilidad:** Responsabilidades aisladas que cambian por un único motivo.
* **Robustez:** Alta capacidad de implementar pruebas unitarias.
* **Reusabilidad:** Componentes completamente desacoplados de algoritmos y tecnologías específicas.

## 3. REGLAS DE EJECUCIÓN: ¿QUÉ ES Y CÓMO REALIZARLO?
El Diseño Modular exige el equilibrio de tres pilares absolutos: Alta Cohesión, Bajo Acoplamiento y Tamaños Pequeños.

### Regla A: Granularidad y Límites de Tamaño
Obligatorio fraccionar el código para controlar el coste de desarrollo vs. coste de integración.
* **Módulos/Paquetes:** Máximo 12 a 20 clases.
* **Clases:** Media de 3 atributos (máximo 5), 20 a 25 métodos máximo, y un límite de 200 a 500 líneas de código.
* **Métodos:** 1 a 3 parámetros máximo, 10 a 25 líneas de código máximo, un máximo de 3 sentencias anidadas, y una complejidad ciclomática máxima de 10 a 15.

### Regla B: Alta Cohesión (Principio de Responsabilidad Única)
Una clase/método debe hacer una sola cosa y tener un único motivo de cambio.
* **Refactorizaciones Inmediatas:**
  * *Métodos Largos:* Extraer fragmentos en métodos privados más pequeños.
  * *Cambio Divergente:* Si una clase cambia por múltiples razones (ej. BD y UI), divídela.
  * *Envidia de Características:* Si un método accede constantemente a datos de otra clase, muévelo a la clase que posee esos datos.
  * *Clases de Datos / Grupos de Datos (Data Clumps):* Agrupa parámetros repetitivos en un objeto (ej. límite inferior y superior -> clase `Intervalo`).

### Regla C: Bajo Acoplamiento y Jerarquización
Minimizar dependencias para lograr flexibilidad.
* **Diseño Top-Down:** Construir la jerarquía de arriba hacia abajo, evitando ciclos.
* **Ley de Demeter (No hables con extraños):** Un método solo puede enviar mensajes a: `this`, sus parámetros directos, sus atributos, o variables instanciadas localmente. Prohibido encadenar llamadas indirectas.
* **Eliminar Intimidad Inapropiada:** Convertir relaciones bidireccionales complejas en unidireccionales o utilizar delegación.

### Regla D: Patrones de Indirección (Desacoplamiento)
Utilizar componentes intermedios para mediar entre capas y objetos:
* **Invención Pura:** Crear clases artificiales (no existentes en el dominio de negocio) para agrupar lógica cohesiva.
* **Vista Separada:** Extraer toda regla de negocio de la capa de presentación.
* **Controlador:** Las interfaces (UI) nunca procesan eventos; solo los capturan y delegan a un Controlador.
* **Creador:** Asignar la instanciación de un objeto `A` a un objeto `B` solo si `B` agrega, registra o usa estrechamente a `A`.

### Regla E: Diseño por Contrato y Abstracción
* **Aserciones vs. Programación Defensiva:** Reemplazar condicionales dispersos (`if-else` de validación) por Aserciones formales.
* **Contratos:** Definir explícitamente *Precondiciones* (lo que el cliente debe cumplir) y *Postcondiciones* (lo que el servidor garantiza).
* **Interfaces Primitivas y Completas:** Exponer solo el comportamiento esencial, sin sorpresas ni efectos secundarios.