Este archivo existe exclusivamente para ayudar a futuros agentes a desarrollar, probar, inspeccionar y autocorregir este proyecto con mayor rapidez. No es documentacion funcional, manual de usuario, historial de decisiones, reporte de auditoria ni bitacora de ejecuciones.

# Husky Pass Agent Operations

## Entorno

- Directorio del proyecto: `C:\Users\hp\husky-pass-crm`.
- Node requerido: `24.x`; usar `.nvmrc` o `.node-version`.
- npm requerido: `11.13.0`, definido en `packageManager`.
- Instalar dependencias: `npm install`.
- Instalacion limpia para verificacion: `npm ci`.
- No commitear secretos, `.env`, `.vercel`, `node_modules`, `.nuxt`, `.output`, reportes, capturas, videos, traces, HAR, logs ni evidencia temporal.

## Servidores Locales

- Desarrollo Nuxt: `npm run dev:husky-pass`.
- Produccion local:
  1. `npm run build`.
  2. PowerShell: `$env:HOST='127.0.0.1'; $env:NITRO_HOST='127.0.0.1'; $env:PORT='3100'; $env:NITRO_PORT='3100'; npm run start:output`.
- Si el puerto 3100 esta ocupado, usar otro puerto y pasar el mismo `--base-url` a los verificadores.
- Detener procesos del proyecto al terminar: inspeccionar `node.exe` cuyo `CommandLine` contenga la ruta del repo antes de cerrarlos.

## Comandos De Calidad

- Typecheck: `npm run typecheck`.
- Lint: `npm run lint`.
- Build: `npm run build`.
- Gate local de produccion: `npm run build:production`.
- Validar entorno local: `npm run validate:env -- .env local json`.
- Validar entorno Vercel descargado: `npm run validate:env -- .vercel/.env.production.local production allow-sensitive-placeholders json`.

## Verificacion Con Navegador

- Verificar arranque real: `npm run verify:launch -- --base-url http://localhost:3000`.
- Verificar recorridos visuales completos: `npm run verify:visual -- --base-url http://localhost:3000`.
- Verificar recorridos autenticados: `npm run verify:journeys -- --base-url http://localhost:3000`.
- Verificar rutas generadas: `npm run verify:routes -- --base-url http://localhost:3000`.
- Verificar salida de produccion local: `npm run verify:prod -- --base-url http://localhost:3100 --production`.
- Verificar identidad visual: `npm run verify:identity -- --base-url http://127.0.0.1:3000`.
- Verificar Husky Pass, PDFs y modales: `npm run verify:husky-pass -- --base-url http://127.0.0.1:3000`.
- Abrir e inspeccionar las capturas generadas antes de declarar que una verificacion visual paso.

## Evidencia Temporal

- Usar `.agent-artifacts/` para evidencia temporal de agente.
- Tambien pueden generarse `playwright-report/`, `test-results/`, `coverage/`, `*.trace.zip` y `*.har`.
- Al terminar, conservar solo scripts, fixtures y pruebas reutilizables; eliminar evidencia temporal.
- Limpieza segura en PowerShell:
  ```powershell
  $workspace = (Get-Location).Path
  $target = Resolve-Path .agent-artifacts -ErrorAction SilentlyContinue
  if ($target -and $target.Path.StartsWith($workspace)) {
    Remove-Item -LiteralPath $target.Path -Recurse -Force
  }
  ```

## Fixtures Y Rutas De Desarrollo

- Sembrar cuentas locales seguras: `npm run dev:account-security-fixtures -- up`.
- Retirar fixtures: `npm run dev:account-security-fixtures -- down`.
- Cuentas de prueba locales:
  - Escolar Personas Autorizadas: `codex.pa.parent@example.test`.
  - Guarderia: `codex.daycare.parent@example.test`.
  - Password por defecto: `CodexPass2026`.
- Rutas dev:
  - PDF lab: `/__dev/husky-pass`.
  - Identity matrix: `/__dev/identity-matrix`.
  - Modal lab: `/__dev/personas-modals`.
  - Password recovery lab: `/__dev/password-recovery`.
  - Sesion visual MKT: `/__dev/mkt`.
  - Super Admin fixture: `/admin/superadmin/personas-autorizadas?fixture=1`.
- APIs dev:
  - `/api/dev/husky-pass/pass?variant=<variant>&scenario=<scenario>&format=<pdf|svg-preview|readiness|diagnostics>`.
  - `/api/dev/husky-pass/photo?seed=<seed>&theme=<theme>&mode=<portrait|wide|tall|transparent|large|slow>`.
