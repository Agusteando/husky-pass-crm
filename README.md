# husky-pass-crm

Nueva implementación Nuxt para la fase 1 de Husky Pass CRM: guardería únicamente.

El proyecto no copia archivos legacy. Reimplementa los flujos detectados en el sistema anterior con una capa explícita sobre la base MySQL existente, sin migraciones y sin cambios de esquema.

## Alcance de fase 1

- Familias de guardería con login tradicional en `/login`.
- Administradores internos con Google Login en `/admin/login`.
- Panel familiar con tareas, circulares, calendario y valor del mes por `unidad` y `sala`.
- Panel administrativo para salas, familias y recursos de guardería.
- Bitácora diaria para usuarios internos autorizados.
- Separación estricta: Personas Autorizadas no forma parte de esta fase.

## Tablas legacy preservadas

El código usa las tablas existentes de forma directa: `users`, `rutas_rol`, `salas`, `recursos`, `valores_mensuales`, `alumno_pa`, `matricula` y `bitácoras`. No crea migraciones, no cambia tipos y no normaliza el esquema.

## Configuración

Copia `.env.example` a `.env` y configura credenciales MySQL, `SESSION_SECRET` y `GOOGLE_CLIENT_ID`.

```bash
npm install
npm run dev
```

## Rutas principales

- `/login`: acceso familiar tradicional.
- `/daycare`: dashboard de familias.
- `/daycare/recursos/tareas`, `/daycare/recursos/circulares`, `/daycare/recursos/calendario`: vista familiar por tipo.
- `/admin/login`: acceso interno con Google.
- `/admin/daycare`: dashboard administrativo.
- `/admin/daycare/salas/[id]`: gestión de una sala.
- `/admin/daycare/salas/[id]/usuarios`: cuentas familiares de la sala.
- `/admin/daycare/salas/[id]/tareas`, `/circulares`, `/calendario`: recursos por sala.
- `/admin/daycare/bitacora`: bitácora interna.
