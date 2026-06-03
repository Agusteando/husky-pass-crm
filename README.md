# husky-pass-crm

Nueva implementación Nuxt de Husky Pass CRM sobre la base MySQL legacy existente.

El proyecto no copia archivos legacy. Reimplementa los flujos operativos detectados en AngularJS/PHP con una capa MySQL explícita, sin migraciones y sin cambios de esquema.

## Alcance de esta entrega

- Familias de guardería con login tradicional en `/login`.
- Administradores internos con Google Login en `/admin/login`.
- Panel familiar con tareas, avisos/comunicados, calendario mensual, valor del mes, Richmond, PASE y Personas Autorizadas.
- Panel administrativo de guardería para salas, cuentas familiares, tareas, circulares y calendario.
- Bitácora diaria para usuarios internos autorizados.
- Personas Autorizadas con cuatro espacios legacy: Persona 1, Persona 2, Persona 3 y Pase Express.
- Rutas públicas compatibles para QR y printable: `/qrPA/[id]` y `/printable/[id]`.
- Rutas de compatibilidad para enlaces legacy principales: `/ver/[tipo]`, `/personas_autorizadas`, `/sala/[id]`, `/sala/[id]/[tipo]`, `/dashboard` y `/daycare-app`.

## Tablas legacy usadas sin cambios

El código consulta y escribe directamente en las tablas existentes: `users`, `rutas_rol`, `salas`, `recursos`, `valores_mensuales`, `personas_autorizadas`, `alumno_pa`, `matricula`, `credenciales` y `bitácoras`.

No se crean migraciones, no se cambian tipos y no se normaliza el esquema.

## Endpoints y comportamiento legacy preservados

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
- `/daycare`: dashboard de familias.
- `/daycare/recursos/tareas`, `/daycare/recursos/circulares`, `/daycare/recursos/calendario`: vista familiar por tipo.
- `/daycare/personas-autorizadas`: Personas Autorizadas.
- `/qrPA/[id]`: vista pública de escaneo.
- `/printable/[id]`: formato imprimible/compartible.
- `/admin/login`: acceso interno con Google.
- `/admin/daycare`: dashboard administrativo.
- `/admin/daycare/salas/[id]`: gestión de una sala.
- `/admin/daycare/salas/[id]/usuarios`: cuentas familiares de la sala.
- `/admin/daycare/salas/[id]/tareas`, `/circulares`, `/calendario`: recursos por sala.
- `/admin/daycare/bitacora`: bitácora interna.
