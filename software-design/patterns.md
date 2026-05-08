# ROL: SYSTEM DIRECTIVE: DESIGN PATTERNS EXPERT (GoF)

**PROPÓSITO:** Instrucciones ultra-comprimidas para evaluar, decidir e implementar Patrones de Diseño (Gang of Four), minimizando el contexto y maximizando la precisión arquitectónica.

---

## 1. ¿POR QUÉ APLICARLOS? (Matriz de Riesgo)
Aplica patrones para resolver problemas recurrentes que degradan la arquitectura y rompen los principios SOLID.
* **Evitar "Reinventar la Rueda":** No crear soluciones ad-hoc inestables para problemas que ya tienen plantillas estructurales probadas.
* **Erradicar Antipatrones:** Destruir "Código Espagueti" (dependencias N:M), "Objetos Dios", explosión de subclases (jerarquías kilométricas) y "Código Espagueti Lógico" (cadenas infinitas de `if/switch`).
* **Regla de Contención (Anti-Sobreingeniería):** NUNCA aplicar un patrón si una refactorización básica, el principio KISS o una simple composición bastan. Aplica solo cuando la complejidad intrínseca lo exija.

## 2. ¿QUÉ SON? (Definición Core)
Plantillas o esquemas de colaboración entre objetos que solucionan problemas de diseño específicos en un contexto dado.
* **Creacionales:** Abstraen el proceso de instanciación (quién, cómo y cuándo se crean los objetos).
* **Estructurales:** Abstraen la composición de objetos (cómo ensamblar objetos y clases para formar estructuras mayores).
* **De Comportamiento:** Abstraen el control de flujo y la comunicación (reparto de responsabilidades entre objetos).

## 3. ¿PARA QUÉ APLICARLOS? (Criterios de Éxito)
* **Destruir el Acoplamiento Fuerte:** Eliminar dependencias de plataformas, de representaciones concretas, de algoritmos específicos y de instanciaciones explícitas de clases.
* **Garantizar el Principio Abierto/Cerrado (OCP):** El código resultante debe permitir añadir nuevas características agregando nuevas clases, NO modificando el código existente.
* **Maximizar Cohesión y Reusabilidad:** Los objetos se enfocan en una tarea y delegan el resto, permitiendo que las partes del sistema se reutilicen en otros contextos.


# Catálogo de Patrones de Diseño

Los patrones de diseño se dividen en tres grandes categorías: **Creacionales** (abstracción del proceso de instanciación), **Estructurales** (composición de clases u objetos) y **De Comportamiento** (interacción y reparto de responsabilidades).

---

## 1. Patrones Creacionales

Los patrones creacionales abstraen el proceso de instanciación, ocultando cómo se crean y asocian las instancias.

### 1.1. Abstract Factory
* **Problema**: Un sistema debe ser independiente de cómo se crean sus productos o debe configurarse con una familia de productos entre varias, sin especificar su clase concreta.
* **Solución**: Define una interfaz (`AbstractFactory`) para crear familias de objetos (`AbstractProduct`). Las subclases concretas (`ConcreteFactory`) implementan la creación de los productos específicos (`ConcreteProduct`).
* **Implementación**: Se puede añadir un parámetro a las operaciones de creación para especificar el tipo de objeto a crear, mejorando la flexibilidad pero perdiendo seguridad de tipos.
* **Consecuencias**: Aísla las clases concretas, facilita el intercambio de familias de productos y promueve la consistencia. Sin embargo, añadir nuevos tipos de productos es difícil porque requiere cambiar la interfaz de la fábrica abstracta y todas sus subclases.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Crear un objeto especificando su clase explícitamente, Dependencias de plataformas hardware o software.
  * **Problemas de Rediseño**: Acoplamiento, Implementación.

