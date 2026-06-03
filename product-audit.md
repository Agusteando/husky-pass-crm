# Auditoría de capacidades

## Roles y recorridos

- Personal interno daycare: entra por `/admin/login`, queda limitado por su alcance interno de guardería y administra salas, familias y publicaciones visibles para familias. Las publicaciones usan la tabla real `recursos` con los tipos existentes `hw`, `news` y `cal`; el campo `resource` se mantiene como enlace/ruta de archivo publicado porque ese es el soporte existente del modelo.
- Familias daycare: entran por `/login`, reciben alcance familiar `daycare` solo cuando su cuenta tiene unidad y sala reales. Ven tareas, avisos y calendario filtrados por unidad, sala y `hidden = 0`.
- Familias Personas Autorizadas: entran por `/login`, reciben alcance `personasAutorizadas` por rutas o registros reales en `alumno_pa` / `personas_autorizadas`. Este flujo no exige `sala`.
- Superadmin: entra por `/admin/login`, accede de forma protegida y visible a `/admin/superadmin`, filtra usuarios por plantel, revisa alcances familiares e internos, e impersona cuentas familiares reales para soporte.

## Recorridos completados

- Tareas, avisos y calendario tienen gestión interna completa sobre `recursos`: crear, editar, publicar, ocultar/despublicar y eliminar.
- Las publicaciones ocultas ya no desaparecen del panel interno; pueden filtrarse, revisarse y volver a publicarse sin tocar la experiencia familiar.
- La familia daycare sigue consumiendo solamente registros publicados (`hidden = 0`), por lo que la capacidad de ocultar/despublicar no expone contenido inactivo.
- Los recursos enlazados desde `resource` se mantienen gestionables desde el formulario interno y siguen abriéndose desde la vista familiar.
- Superadmin es descubrible desde la navegación administrativa y vuelve al tablero superadmin al terminar una impersonación de cuenta real.

## Decisiones de completitud

- No se agregaron migraciones, tablas, seed data, cuentas falsas ni roles alternos.
- La impersonación de cuentas reales quedó restringida a superadmin. La vista familiar de sala para daycare interno sigue siendo una previsualización de contenido de sala, no una impersonación de usuario real.
- Las superficies visibles se mantienen conectadas a APIs y consultas MySQL reales. No se añadieron anuncios, tareas, eventos ni textos de comunicación simulados.
- La publicación/despublicación usa `recursos.hidden`, que ya existía en el modelo consultado por la app.
