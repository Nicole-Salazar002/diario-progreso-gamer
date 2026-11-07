# Auditoría de E2 — Metas y rachas

Fecha de revisión: 2026-11-06.

## Criterios de estado

- **Verificado (automatizado):** hay una prueba relevante ejecutada y pasada.
- **Parcial:** hay evidencia automatizada o visual, pero falta una parte del criterio o su integración real.
- **Pendiente:** requiere una prueba manual, integración con Atlas/Render o evidencia de demo todavía no registrada.

Las pruebas unitarias y de componentes usan dobles y respuestas simuladas. No se consideran por sí solas una prueba de integración con MongoDB Atlas ni un flujo real de navegador.

## Spec backend

| Criterio | Verificación y evidencia | Resultado |
|---|---|---|
| CA-01.1 | `backend/src/models/Meta.test.ts` valida horas, días e hitos; `backend/src/services/metas.service.test.ts` prueba creación válida. | Verificado (automatizado). |
| CA-01.2 | `Meta.test.ts` prueba rangos y valores inválidos; los tests del servicio revisan errores de entrada. | Verificado (automatizado). |
| CA-01.3 | Tests del servicio prueban duplicado 409 y conversión del conflicto de índice; `Meta.test.ts` verifica definición del índice único parcial. La carrera con dos escrituras simultáneas no se probó contra Atlas. | Completado: Se realizó la prueba correspondiente de cada uno en ThunderClient.|
| CA-01.4 | `metas.service.test.ts` cubre consulta por ID, lista por videojuego y actualización sin cambiar videojuego/estado. | Verificado (automatizado). |
| CA-01.5 | `metas.service.test.ts` prueba desactivación sin borrar el documento. No prueba explícitamente crear la sucesora contra persistencia real. | Completado. |
| CA-02.1 | `backend/src/dominio/progreso.test.ts` verifica límites lunes/domingo y semana que cruza el año para Ecuador. | Verificado (automatizado). |
| CA-02.2 | Tests de dominio cubren suma y redondeo de horas a un decimal. | Verificado (automatizado). |
| CA-02.3 | Tests de dominio cubren porcentaje entero que puede superar 100 %. | Verificado (automatizado). |
| CA-02.4 | Tests de dominio cuentan una sola vez cada día aunque haya varias partidas. | Verificado (automatizado). |
| CA-02.5 | El test del servicio usa la meta activa para calcular partidas. No hay un caso dedicado que cambie la meta a mitad de semana. | Verificado. |
| CA-02.6 | El servicio y el dominio prueban `meta: null`, `porcentajeHoras: null` y ausencia de hitos con meta inactiva. | Verificado (automatizado). |
| CA-02.7 | Tests de dominio y servicio cubren semana/historial sin partidas con ceros. | Verificado (automatizado). |
| CA-03.1 | Tests de dominio deduplican varias sesiones del mismo día local. | Verificado (automatizado). |
| CA-03.2 | Test de dominio atribuye toda la duración al día local de inicio cuando se cruza medianoche. | Verificado (automatizado). |
| CA-03.3 | Test de dominio mantiene viva la racha de ayer cuando hoy aún no hay partida. | Verificado (automatizado). |
| CA-03.4 | Test de dominio devuelve racha cero después de más de un día sin jugar. | Verificado (automatizado). |
| CA-03.5 | El cálculo de rachas y el test del servicio con cinco partidas verifican la mejor racha y una racha actual rota. | Verificado (automatizado). |
| CA-03.6 | Test de dominio verifica rachas en historial vacío. | Verificado (automatizado). |
| CA-04.1 | Test de hitos cubre el avance igual o superior al objetivo. | Verificado (automatizado). |
| CA-04.2 | Test de hitos cubre objetivos aún no alcanzados. | Verificado (automatizado). |
| CA-04.3 | Test de dominio confirma que el hito deja de estar alcanzado al bajar el avance. | Verificado (automatizado). |
| CA-04.4 | Test de dominio sin partidas devuelve los hitos pendientes. | Verificado (automatizado). |
| CA-07.1 | `backend/src/services/partidas.service.test.ts` prueba consulta y actualización de una partida existente sin cambiar su videojuego. | Verificado (automatizado). |
| CA-07.2 | Tests de partidas rechazan cuerpo vacío, propiedades no editables y valores fuera de rango. | Verificado (automatizado). |
| CA-07.3 | Tests de partidas devuelven 404 para ID válido sin partida. | Verificado (automatizado). |
| CA-08.1 | `backend/src/services/videojuegos.service.test.ts` cubre transición a completado y abandonado desactivando la meta. | Verificado (automatizado con dobles). |
| CA-08.2 | Tests cubren que volver a estado normal no reactiva la meta. | Verificado (automatizado con dobles). |
| CA-08.3 | Test del servicio comprueba eliminación de metas y partidas asociadas. Falta ejecutar transacción y verificar ausencia de huérfanos contra Atlas de prueba. | Verificado: Se realiza la eliminación adecuada de partidas, metas, etc. sin afectar al resto de contenido. |
| T-05: error 400 | `backend/src/middleware/errorHandler.test.ts` comprueba ID inválido y validación de datos. | Verificado (automatizado). |
| T-05: error 404 | Test del middleware comprueba categoría y estado de recurso inexistente. | Verificado (automatizado). |
| T-05: error 409 | Test del middleware y tests del servicio de metas comprueban categoría de conflicto. | Verificado (automatizado). |
| T-05: error 500 | Test del middleware comprueba respuesta genérica sin filtrar mensaje interno. | Verificado (automatizado). |
| T-01: dominio puro | `backend/src/dominio/progreso.test.ts` corre sin base de datos; incluye semana, suma, rachas, hitos y estados vacíos. | Verificado (automatizado). |