### 1.2. Builder
* **Problema**: El algoritmo para crear un objeto complejo debe ser independiente de sus partes y de cómo se ensamblan, permitiendo diferentes representaciones.
* **Solución**: Un `Director` delega la construcción paso a paso a un `AbstractBuilder`. El `ConcreteBuilder` implementa la construcción y ensambla el `ConcreteProduct`.
* **Implementación**: Rara vez es útil definir una clase padre común `AbstractProduct` porque las representaciones creadas suelen ser muy diferentes.
* **Consecuencias**: Permite variar la representación interna del producto, oculta cómo se ensambla y proporciona un control fino sobre el proceso de construcción.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Especificar la implementación de los objetos, Dependencias de las representaciones o implementaciones de objetos.
  * **Problemas de Rediseño**: Implementación, Acoplamiento.

### 1.3. Factory Method
* **Problema**: Una clase no puede prever la clase de objetos que debe crear y quiere delegar esta responsabilidad a sus subclases.
* **Solución**: Un `Creator` define un método de fabricación (abstracto o con comportamiento por defecto). El `ConcreteCreator` implementa o redefine este método para instanciar el `ConcreteProduct`.
* **Implementación**: Puede ser una clase abstracta sin implementación por defecto o una clase que provee una implementación básica. También puede parametrizarse para crear múltiples tipos de productos.
* **Consecuencias**: Útil para jerarquías de clases paralelas. Sin embargo, puede forzar al cliente a crear subclases de `Creator` únicamente para instanciar un nuevo producto.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Crear un objeto especificando su clase explícitamente.
  * **Problemas de Rediseño**: Acoplamiento.

### 1.4. Prototype
* **Problema**: El sistema debe ser independiente de cómo se crean sus productos, especialmente si las clases a instanciar se determinan en tiempo de ejecución o si se quiere evitar una jerarquía de fábricas.
* **Solución**: Se declara una interfaz `Prototype` con un método de clonación. El `ConcretePrototype` implementa la clonación (copia superficial o profunda). El cliente solicita copias al prototipo.
* **Implementación**: Puede requerir un registro o gestor de prototipos para creación dinámica. El mayor reto es decidir entre copia profunda (deep copy) o superficial (shallow copy).
* **Consecuencias**: Oculta las clases concretas al cliente, permite añadir productos en tiempo de ejecución y reduce la necesidad de herencia.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Crear un objeto especificando su clase explícitamente.
  * **Problemas de Rediseño**: Acoplamiento.

### 1.5. Singleton
* **Problema**: Debe existir exactamente una instancia de una clase y proporcionar un punto de acceso global a la misma.
* **Solución**: La clase `Singleton` encapsula su propia instancia estática y provee un método de clase (ej. `getInstance()`) para acceder a ella.
* **Implementación**: Puede usar inicialización diferida o registro de Singletons para permitir subclasificación polimórfica.
* **Consecuencias**: Control estricto del acceso, reducción del espacio de nombres globales y permite configurar el sistema dinámicamente.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Especificar la implementación de los objetos.
  * **Problemas de Rediseño**: Implementación.

---

## 2. Patrones Estructurales

Se basan en la composición de objetos y clases para formar estructuras más grandes y complejas.

### 2.1. Adapter
* **Problema**: Se necesita utilizar una clase existente, pero su interfaz no coincide con la que requiere el cliente.
* **Solución**: Un `Adapter` envuelve al `Adaptee` (la clase incompatible) y expone la interfaz `Target` que el `Client` espera.
* **Implementación**: Puede implementarse como *Adapter de Clases* (usando herencia múltiple) o *Adapter de Objetos* (usando composición delegando a la instancia).
* **Consecuencias**: Permite la integración con bibliotecas o sistemas legados. El Adapter de objetos permite trabajar con el `Adaptee` y todas sus subclases simultáneamente.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Fuerte acoplamiento, Dependencias de interfaces incompatibles.
  * **Problemas de Rediseño**: Acoplamiento.

### 2.2. Bridge
* **Problema**: Se necesita desacoplar una abstracción de su implementación para que ambas puedan variar de manera independiente (evitando jerarquías paralelas).
* **Solución**: La jerarquía `Abstraction` mantiene una referencia a la jerarquía `Implementor`. Las variaciones operan sobre la abstracción y delegan el trabajo específico al implementador.
* **Implementación**: Si sólo existe una implementación, la interfaz `Implementor` puede omitirse. Se puede usar un `Abstract Factory` para decidir el implementador en tiempo de ejecución.
* **Consecuencias**: Evita ligar permanentemente una implementación, reduce la dependencia de compilación y mejora la extensibilidad independiente.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Dependencias de plataformas hardware o software, Dependencias de las representaciones o implementaciones de objetos.
  * **Problemas de Rediseño**: Acoplamiento, Reusabilidad.