- Las rutas `/__dev/*` y fixtures deben estar cerradas o inactivas en produccion.

## Matriz Visual

- Identity matrix acepta:
  - `experience`: `escolar`, `guarderia`, `admin`.
  - `institution`: `iecs`, `iedis` o vacio.
  - `nivel`: `guarderia`, `preescolar`, `primaria`, `secundaria` o valor local.
  - `plantel`: `PM`, `PT`, `SM`, `ST`, `PREEM`, `GM`, `CT`.
  - `grupo`: etiqueta real usada por iconos de grupo.
  - `state`: `ready`, `loading`, `empty`, `error`.
  - `modal`: `1` para abrir modal compartido.
- Modal lab acepta:
  - `theme`: `escolar`, `daycare`, `iecs`, `preescolar`, `primaria`, `secundaria`, `iedis`, `admin`.
  - `mode`: `edit`, `delete`, `busy`.
- PDF lab acepta:
  - `variant`: `guarderia-cm`, `preescolar-preem`, `primaria-pt`, `primaria-pm`, `secundaria-st`, `secundaria-sm`.
  - `scenario`: `default`, `long-name`, `missing-optional`, `wide-photo`, `transparent-photo`, `large-photo`, `slow-photo`.
  - `panel`: `compare`, `svg`, `pdf`, `diagnostics`.

## Requests Y Logs

- Detectar solicitudes duplicadas: `npm run verify:requests -- --base-url http://localhost:3000`.
- Verificar politica de logs y warnings H3: `npm run verify:logs`.
- Los logs deben pasar por utilidades centralizadas y no exponer passwords, tokens, cookies, claves privadas, CURP, correos completos, nombres completos, payloads familiares ni SQL completo.
- Una falla de request debe registrarse una sola vez en el boundary responsable; capas internas agregan contexto y propagan.
- Resultados normales de negocio, como no encontrar hermanos adicionales, no deben producir `warn` ni `error`.

## MySQL Y Hermanos

- Revisar estado de indice/columna de firma: `npm run verify:mysql`.
- Ver plan de ejecucion para hermanos: `npm run mysql:siblings:explain -- --matricula <MATRICULA>`.
- No agregar comandos que creen, alteren o reviertan esquema MySQL automaticamente.
- Si se requiere cambio de esquema, entregar los comandos SQL en la conversacion para ejecucion manual por la persona responsable.
- La busqueda de hermanos no debe caer a scans amplios ni normalizar miles de alumnos en JavaScript.
- Si falta la columna persistida de firma, el flujo debe degradar de forma recuperable y registrar diagnostico util sin exponer datos sensibles.

## Password Recovery

- Usar modo local preview:
  1. `npm run dev:account-security-fixtures -- up`.
  2. Configurar `PASSWORD_RECOVERY_EMAIL_MODE=preview`.
  3. Configurar `PASSWORD_RECOVERY_BASE_URL=http://127.0.0.1:3000`.
  4. Abrir `/__dev/password-recovery`.
- CLI local:
  - `npm run dev:password-recovery -- request --email parent@example.com --base-url http://127.0.0.1:3000`.
  - `npm run dev:password-recovery -- latest --base-url http://127.0.0.1:3000`.
- No usar ni commitear `credentials.json`.
- Mantener claves de Google y variables de email solo del lado servidor.

## Vercel

- Build local Vercel: `npx vercel build --yes --prod --debug`.
- Verificar readiness: `npm run check:deploy-readiness -- artifacts/vercel-deployment-verification/readiness.json`.
- Smoke-test de deployment: `npm run smoke:deploy -- https://deployment-url artifacts/vercel-deployment-verification/manual-smoke`.
- Verificar rutas publicas de identidad en deployment: `npm run verify:identity -- --base-url https://deployment-url --public-only --out artifacts/identity-verification/deployed-public`.
- Si Vercel Authentication protege URLs `.vercel.app`, los smoke tests fallaran antes de que Nuxt ejecute.
- Confirmar que `/__dev/identity-matrix` y `/api/dev/husky-pass/options` devuelvan 404 en produccion.

## Antes De Entregar

1. Ejecutar las verificaciones necesarias para el cambio.
2. Abrir e inspeccionar capturas o evidencia relevante.
3. Corregir lo detectado y repetir la validacion.
4. Eliminar `.agent-artifacts/` y evidencia temporal.
5. Revisar `.gitignore`.
6. Revisar `git status --short`.
7. Asegurar que `commit.md` contenga un solo mensaje de commit en espanol.