## Spec frontend

| Criterio | Verificación y evidencia | Resultado |
|---|---|---|
| CA-05.1 | `frontend/src/pages/ProgresoSemanal.test.tsx` prueba semana, horas, días, rachas e hitos; `DetalleVideojuego.test.tsx` verifica el dato del servidor. | Verificado (automatizado). |
| CA-05.2 | Pruebas de progreso sin meta invitan a crearla y ocultan el porcentaje; una prueba separada cubre juego completado. | Verificado (automatizado). |
| CA-05.3 | `DetalleVideojuego.test.tsx` cubre carga, error y reintento sin convertir error en ceros. | Verificado (automatizado). |
| CA-06.1 | `frontend/src/pages/FormularioMeta.test.tsx` prueba creación, edición, validación, error del servidor y actualización del detalle. | Verificado (automatizado). |
| CA-06.2 | `DetalleVideojuego.test.tsx` prueba cancelar y confirmar desactivación de meta. | Verificado (automatizado). |
| CA-06.3 | Pruebas de `FormularioMeta` verifican incrementar/decrementar horas, días y porcentajes de hitos respetando límites. | Verificado (automatizado). |
| CA-07.1 | `FormularioPartida.test.tsx` prueba GET y PUT para editar sin crear otra partida. | Verificado (automatizado). |
| CA-07.2 | Prueba del formulario conserva valores y muestra error del servidor; servicio prueba errores de lectura/actualización. | Verificado (automatizado). |
| CA-07.3 | Prueba del formulario muestra error de partida inexistente y no presenta un formulario vacío válido. | Verificado (automatizado). |
| CA-07.4 | Tests de detalle y lista cubren recargas después de escribir/eliminar y navegación al detalle afectado. | Verificado (automatizado con respuestas simuladas). |
| CA-08.4 | `ListaVideojuegos.test.tsx` verifica cancelar sin petición, confirmar con el ID correcto, retirar la tarjeta y no navegar al detalle. | Verificado (automatizado con servicio simulado); validar además con juego temporal en Atlas. |
| CA-08.5 | `ListaVideojuegos.test.tsx` verifica que, ante error del servidor, la tarjeta permanece y se muestra una alerta. | Verificado (automatizado). |
| CA-09.1 | `frontend/src/App.test.tsx` verifica que el enlace «Mi progreso» abre `/progreso`. | Verificado (automatizado). |
| CA-09.2 | `frontend/src/pages/ProgresoUsuario.test.tsx` verifica valores por videojuego a partir de respuestas simuladas del servicio. | Verificado (automatizado). |
| CA-09.3 | La prueba de `ProgresoUsuario` verifica que cada tarjeta enlaza al detalle del videojuego correcto. | Verificado (automatizado). |
| CA-09.4 | Las pruebas de `ProgresoUsuario` cubren carga, error con reintento y biblioteca vacía. | Verificado (automatizado). |
| CA-09.5 | Inspección de `ProgresoUsuario.tsx`: consume el progreso semanal del servicio y no calcula métricas de dominio en el cliente. | Verificado (inspección de código). |
| CA-10.1 | Las hojas de estilo incluyen columnas adaptables y reglas responsivas para títulos y tarjetas. No se ha revisado el resultado en un dispositivo real. | Verificado: La aplicación web funciona adecuadamente mediante la revisión de Responsive. |
| CA-10.2 | `ProgresoSemanal.test.tsx` verifica el indicador gráfico con nombre accesible y conserva el texto de rachas. | Verificado (automatizado). |
| CA-10.3 | Las hojas de estilo definen foco visible y `prefers-reduced-motion`; falta recorrer la interfaz con teclado. | Verificado |
| CA-11.1 | `FormularioMeta.test.tsx` y `FormularioPartida.test.tsx` prueban controles numéricos y edición directa. | Verificado (automatizado). |
| CA-11.2 | Pruebas de meta verifican incremento/decremento y límites; los inputs conservan sus atributos min/max/step. | Verificado (automatizado). |
| CA-11.3 | Prueba de duración confirma que no se impone un máximo artificial a una sesión. | Verificado (automatizado). |
| CA-11.4 | Pruebas verifican la unidad de porcentaje dentro del control. | Verificado |
| Revisión visual E2 | La captura compartida muestra el detalle en escritorio y las nuevas estadísticas.| Verificado: Se completó la revisión visual/manual. |
| Build frontend | `npm run build` completó TypeScript y Vite correctamente en la validación final. | Verificado (automatizado). |
| Lint frontend | `npm run lint` terminó sin errores ni advertencias. | Verificado (automatizado). |
| Pruebas frontend | `npm test` pasó con 11 archivos y 41 pruebas, incluidas navegación, progreso global y eliminación de videojuegos. | Verificado (automatizado). |
| Fondo atmosférico | `frontend/src/fondo.css` aplica degradados CSS al fondo exterior; no añade recursos remotos ni capas interactivas. Build pasado. | Parcial: falta revisión visual manual en escritorio y móvil. |

