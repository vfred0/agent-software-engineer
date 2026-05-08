---
description: "Guide for Software Engineer best practices"
---

# Software Architecture Guide for Medium/Large Projects

## Glossary

### Architectural Concepts

* **Architecture**: The fundamental organization of a system, embodied in its components, their relationships to each other and the environment, and the principles governing its design and evolution.
* **Coupling**: The degree of interdependence between software modules. Low coupling is desirable as it increases maintainability and reusability.
* **Cohesion**: The degree to which elements within a module work together toward a single, well-defined purpose. High cohesion is desirable.
* **Separation of Concerns (SoC)**: The principle of dividing a system into distinct sections, each addressing a separate concern or responsibility.
* **Single Responsibility Principle (SRP)**: A module or class should have only one reason to change, meaning it should have only one job or responsibility.
* **Screaming Architecture**: An architectural approach where the system's structure clearly expresses its business purpose and intent (Package-by-Feature).
* **KISS (Keep It Simple, Stupid)**: A design principle stating that systems work best if they are kept simple rather than made complicated.
* **DRY (Don't Repeat Yourself)**: A principle aimed at reducing repetition of software patterns, replacing it with abstractions or using data normalization.
* **Domain-Driven Design (DDD)**: An approach to software development that centers the development on programming a model that has a deep understanding of the processes and rules of a domain.

### Visual Documentation (PlantUML)

* **Class Diagram**: A static structure diagram that describes the structure of a system by showing its classes, their attributes, methods, and the relationships (inheritance, composition, aggregation) between them.
* **Sequence Diagram**: A dynamic behavior diagram that shows how objects interact in a particular scenario of a use case, focusing on the sequence of messages exchanged.
* **Activity Diagram**: A behavioral diagram that represents the flow of activities and actions in a system, often used to model business workflows and complex algorithmic logic.

### Layers and Dependencies

* **Layer**: A logical grouping of components that share similar responsibilities and abstraction levels within the system.
* **Business Layer**: Contains core business logic, rules, and domain-specific operations independent of external concerns.
* **Application Layer**: Orchestrates business operations, handles use cases, and coordinates between different business components.
* **Presentation Layer**: Handles user interaction, input/output, serialization, and communication protocols.
* **Infrastructure Layer**: Provides concrete implementations for external concerns like databases, file systems, and third-party services.
* **Dependency Inversion**: Higher-level modules should not depend on lower-level modules; both should depend on abstractions (interfaces).
* **Explicit Dependencies**: Dependencies that are clearly defined and visible, typically through interfaces or constructor parameters.

### Design Patterns and Concepts

* **Interface**: A contract that defines what methods a class must implement without specifying how they are implemented.
* **Immutability & Records**: The use of immutable data structures (like `record` types) to pass data securely between layers (DTOs, Value Objects) without risk of unintended state mutation.
* **Parameter Object Pattern**: Grouping multiple related parameters into a single cohesive object or record to reduce method signatures.
* **Dependency Injection (DI)**: A technique where dependencies are provided to a component rather than the component creating them itself.
* **Repository Pattern**: An abstraction layer that encapsulates data access logic and provides a uniform interface for accessing data.
* **Event-Driven Architecture**: A design pattern where components communicate through events, promoting loose coupling.

## Core Principles & Code Constraints

### 1. Contextual Grouping (Package-by-Feature)
The project structure should clearly express its business purpose. Organize files, classes, and interfaces into folders or packages based on their Business Context or Feature (Bounded Contexts), rather than strictly by technical layers.

### 2. Strict Sizing Rules
To enforce the Single Responsibility Principle and maintain extreme readability:
* **Classes**: Must not exceed **150 lines** of code. If a class grows larger, it must be split into smaller, specialized components or delegates.
* **Methods**: Must be focused and strict, remaining between **10 to 20 lines** of code. Apply the Extract Method pattern if necessary.
* **Parameters**: Methods are limited to **1 to 3 parameters**. If more are required, apply the Parameter Object Pattern (group them into a `record or similar`).


### 3. Naming Conventions & Language
* **General Language**: All code, variables, and structural elements must be strictly in **English**.
* **Classes, Interfaces, and Records**: Must be definitive **Nouns** (e.g., `InvoiceProcessor`, `UserRepository`).
* **Methods**: Must be definitive **Verbs** indicating the action (e.g., `calculateTotal`, `fetchActiveUsers`).
* **Enums Constraint**: Enum *names* must be in English, but their declared *values* MUST be in **Spanish** (e.g., `enum DocumentStatus { APPROVED("APROBADO"), REJECTED("RECHAZADO") }`).

### 4. Zero Comments Rule
Code must be self-documenting through precise naming and small structural sizes.
* **Strict Constraint**: Do not write any explanatory comments in the code.
* **Exception**: A single-line comment is uniquely permitted only to indicate the explicit application of a Design Pattern (e.g., `// Pattern: Strategy`).

## Visual Architecture Standards (PlantUML)

This guide standardizes on **PlantUML** for all architectural and behavioral documentation. Documentation must live close to the code in the `docs/` and include the README.adoc.

### 1. Static Structure: Class Diagrams
Used to map out the domain model, interfaces, and design patterns.
* **Focus**: Show relationships (Associations, Dependencies) and enforcing Dependency Inversion.
* **Guideline**: Do not map the entire system in one diagram. Create focused Class Diagrams per Bounded Context or Feature.

### 2. Dynamic Interactions: Sequence Diagrams
Used to map how components collaborate to fulfill a specific Use Case or API request.
* **Focus**: Method calls, synchronous/asynchronous messages, and return data across architectural layers (Presentation -> Application -> Business -> Infrastructure).

### 3. Business Workflows: Activity Diagrams
Used to document complex algorithms, business rules, or state changes within a service.
* **Focus**: Decision trees, parallel processing, and step-by-step logic.

## 🤖 AI Context & Extended Best Practices

To fully understand and apply our Software Engineering best practices, any AI assistant or developer **MUST** review and strictly adhere to the guidelines defined in the following foundational documents before generating code, tests, or diagrams:

- **Software Design** (Architecture, OOP, SOLID, Patterns): `./skills/software-design/index.md`
- **Software Testing** (Strategy, Mocks, AAA Pattern): `./skills/software-testing/index.md`
- **Documentation** (PlantUML syntax, AsciiDoc formatting): `./skills/docs/index.md`