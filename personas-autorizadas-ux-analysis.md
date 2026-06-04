# Análisis UI/UX — Personas Autorizadas

Este pase se evaluó con un criterio simple: menos texto, más claridad de acción. Personas Autorizadas debe sentirse como un producto operativo, no como una explicación del sistema. La familia necesita saber qué falta, qué puede hacer y si quedó guardado. Nada más.

## Correcciones aplicadas en este pase

Marbetes volvió al lugar correcto: dentro de Personas Autorizadas. Se retiró como sección primaria de navegación para evitar fragmentar el recorrido. La descarga queda en la misma pantalla donde se capturan y revisan los registros.

La interfaz se redujo. Se quitó copy explicativo innecesario, lenguaje técnico, instrucciones largas y mensajes orientados a implementación. El flujo visible queda centrado en estado, acción y resultado.

Las acciones importantes se movieron a modales: captura/edición de personas, confirmación de eliminación, actualización de datos y cambio de foto del alumno. Esto separa lectura de edición y evita páginas largas con formularios abiertos permanentemente.

La carga de foto quedó como componente de upload. El usuario no pega enlaces ni ve detalles internos. Selecciona una imagen, revisa la vista previa y confirma. La preparación ocurre detrás de la interfaz.

FAQ y tutorial quedaron bajo Personas Autorizadas, con video a la izquierda y preguntas a la derecha. Funcionan como ayuda contextual, no como destino principal de producto.

Hermanos dejó de depender de un identificador interno de familia. La vinculación se calcula desde `matricula`, comparando nombre completo normalizado de padre y madre. Si falta cualquier parte requerida de los nombres parentales, no se vincula para evitar falsos positivos.

Actualizar datos y Credencialización ahora dependen de una lectura de matrícula compatible con el esquema real. El servidor inspecciona columnas disponibles antes de consultar o actualizar. Si falta una columna, no rompe por `Unknown column`; registra el diagnóstico y limita los campos visibles/guardables.

Se agregaron diagnósticos backend con prefijo `personas-autorizadas`. Los logs incluyen alcance, fecha, usuario, matrícula, columnas seleccionadas, columnas faltantes y resumen del error SQL cuando aplica. El usuario conserva un mensaje breve; soporte obtiene causa precisa.

## Hallazgos críticos aún relevantes

La mayor debilidad histórica no era visual: era que tres flujos centrales no cargaban. Un producto institucional no puede depender de que la UI oculte una falla genérica. Cualquier error de matrícula, sesión, permisos, columnas faltantes o cuenta sin alcance debe poder diagnosticarse en backend en el primer intento.

El producto debe evitar más secciones de las necesarias. Personas Autorizadas es la unidad principal: registros, marbetes, tutorial y FAQ pertenecen ahí. Sólo deben vivir aparte las tareas que realmente requieren pantalla propia: datos del alumno, foto del alumno, hermanos, encuestas y convenios.

La interfaz debe seguir reduciéndose. Cada frase visible debe justificar su presencia. Los textos aceptables son estado, acción, campo, error breve o confirmación. Todo lo demás pertenece a soporte, documentación interna o logs.

Los controles deshabilitados deben ser escasos y claros. Si algo no se puede hacer, debe verse como no disponible, no como error. Si sí se puede hacer, debe guardar, descargar, cambiar o navegar sin ambigüedad.

La vinculación de hermanos por nombres parentales es útil para este legado, pero exige disciplina de datos. No debe aceptar nombres parciales, nulos o vacíos. Tampoco debe permitir cambio rápido si el hermano no tiene cuenta familiar activa y autorizada.

El flujo de foto necesita pruebas reales con imágenes difíciles: rostro lejano, horizontal, baja luz, archivo pesado, formato no permitido y foto existente como URL absoluta. La experiencia debe degradar con un error breve y sin perder el contexto.

## Criterio de aceptación estricto

Actualizar datos carga con la matrícula autenticada, muestra sólo campos familiares permitidos y guarda sólo columnas existentes del whitelist.

Credencialización carga la foto actual del alumno, permite subir una nueva imagen y guarda únicamente el resultado confirmado.

Hermanos carga siempre al alumno actual. Sólo muestra hermanos cuando ambos padres tienen nombres completos normalizados coincidentes y cada alumno destino tiene cuenta válida para cambio rápido.

Personas Autorizadas contiene la descarga de marbetes en la misma pantalla de registros.

Los logs backend explican la causa real de cada falla: sesión, alcance, matrícula inexistente, columna faltante, consulta SQL, escritura rechazada o intento de campo no permitido.

La UI final permanece minimalista: sin lenguaje técnico, sin instrucciones extensas, sin enlaces manuales de recursos y sin controles decorativos.