### 2.3. Composite
* **Problema**: Los clientes necesitan tratar objetos individuales y composiciones de objetos de manera uniforme en jerarquías parte-todo.
* **Solución**: Se define un `Component` base. Las hojas (`Leaf`) no tienen hijos y definen el comportamiento primitivo. Los compuestos (`Composite`) almacenan hijos e implementan el comportamiento delegando a los hijos.
* **Implementación**: Existe un balance entre seguridad (operaciones de gestión de hijos solo en el Composite) y transparencia (operaciones de gestión en el Component base).
* **Consecuencias**: Simplifica el cliente eliminando condicionales, facilita agregar nuevos componentes, pero puede hacer el diseño demasiado general y requerir validaciones en tiempo de ejecución.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Fuerte acoplamiento, Determinar la granularidad de los objetos.
  * **Problemas de Rediseño**: Acoplamiento, Granularidad, Cohesión.

### 2.4. Decorator
* **Problema**: Se requiere agregar responsabilidades a objetos individuales dinámicamente sin afectar otros objetos y evitar una explosión de subclases por herencia.
* **Solución**: Un `Decorator` envuelve al `Component` abstracto y mantiene su misma interfaz. El `ConcreteDecorator` añade comportamiento antes o después de delegar la petición al componente.
* **Implementación**: Se puede omitir la clase abstracta `Decorator` si solo hay una responsabilidad que añadir.
* **Consecuencias**: Alternativa flexible a la herencia estática, pagas solo por lo que usas (añadir comportamiento a la carta). Sin embargo, resulta en muchos objetos pequeños y difíciles de depurar.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Añadir funcionalidad mediante herencia.
  * **Problemas de Rediseño**: Principio Abierto/Cerrado.

### 2.5. Facade
* **Problema**: Un subsistema es demasiado complejo de usar para la mayoría de los clientes debido al alto acoplamiento con múltiples clases internas.
* **Solución**: Una clase `Facade` provee una interfaz unificada de alto nivel que delega las peticiones a los componentes internos del `Subsystem` apropiados.
* **Implementación**: Puede implementarse como interfaz abstracta para desacoplar completamente al cliente de los detalles del subsistema.
* **Consecuencias**: Promueve el bajo acoplamiento, organiza los subsistemas por capas, pero no restringe a los clientes avanzados de usar el subsistema directamente si lo necesitan.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Fuerte acoplamiento.
  * **Problemas de Rediseño**: Acoplamiento.

### 2.6. Flyweight
* **Problema**: Costo prohibitivo de memoria debido a la creación masiva de objetos idénticos o casi idénticos.
* **Solución**: Extrae el estado independiente del contexto (*intrínseco*) en un objeto compartido `Flyweight`. El cliente proporciona el estado dependiente del contexto (*extrínseco*) en tiempo de ejecución.
* **Implementación**: Se usa un `FlyweightFactory` para gestionar el pool (almacenamiento) y asegurar que los objetos se compartan apropiadamente.
* **Consecuencias**: Ahorro drástico de memoria. Aumenta la complejidad en tiempo de ejecución debido al paso y cálculo del estado extrínseco.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Determinar la granularidad de los objetos.
  * **Problemas de Rediseño**: Granularidad.

### 2.7. Proxy
* **Problema**: Necesidad de controlar el acceso a un objeto original (por seguridad, carga diferida o ubicación remota) sin cambiar la forma en que los clientes interactúan con él.
* **Solución**: Un `Proxy` implementa la misma interfaz que el `RealSubject` y mantiene una referencia a éste, interceptando las llamadas antes de delegarlas.
* **Implementación**: Puede implementarse como Proxy Virtual (carga diferida), Proxy Remoto o Proxy de Protección.
* **Consecuencias**: Introduce un nivel de indirección útil. En el caso de Proxies Remotos, puede ocultar problemas de red y generar penalizaciones de tiempo imprevistas para el cliente.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Dependencias de las representaciones o implementaciones de objetos.
  * **Problemas de Rediseño**: Acoplamiento.