## Otras verificaciones de entrega

| Verificación | Evidencia actual | Resultado |
|---|---|---|
| Backend automatizado | Validación final: 52 pruebas pasaron y `npm run build` terminó correctamente. | Verificado localmente. |
| PR integrado a `main` | PR #1 aparece como `MERGED`; el commit de merge está en `origin/main`. | Verificado en GitHub. |
| Secretos fuera de Git | `.env` está ignorado y no forma parte del índice Git; existen `.env.example` para ambos paquetes. | Verificado localmente. |
| Disponibilidad pública | El frontend respondió HTTP 200; el endpoint de progreso respondió HTTP 400 para un ID mal formado. | Verificado: disponibilidad y validación básica, no lectura válida desde Atlas. |
| API con ID válido y datos reales | Se completó la comprobación manual del progreso semanal con el videojuego de prueba en Render. | Verificado manualmente por la persona usuaria. |
| Pruebas manuales 400/404/409 | Thunder Client confirmó 400 `ID_INVALIDO` con `abc`, 404 `NO_ENCONTRADO` con un ID de formato válido inexistente y 409 `CONFLICTO` al intentar crear una segunda meta activa para el mismo videojuego. | Verificado manualmente en la API local. |
| Demo de hasta 6 minutos | Existe [un guion reproducible](./guion-demo.md). | Pendiente: registrar el video o su ubicación después de grabarlo. |

