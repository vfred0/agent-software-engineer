# Estrategias de branching para entrega continua

> Un lote de cambio pequeño es una unidad de cambio cuyo alcance permite integrarla pronto, probarla con rapidez, aislar sus efectos con claridad y liberarla con bajo riesgo.

La estrategia de branch no es solo convención de Git: es consecuencia del diseño del software y de la organización del trabajo. La estrategia más compatible con CD es la que **minimiza el tiempo entre desarrollo e integración**. Con alto acoplamiento y responsabilidades difusas, dos personas en tareas distintas compiten por las mismas clases y generan conflictos de merge y conflictos semánticos; las ramas se alargan como mecanismo de contención de un diseño que dificulta integrar.

Regla operativa (Humble & Farley): commitear a la línea principal al menos una vez al día, normalmente varias veces.

## Desarrollo en la rama principal (trunk-based)

Es la única estrategia que permite integración continua real. Los desarrolladores envían casi siempre a la rama principal; las ramas se usan en raras ocasiones y son de vida corta. Beneficios:
- integración continua de todo el código;
- los desarrolladores adoptan los cambios de los demás de inmediato;
- se evitan los problemas de fusión e integración al final del proyecto.

GitFlow y las ramas de larga duración acumulan divergencia, retrasan feedback y convierten cada merge en un evento arriesgado.

## Branch by abstraction

Los cambios complejos no justifican semanas de aislamiento en una rama. En vez de ramificar el repositorio, se crea una **capa de abstracción o punto de indirección en el diseño**, de modo que la implementación vieja y la nueva coexistan durante la transición. El equipo migra gradualmente llamadas, comportamiento o componentes sin dejar de integrar sobre la rama principal.

Principio: cuando un cambio es demasiado grande para hacerse de una vez, se diseña para introducirlo gradualmente manteniendo compatibilidad, no se aísla en una rama larga. (La misma lógica aplica a esquemas de BD — ver `estrategias-release.md` — y se complementa con feature flags para cambios funcionales — ver `feature-flags.md`.)

## Ship / Show / Ask

Estrategia que combina pull requests con integración frecuente. Cada cambio se clasifica:

- **Ship**: se fusiona a la rama principal sin revisión.
- **Show**: se abre PR para revisión, pero se fusiona de inmediato (la revisión es post-merge, informativa).
- **Ask**: se abre PR para discusión antes de fusionar.

Reglas:
- la aprobación no debe ser requisito para fusionar un PR;
- los autores fusionan sus propios PRs y deciden si su cambio es Ship, Show o Ask;
- se sostiene con las técnicas de CI/CD que mantienen la rama principal lista para release;
- las ramas no tienen vida prolongada y se actualizan con la principal con frecuencia.

## Criterio de selección

| Situación | Estrategia |
|-----------|------------|
| Modo normal de trabajo | Trunk-based, commits diarios, ramas cortas si existen |
| Cambio estructural grande (reemplazo de componente, migración) | Branch by abstraction, en fases sobre trunk |
| Funcionalidad incompleta que no debe exponerse | Trunk + feature flag (release toggle) |
| Necesidad de revisión de código | Ship/Show/Ask según riesgo del cambio, nunca ramas largas esperando aprobación |