---

## 3. Patrones de Comportamiento

Definen la asignación de responsabilidades y la comunicación entre los objetos.

### 3.1. Chain of Responsibility
* **Problema**: Múltiples objetos pueden procesar una petición, pero no se conoce al manejador a priori y se desea desacoplar el emisor del receptor.
* **Solución**: Los receptores (`ConcreteHandler`) se encadenan. Si un manejador no puede resolver la petición, la pasa a su sucesor en la cadena.
* **Implementación**: Usar enlaces existentes (como jerarquías parte-todo) o definir nuevos. Riesgo de seguridad de tipos si se pasan parámetros sin un objeto estructurado.
* **Consecuencias**: Simplifica las interconexiones, pero no garantiza que la petición sea procesada (puede llegar al final de la cadena sin ser atendida).
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Fuerte acoplamiento.
  * **Problemas de Rediseño**: Acoplamiento.

### 3.2. Command
* **Problema**: Parametrizar objetos con acciones, encolar peticiones o soportar deshacer operaciones (undo).
* **Solución**: Encapsula una petición en un objeto `Command`. El `Invoker` ejecuta el comando, el cual llama a la acción correspondiente en el `Receiver`.
* **Implementación**: Los comandos pueden ser simples delegadores o implementar todo el código. Pueden guardar estado para soportar la función `undo()`.
* **Consecuencias**: Desacopla quien invoca de quien ejecuta, fácil de extender. Permite macro-comandos.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Dependencias algorítmicas, Fuerte acoplamiento.
  * **Problemas de Rediseño**: Acoplamiento.

### 3.3. Interpreter
* **Problema**: Existe un lenguaje sencillo a interpretar y se pueden representar sus reglas como un árbol de sintaxis abstracta.
* **Solución**: Se define una jerarquía basada en `AbstractExpression`, subdividida en `TerminalExpression` y `NonTerminalExpression`. El cliente evalúa la expresión con un `Context`.
* **Implementación**: El patrón no define el proceso de parseo, solo la interpretación. Para gramáticas donde hay repetición, se puede combinar con `Flyweight`.
* **Consecuencias**: Fácil cambiar la gramática por herencia. Ineficiente y difícil de mantener para gramáticas muy complejas.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Especificar la implementación de los objetos para gramáticas.
  * **Problemas de Rediseño**: Implementación.

### 3.4. Iterator
* **Problema**: Exponer el contenido secuencial de un objeto agregado sin exponer su representación interna (lista, árbol, etc.).
* **Solución**: Un `Iterator` encapsula la lógica de recorrido extraído del `Aggregate`.
* **Implementación**: Puede ser externo (controlado por el cliente) o interno (el iterador recibe una operación).
* **Consecuencias**: Soporta recorridos concurrentes, polimórficos, y simplifica la interfaz del agregado.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Dependencias de las representaciones o implementaciones de objetos (colecciones).
  * **Problemas de Rediseño**: Acoplamiento.

### 3.5. Mediator
* **Problema**: Componentes fuertemente interconectados que hacen que el sistema parezca un monolito difícil de reutilizar.
* **Solución**: Un objeto `Mediator` centraliza las interacciones complejas. Los `Colleague` solo se comunican con el Mediador y no entre sí.
* **Implementación**: Puede utilizarse el patrón `Observer` para que los colegas notifiquen cambios al mediador.
* **Consecuencias**: Desacopla componentes transformando relaciones N:M en 1:N. Sin embargo, el Mediador puede volverse excesivamente complejo (God Object).
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Fuerte acoplamiento, Poner a funcionar los mecanismos de reutilización.
  * **Problemas de Rediseño**: Acoplamiento, Reusabilidad.

