# husky-pass-crm

Implementación Nuxt de la Fase 1 de Husky Pass CRM sobre la base MySQL existente.

El proyecto no copia archivos legacy. Reimplementa los flujos de guardería y autenticación necesarios con una capa MySQL explícita, sin migraciones y sin cambios de esquema.

## Alcance de Fase 1

- Login familiar tradicional en `/login`, con sesión de cuenta y alcances de producto resueltos desde MySQL.
- Administradores internos de guardería con Google Login en `/admin/login`.
- Panel familiar de guardería solo para cuentas con alcance de guardería: tareas, avisos/comunicados, calendario mensual, valor del mes, Richmond y PASE.
- Panel administrativo de guardería para salas, cuentas familiares, tareas, circulares y calendario, con selector de unidad/sala y vista controlada de cuenta familiar.
- Personas Autorizadas como alcance familiar independiente de guardería, sin requerir `sala`, únicamente para cuentas que lo tengan concedido por datos o permisos existentes en MySQL.
- Rutas públicas compatibles para QR y printable: `/qrPA/[id]` y `/printable/[id]`.
- Rutas de compatibilidad necesarias para enlaces legacy de guardería: `/ver/[tipo]`, `/sala/[id]`, `/sala/[id]/[tipo]` y `/daycare-app`.

## Tablas legacy usadas sin cambios

El código consulta y escribe directamente en las tablas existentes: `users`, `rutas_rol`, `salas`, `recursos`, `valores_mensuales`, `personas_autorizadas`, `alumno_pa`, `matricula` y `credenciales`.

No se crean migraciones, no se cambian tipos y no se normaliza el esquema.

## Comportamiento legacy preservado

- Recursos familiares: lógica equivalente a `fetch-usuario-final.php`.
- Recursos admin por sala/tipo: lógica equivalente a `fetch-resource.php`.
- Cuentas familiares por sala: lógica equivalente a `fetch-usuarios.php`.
- Salas por unidad: lógica equivalente a `fetch-salas.php`.
- Personas Autorizadas: lógica equivalente a `fetch-padre-husky.php`.
- QR printable y scan: lógica equivalente a `fetch-pa-printable.php` y `fetch-pa-scan.php`.
- PDF viewer: conserva el patrón `/pdfjs/web/viewer.html?file=/virtual/<archivo.pdf>`.
- PDF Personas Autorizadas: conserva `https://bot.casitaapps.com/renderFromUrl`.
- QR público: conserva `https://admin.casitaiedis.edu.mx/qrPA/{id}`.
- Printable público: conserva `https://admin.casitaiedis.edu.mx/printable/{id}`.

## Configuración

Copia `.env.example` a `.env` y configura credenciales MySQL, `SESSION_SECRET` y `GOOGLE_CLIENT_ID`.

```bash
npm install
npm run dev
```

## Rutas principales

- `/login`: acceso familiar tradicional.
- `/daycare`: dashboard de familias con alcance de guardería.
- `/ver/tareas`, `/ver/circulares`, `/ver/calendario`: vistas familiares por tipo.
- `/personas_autorizadas`: Personas Autorizadas para cuentas con ese alcance.
- `/qrPA/[id]`: vista pública de escaneo.
- `/printable/[id]`: formato imprimible/compartible.
- `/admin/login`: acceso interno con Google.
- `/admin/daycare`: salas de guardería por unidad.
- `/admin/daycare/salas/[id]`: gestión de una sala.
- `/admin/daycare/salas/[id]/usuarios`: cuentas familiares de la sala y entrada de vista familiar controlada.
- `/admin/daycare/salas/[id]/tareas`, `/circulares`, `/calendario`: recursos por sala.
