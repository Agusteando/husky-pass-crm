# Husky Pass CRM

Phase 1 Nuxt rebuild for Husky Pass daycare administration, daycare family access, and Personas Autorizadas family access. The project uses the existing MySQL database as the source of truth and does not introduce schema changes or migrations.

## Scope

Included:

- Internal daycare administrators through `/admin/login` with Google auth.
- Daycare admin workspace under `/admin/daycare` and `/admin/daycare/salas`.
- Daycare family access through `/login` and `/familia/daycare`.
- Personas Autorizadas family access through `/login` and `/familia/personas-autorizadas`.
- New-platform PA QR, credential, print, and validation screens.
- Super admin handling for `desarrollo.tecnologico@casitaiedis.edu.mx` after verified Google login.

Out of scope:

- Bitácora, CRM, matrícula, informes, tickets, SIAG, formación, talleres, marketing, and unrelated legacy modules.

## Admin daycare architecture

The admin experience is a workspace, not a set of legacy compatibility screens.

Primary model:

1. Select unidad.
2. Select sala.
3. Manage familias, tareas, avisos, and calendario.
4. Preview or impersonate the family experience when needed.

Canonical admin routes:

- `/admin/daycare`: daycare command center.
- `/admin/daycare/salas`: unidad/sala command center.
- `/admin/daycare/salas/[id]`: sala workspace summary.
- `/admin/daycare/salas/[id]/familias`: family accounts and impersonation.
- `/admin/daycare/salas/[id]/tareas`: homework publications.
- `/admin/daycare/salas/[id]/avisos`: notices and communications.
- `/admin/daycare/salas/[id]/calendario`: calendar publications.

## Family routes

- `/familia`: product chooser when a parent has more than one product scope.
- `/familia/daycare`: daycare family dashboard.
- `/familia/daycare/tareas`: daycare homework.
- `/familia/daycare/avisos`: daycare notices.
- `/familia/daycare/calendario`: daycare calendar.
- `/familia/personas-autorizadas`: Personas Autorizadas panel.
- `/familia/personas-autorizadas/[id]`: authorized person detail.
- `/familia/personas-autorizadas/[id]/qr`: QR screen.
- `/familia/personas-autorizadas/[id]/credencial`: credential preview.
- `/familia/personas-autorizadas/[id]/imprimir`: print view.
- `/validar/persona-autorizada/[id]`: scan/validation view.

## Auth model

`/login` is shared parent/family login. It creates a normalized family session and resolves product scopes from existing MySQL data. `sala` is daycare-specific and must not block Personas Autorizadas users.

`/admin/login` is internal Google login. Admin daycare access remains separate from family login.

## Database

Relevant existing tables include `users`, `rutas_rol`, `salas`, `recursos`, `valores_mensuales`, `personas_autorizadas`, `alumno_pa`, `matricula`, and `credenciales`.

No Prisma, migrations, schema rewrites, fake mappings, or hardcoded fallback roles are used.