### 3.6. Memento
* **Problema**: Necesidad de realizar copias de seguridad del estado de un objeto para poder restaurarlo, sin romper la encapsulación.
* **Solución**: El `Originator` crea un `Memento` opaco que contiene su estado interno. El `Caretaker` guarda los mementos sin poder inspeccionar su contenido.
* **Implementación**: Depende fuertemente del lenguaje para simular la interfaz doble ancha/estrecha.
* **Consecuencias**: Simplifica al Originator y aísla los estados. Puede consumir mucha memoria si se guardan copias enormes muy a menudo.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Dependencias de las representaciones o implementaciones de objetos, Fuerte acoplamiento.
  * **Problemas de Rediseño**: Acoplamiento.

### 3.7. Observer
* **Problema**: Cuando el estado de un objeto cambia, otros objetos dependientes necesitan ser notificados y actualizados sin conocer a priori quiénes son.
* **Solución**: Un `Subject` mantiene una lista de objetos `Observer`. Cuando su estado muta, itera llamando a `update()` en todos sus observadores registrados.
* **Implementación**: Modos Push vs Pull. Se debe prevenir la inconsistencia en medio de la actualización.
* **Consecuencias**: Bajo acoplamiento Sujeto-Observador. Peligro de actualizaciones en cascada espurias, degradando el rendimiento.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Fuerte acoplamiento.
  * **Problemas de Rediseño**: Acoplamiento.

### 3.8. State
* **Problema**: El comportamiento de un objeto depende estrictamente de su estado interno, provocando largos condicionales `switch`/`if`.
* **Solución**: Encapsula el comportamiento asociado a un estado en una clase `State` separada. El `Context` delega las ejecuciones a la instancia `ConcreteState` en curso.
* **Implementación**: Las transiciones pueden definirse en el contexto o ser delegadas a las propias clases de estado.
* **Consecuencias**: Transiciones explícitas y organizadas. Aumenta la cantidad de objetos en memoria.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Encontrar objetos apropiados, Dependencias algorítmicas por estado.
  * **Problemas de Rediseño**: Cohesión, Acoplamiento.

### 3.9. Strategy
* **Problema**: Existen múltiples variantes de un algoritmo y tenerlos juntos crea condicionales gigantes rompiendo el Principio de Responsabilidad Única.
* **Solución**: Extrae la familia de algoritmos en clases separadas que implementan una interfaz común `Strategy`. El `Context` consume la estrategia de manera intercambiable.
* **Implementación**: El contexto puede pasar sus datos como parámetros a la estrategia o pasarse a sí mismo.
* **Consecuencias**: Elimina condicionales y es fácil de extender. Aumenta la cantidad de objetos.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Dependencias algorítmicas.
  * **Problemas de Rediseño**: Acoplamiento.

### 3.10. Template Method
* **Problema**: Varias clases comparten el esqueleto de un algoritmo pero difieren en la implementación de ciertos pasos específicos.
* **Solución**: Una `AbstractClass` define el algoritmo principal llamando a métodos abstractos u operaciones vacías. Las subclases `ConcreteClass` redefinen dichos pasos.
* **Implementación**: Se recomienda minimizar los métodos abstractos y marcar el Template Method como `final`.
* **Consecuencias**: Promueve la reutilización de código (Inversión de Control). Demasiados métodos primitivos vuelven engorroso el diseño.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Dependencias algorítmicas, Poner a funcionar los mecanismos de reutilización.
  * **Problemas de Rediseño**: Acoplamiento, Reusabilidad.

### 3.11. Visitor
* **Problema**: Necesidad de agregar operaciones complejas a los elementos de una estructura heterogénea sin modificar las clases de dichos elementos.
* **Solución**: Un `Visitor` encapsula la operación por elemento. La jerarquía de elementos implementa un método `accept(Visitor)` haciendo uso de *doble-despacho*.
* **Implementación**: Se resuelve qué código ejecutar combinando la clase del visitante y la del elemento en tiempo de ejecución.
* **Consecuencias**: Fácil agregar nuevas operaciones. Si la jerarquía de los elementos muta frecuentemente, es un patrón costoso de mantener.
* **Problemas de Diseño y Rediseño**:
  * **Problemas de Diseño**: Añadir funcionalidad mediante herencia, Fuerte acoplamiento.
  * **Problemas de Rediseño**: Principio Abierto/Cerrado, Acoplamiento.
