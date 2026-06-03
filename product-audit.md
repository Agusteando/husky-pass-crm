# Auditoría de capacidades

## Roles y recorridos

- Personal interno daycare: entra por `/admin/login`, queda limitado por alcance interno de guardería y administra salas, familias y publicaciones visibles para familias. Las publicaciones operan contra `recursos` con tipos reales `hw`, `news` y `cal`; el campo `resource` se mantiene como enlace/archivo publicado existente en el modelo.
- Familias daycare: entran por `/login`, reciben alcance familiar `daycare` solo cuando su cuenta tiene unidad y sala reales. Ven tareas, avisos y calendario filtrados por unidad, sala y `hidden = 0`.
- Familias Personas Autorizadas: entran por `/login`, reciben alcance `personasAutorizadas` por rutas o registros reales en `alumno_pa` / `personas_autorizadas`. Este flujo no exige `sala`.
- Superadmin: entra por `/admin/login`, accede a `/admin/superadmin`, filtra usuarios por plantel, revisa alcances familiares e internos, e impersona cuentas familiares reales para soporte.

## Decisiones de completitud

- No se agregaron migraciones, tablas, seed data, cuentas falsas ni roles alternos.
- La impersonación de cuentas reales quedó restringida a superadmin. La vista familiar de sala para daycare interno sigue siendo una previsualización de contenido de sala, no una impersonación de usuario real.
- Las superficies visibles se mantienen conectadas a APIs y consultas MySQL reales. No se añadieron anuncios, tareas, eventos ni textos de comunicación simulados.
- La gestión interna de contenido daycare ahora conserva `timestamp` al crear/editar recursos para evitar que avisos nuevos queden agrupados de forma ambigua por consultas familiares heredadas.