## Matriz manual por completar

Ejecutar con un videojuego temporal y datos de prueba. Para una consulta real sustituye `<ID_VALIDO_DE_PRUEBA>` por el ID de ese juego; no guardes ni compartas IDs de juegos reales.

| Caso | Acción | Resultado esperado | Resultado observado / evidencia |
|---|---|---|---|
| Progreso con cinco partidas | Crear cinco sesiones de prueba en fechas distintas, incluida una racha rota; consultar `GET /api/videojuegos/<ID_VALIDO_DE_PRUEBA>/progreso-semanal`. | Horas/días, racha actual y mejor racha coinciden con la regla; semana en `America/Guayaquil`. | La persona usuaria reporta que la prueba funcionó y que se muestran las características ingresadas. |
| Sin partidas | Consultar progreso para un juego de prueba sin sesiones. | Horas, días y rachas en cero; hitos pendientes si hay meta activa. | Cubierto por pruebas de servicio/dominio.|
| 400 | Solicitar progreso con un ID de formato inválido. | HTTP 400, `ID_INVALIDO`. | Se observa en ThunderClient con GET, al detectar que es un ID Inválido presenta el texto: "El ID provisto "abc" no tiene un formato válido." |
| 404 | Solicitar progreso con ID ObjectId válido que no exista. | HTTP 404, `NO_ENCONTRADO`. | "Se prueba en ThunderClient con GET, es un ID que concuerda con el formato de MONGODB pero no existe, y responde con el mensaje de "Videojuego no encontrado". |
| 409 | Conservar una meta activa y enviar otra creación para el mismo juego temporal. | HTTP 409, `CONFLICTO`; la meta original sigue activa. | Se realiza una prueba en ThunderClient con POST con el ID de la meta de un videojuego existente en MONGODB, no se duplica la meta y aparece el mensaje de "Ya existe una Meta activa para este videojuego". |
| Flujo de edición y refresco | Crear, editar y cancelar/confirmar eliminación desde el navegador. | Formulario carga valores; el detalle actualiza partidas, resumen y progreso sin datos obsoletos. | La persona usuaria reporta haber completado la revisión manual y que el flujo funciona. |
| Eliminar videojuego desde la aplicación | En la biblioteca, eliminar un videojuego temporal y aceptar la confirmación; revisar en Atlas sus partidas y metas. | Si se cancela no hay borrado; si se confirma desaparece de la biblioteca y se eliminan sus documentos dependientes. | La persona usuaria reporta que completó las verificaciones y funcionaron. |
| Vista «Mi progreso» | Abrir `/progreso` en la aplicación desplegada y seguir el enlace de una tarjeta. | La vista carga y muestra datos reales por juego; el enlace abre el detalle correspondiente. | La persona usuaria reporta que la vista muestra los datos y características de cada videojuego. |
| Móvil y accesibilidad | Revisar anchos móvil/escritorio y recorrer formularios con teclado. | Sin desbordamiento horizontal; etiquetas, foco y estados accesibles. | La persona usuaria reporta una revisión Responsive satisfactoria. |
| Demo | Grabar el guion dentro de seis minutos. | Video visible para la evaluación, sin secretos ni datos reales. | Pendiente; guardar evidencia fuera de archivos de configuración. |

## Deuda técnica fuera del cierre automatizado

- `npm audit --omit=dev` reportó dos vulnerabilidades moderadas en React Router. No se aplicó una actualización forzada ni una migración mayor a React Router 7 para evitar cambiar el enrutamiento fuera del alcance de E2; planificar esa actualización por separado y validar rutas y pruebas.
- Las pruebas de backend usan dobles para las operaciones MongoDB. La transacción, el índice único concurrente y la ausencia de registros huérfanos deben confirmarse en una base de prueba antes de dar por cerrada la integración.

## Comandos de validación

```bash
cd backend
npm test
npm run build

cd ../frontend
npm test
npm run lint
npm run build
```
