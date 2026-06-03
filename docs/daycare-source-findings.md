# Hallazgos legacy usados para Husky Pass CRM

Esta reconstrucción compara la entrega Nuxt contra los archivos AngularJS/PHP incluidos en el zip legacy y replica los flujos principales con componentes modernos, sin copiar archivos `.php`, `.html` o `.svg` legacy al proyecto nuevo.

## Administración daycare

El controlador legacy `husky-daycare` arma un mapa por ruta y sala:

- `usuarios` usa `fetch-usuarios.php`, tabla `users`, filtros `FIND_IN_SET(unidad, unidad)`, `role LIKE '%HUSKY%'` y `sala`.
- `tareas` usa `fetch-resource.php`, tabla `recursos`, `type = 'hw'`, `unidad`, `sala`, `hidden = 0`.
- `circulares` usa `fetch-resource.php`, tabla `recursos`, `type = 'news'`, `unidad`, `sala`, `hidden = 0`.
- `calendario` usa `fetch-resource.php`, tabla `recursos`, `type = 'cal'`, `unidad`, `sala`, `hidden = 0`.
- Las salas salen de `fetch-salas.php`, tabla `salas`, filtro `unidad`, orden `id ASC`.

La implementación Nuxt preserva esta segmentación en `server/data/mysqlDaycare.ts`, con rutas modernas bajo `/admin/daycare/salas/[id]` y alias de compatibilidad `/sala/[id]`.

## Familia daycare

El dashboard familiar legacy usa `fetch-usuario-final.php`:

- `tareas`: `recursos` por `type = 'hw'`, `sala`, `unidad`, `hidden = '0'`, orden `id DESC`.
- `circulares`: `recursos` por `type = 'news'`, `sala`, `unidad`, `hidden = '0'`, `GROUP BY timestamp`, orden `id DESC`.
- `calendario`: `recursos` por `type = 'cal'`, `unidad`, `DATE(date) >= CURDATE()`, `hidden = '0'`, agrupado por fecha/título/descripción/timestamp, orden `date`.
- `valor`: `valores_mensuales` por `MONTHNAME(CURDATE())`.

La implementación Nuxt replica esa forma en `/api/daycare/family/dashboard` y conserva el patrón de PDF viewer legacy `/pdfjs/web/viewer.html?file=/virtual/<archivo.pdf>`.

## Personas Autorizadas

El flujo legacy se detectó en `personas_autorizadas_nuevo_pa.html`, `saulController.js`, `fetch-padre-husky.php`, `fetch-pa-printable.php` y `fetch-pa-scan.php`.

La implementación Nuxt incluye:

- `/daycare/personas-autorizadas`: cuatro espacios legacy: Persona 1, Persona 2, Persona 3 y Pase Express.
- `/api/daycare/family/personas-autorizadas`: lectura y escritura sobre `personas_autorizadas` y `alumno_pa`.
- `/qrPA/[id]`: vista pública compatible con el QR legacy.
- `/printable/[id]`: vista imprimible/compartible compatible.
- Uso de `https://bot.casitaapps.com/renderFromUrl` para conservar la generación externa de PDF.
- Normalización visual de fotos guardadas bajo `https://casitaiedis.edu.mx/virtual/` hacia `https://admin.casitaiedis.edu.mx/virtual/`, como hacía el controlador legacy.

## Login y sesión

- Familias: `/login`, comportamiento tradicional contra `users`, con contraseña `plaintext`, contraseña directa o hash bcrypt cuando exista.
- Internos: `/admin/login`, Google Sign-In institucional, lookup en `users`, roles/rutas desde `rutas_rol`, cookies de segmentación internal/daycare conservadas.
- La sesión Nuxt normaliza el usuario para middleware, pero no mezcla experiencias de producto.

## Activos

Se usa el logo aportado por el usuario en `public/brand/husky-pass-logo.png`. No se incluyen archivos legacy originales.
