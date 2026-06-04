# Análisis UI/UX de Personas Autorizadas

La corrección principal fue separar lo que pertenece al producto visible de lo que pertenece a la implementación interna. Textos como “Vision API”, “máscara”, “geometría” o “procesamiento” no deben aparecer frente a familias: el usuario sólo debe seleccionar una foto, ver un estado claro y recibir un resultado listo. Exponer detalles técnicos aumenta incertidumbre, suena experimental y desplaza la responsabilidad al usuario.

La captura de imágenes y recursos no debe depender de pegar ligas. Para una experiencia institucional, el flujo correcto es carga directa, validación inmediata, vista previa, preparación automática, estados de error entendibles y persistencia controlada por el sistema. Las ligas manuales generan recursos rotos, inconsistencias visuales, problemas de privacidad, soporte innecesario y riesgo de guardar destinos no autorizados.

Los formularios largos inline no funcionaban bien en móvil ni como flujo de producto. En Personas Autorizadas y Actualizar datos, el patrón más útil es una vista compacta de estado, tarjetas por sección y edición en modal. Esto reduce carga cognitiva, conserva contexto, evita scroll excesivo y hace que guardar/cancelar tenga un alcance claro.

Credencialización estaba planteada como si fuera una credencial del padre o una explicación técnica. El comportamiento esperado es una actualización de foto del alumno: imagen actual, acción única, modal de carga, preparación automática y guardado. El usuario no necesita elegir endpoints, pegar URLs ni entender el pipeline.

FAQ y tutorial no debían competir como secciones primarias de navegación. Funcionan mejor como ayuda contextual debajo de Personas Autorizadas: video a la izquierda, FAQ a la derecha. Esto mantiene el foco en la tarea principal y conserva soporte inmediato sin fragmentar la navegación.

La vinculación de hermanos por identificadores internos de familia era frágil para este legado. Si la fuente confiable es `matricula`, el producto debe vincular por nombre completo normalizado de ambos padres y bloquear la vinculación cuando falte cualquier parte necesaria. Aceptar datos incompletos o nulos produciría falsos positivos y accesos ambiguos.

Faltaban estados no disponibles consistentes. Un producto completo no debe mostrar controles que no hacen nada, campos que no deberían editarse o flujos que fallan sin explicación. Cada control visible debe tener resultado observable o indicar por qué no está disponible.

También faltaba una separación fuerte entre datos familiares y datos escolares. Grado, grupo, nivel, ciclo, plantel, matrícula, baja, servicio y estado interno deben permanecer como lectura o no aparecer en edición familiar. La defensa real debe estar en servidor con whitelist estricta, no sólo en la UI.

Para cerrar esta área como producto completo, todavía conviene agregar pruebas Playwright con fixtures reales de sesión familiar, niveles IECS/IEDIS, fotos absolutas existentes, cuentas con y sin datos parentales completos, hermanos con cuenta activa y hermanos sin cuenta activa. Sin esos fixtures, la validación automatizada sólo cubre compilación y análisis estático, no el flujo real autenticado.
