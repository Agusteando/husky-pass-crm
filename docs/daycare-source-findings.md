# Hallazgos legacy usados para fase guardería

Este documento resume el comportamiento identificado en el zip legacy y cómo se reimplementa sin copiar archivos.

## Autenticación interna

El login interno legacy usaba Google Identity y `newLogin.php`. La sesión guardaba `id`, `email`, `displayName`, `plantel`, `picture`, `role`, `campus`, `empresa`, `unidad`, `sala` y `routes`. La nueva ruta `/admin/login` conserva esa forma funcional, pero la separa del login familiar y verifica el ID token en servidor.

## Autenticación familiar

Las cuentas familiares de guardería viven en `users` con `role` tipo Husky, `unidad`, `sala`, `username`, `email` y `plaintext`. La nueva ruta `/login` mantiene login tradicional contra MySQL y solo acepta cuentas con alcance Husky/daycare.

## Recursos familiares

El dashboard familiar legacy leía `recursos` por `unidad`, `sala` y `type`:

- `hw`: tareas.
- `news`: circulares.
- `cal`: calendario.

También leía `valores_mensuales` por `MONTHNAME(CURDATE())`. La nueva implementación mantiene esos filtros.

## Administración de sala

La administración legacy obtenía salas desde `salas` por `unidad`, usuarios desde `users` filtrando `role LIKE '%HUSKY%'`, y publicaciones desde `recursos`. La nueva implementación conserva esos accesos con consultas parametrizadas y middleware de alcance.

## Personas Autorizadas

Los archivos y consultas de Personas Autorizadas no se migran como producto ni UI. Cualquier uso de tablas relacionadas queda fuera de pantalla, salvo lectura mínima de hijos para soporte de identidad familiar cuando se solicite por API. No hay rutas de Personas Autorizadas en Nuxt.
