# Spec backend — Meta y progreso semanal

## Propósito y alcance

Define el contrato backend para las metas y el progreso semanal de la épica E2. Se basa en las reglas aprobadas en el [PRD](../prd/PRD.md), el [backlog](../backlog/E2-metas-y-rachas.md) y la arquitectura existente del Proyecto 3.

Incluye el ciclo de vida de Meta, la consulta del progreso semanal, los cálculos de dominio, los errores centralizados y la coherencia de los registros asociados al videojuego. No cambia el propósito ni la respuesta del resumen existente `GET /api/videojuegos/:id/resumen`.

## Contrato de dominio: Meta

Una Meta pertenece a un videojuego existente y contiene:

- Referencia obligatoria al videojuego.
- `horasSemanales`: número mayor que 0 y máximo 100.
- `diasPorSemana`: entero de 1 a 7.
- `activa`: booleano, `true` por defecto.
- `hitos`: máximo cinco elementos; cada uno tiene descripción y `porcentajeObjetivo` entre 1 y 100.
- Timestamps de creación y actualización.

Se referencia Meta desde una colección propia porque tiene un ciclo de vida independiente y las metas desactivadas conservan historial. Los hitos se embeben porque son una lista corta y solo tienen sentido dentro de su meta. El estado alcanzado no se almacena: se deriva del avance actual existente.

Debe existir como máximo una meta activa por videojuego, incluso ante solicitudes concurrentes. La comprobación de aplicación debe acompañarse de una restricción de persistencia que impida duplicados activos; el conflicto se traduce a HTTP 409. Las metas inactivas se conservan. Un videojuego completado o abandonado no puede recibir una Meta activa; la creación se rechaza con HTTP 409.

Crear una nueva meta activa es la forma de reemplazar una meta desactivada. No se ofrece reactivación de una meta histórica en esta spec. Actualizar una meta modifica sus horas, días e hitos, pero no permite cambiar su videojuego ni cambiar su estado; desactivar es una acción explícita.

## Contrato HTTP

Todas las rutas usan el prefijo existente `/api`.

| Método y ruta | Resultado |
|---|---|
| `POST /api/metas` | Crea una meta activa. Recibe `videojuego`, `horasSemanales`, `diasPorSemana` y `hitos`. Responde 201 y la meta creada. |
| `GET /api/metas/:id` | Devuelve la meta, activa o histórica. |
| `GET /api/metas/videojuego/:videojuegoId` | Devuelve la lista de metas del videojuego, incluidas las inactivas, ordenadas de más reciente a más antigua. Si el videojuego existe y no tiene metas, devuelve `[]`. |
| `PUT /api/metas/:id` | Actualiza horas, días e hitos de la meta existente. No cambia su videojuego ni su estado. |
| `PATCH /api/metas/:id/desactivar` | Desactiva una meta activa y conserva el registro. |
| `GET /api/partidas/:id` | Devuelve una partida existente para precargar el formulario de edición. |
| `PUT /api/partidas/:id` | Actualiza los campos editables de una partida existente; no crea una nueva. |
| `GET /api/videojuegos/:id/progreso-semanal` | Devuelve las métricas de la semana actual, rachas y estado actual de los hitos. |

Las rutas de consulta por videojuego deben registrarse antes de `/:id` en el router de metas para evitar que la ruta general capture ese segmento.

### Errores HTTP

Se conserva el formato JSON existente con `error` y `message`; los errores de validación pueden incluir `detalles`.

| Estado | Uso |
|---|---|
| 400 | ID mal formado (`ID_INVALIDO`) o datos de entrada inválidos (`ERROR_VALIDACION`). |
| 404 | Videojuego, meta o partida válidos por formato pero inexistentes (`NO_ENCONTRADO`). |
| 409 | Ya existe una meta activa para el videojuego, o el estado del videojuego impide crearla (`CONFLICTO`). |
| 500 | Error inesperado (`ERROR_INTERNO`); mensaje genérico, sin stack ni detalles internos. |

Un `AppError` debe conservar tanto el estado HTTP como la categoría correcta; el manejo de errores no debe presentar un 409 como `NO_ENCONTRADO`.

## Contrato de progreso semanal

`GET /api/videojuegos/:id/progreso-semanal` devuelve:

```json
{
  "semana": { "inicio": "2026-11-02", "fin": "2026-11-08" },
  "meta": { "horasSemanales": 5, "diasPorSemana": 4 },
  "horasSemana": 3.5,
  "porcentajeHoras": 70,
  "diasJugadosSemana": 3,
  "rachaActual": 4,
  "mejorRacha": 9,
  "hitos": [
    { "descripcion": "Llegar al 25 %", "porcentajeObjetivo": 25, "alcanzado": true }
  ]
}
```

- `semana.inicio` y `semana.fin` son fechas ISO `YYYY-MM-DD` inclusivas en `America/Guayaquil`; la semana empieza lunes y termina domingo.
- Se incluyen para horas y días únicamente partidas cuyo instante de inicio cae dentro de los límites locales de la semana actual.
- Una partida pertenece al día local de Ecuador en que empezó. Su duración completa se atribuye a ese día, incluso si termina después de medianoche.
- `horasSemana` es la suma de `duracionMinutos` dividida entre 60, redondeada a un decimal.
- Con meta activa, `porcentajeHoras` es `horasSemana / horasSemanales * 100`, redondeado al entero más cercano y sin límite superior.
- `diasJugadosSemana` cuenta fechas locales distintas con al menos una partida.
- Las funciones de cálculo son puras y reciben los datos y la fecha/hora de referencia como entradas; no consultan base de datos ni leen el reloj global por su cuenta.
- La racha actual es la longitud de los días consecutivos efectivamente jugados que terminan hoy si se jugó hoy, o ayer si todavía no se ha jugado hoy. Si la última partida fue anterior a ayer, vale cero. Un día sin partida hoy mantiene viva la racha de ayer, pero no se cuenta como día efectivamente jugado.
- La mejor racha es la secuencia más larga de fechas locales consecutivas con partidas en todo el historial.
- Cada fecha con una o varias partidas cuenta como un solo día.
- Un hito está alcanzado si el avance actual devuelto por el resumen del Proyecto 3 es mayor o igual que su objetivo. Si el avance baja, el estado cambia; no se persiste.
- Sin meta activa, `meta` y `porcentajeHoras` son `null`, `horasSemana`, `diasJugadosSemana` y rachas se calculan normalmente, y `hitos` es `[]`.
- Sin partidas, horas, días y rachas son cero; si hay meta, todos sus hitos están pendientes.
- Un ID de videojuego mal formado responde 400; un videojuego válido pero inexistente responde 404.

El servicio consulta videojuego, partidas y meta activa y delega todos los cálculos temporales y de hitos a funciones puras de dominio.

## Ciclo de vida y compatibilidad

- Cambiar un videojuego a `completado` o `abandonado` desactiva su meta activa. Cambiarlo luego a otro estado no reactiva la meta.
- Eliminar un videojuego elimina sus partidas y todas sus metas embebidas con sus hitos; no pueden quedar registros relacionados huérfanos.
- El contrato de `GET /api/videojuegos/:id/resumen` y la funcionalidad existente de videojuegos y partidas se mantienen, salvo los ajustes de ciclo de vida expresamente descritos aquí.
- Editar una partida actualiza el registro existente. Las entradas inválidas responden 400 y un ID válido sin partida responde 404.

## Requisitos

### DEBE

- Validar las reglas de Meta en el modelo y al procesar las entradas.
- Verificar que el videojuego exista al crear una Meta.
- Impedir dos metas activas, incluida la carrera entre solicitudes simultáneas.
- Conservar metas desactivadas y listar tanto activas como históricas.
- Calcular semana, días, horas, rachas e hitos en funciones puras probadas sin base de datos.
- Usar explícitamente `America/Guayaquil`, límites semanales inclusivos/exclusivos correctos y fechas locales para rachas.
- Devolver los valores `null`, cero y arreglos vacíos del contrato cuando no hay meta o partidas.
- Aplicar las respuestas 400, 404, 409 y 500 definidas arriba.
- Desactivar la meta al completar o abandonar y eliminar Meta y Partida al eliminar el videojuego.
- Preservar el endpoint de resumen existente.

### NO DEBE

- Guardar el estado `alcanzado` en cada hito.
- Limitar `porcentajeHoras` a 100.
- Contar más de un día por fecha local, ni dividir una partida que cruza medianoche.
- Calcular el progreso semanal en el frontend ni acceder a la base de datos desde funciones de dominio.
- Exponer errores internos o convertir conflictos 409 en 404.
- Dejar Meta o Partida huérfanas al eliminar un videojuego.
- Introducir notificaciones, recordatorios, metas compartidas, rankings o historial gráfico.

## Criterio → verificación

| Criterio | Verificación |
|---|---|
| CA-01.1, CA-01.2 | Pruebas de validación para límites de horas, días, cantidad de hitos y porcentaje del hito; pruebas de servicio para creación válida. |
| CA-01.3 | Prueba del servicio y prueba de persistencia para meta activa duplicada (409), incluida la protección del índice ante dos altas concurrentes en la base de datos de prueba. |
| CA-01.4 | Pruebas de rutas/servicio para consultar por ID y actualizar una Meta existente, manteniendo videojuego y estado. |
| CA-01.5 | Prueba de desactivación que conserva la Meta y permite crear después otra meta activa. |
| CA-02.1 | Pruebas puras de límites de semana, lunes/domingo y cambio de año en `America/Guayaquil`. |
| CA-02.2, CA-02.3 | Pruebas puras de suma, redondeo a un decimal, porcentaje entero y resultado superior a 100 %. |
| CA-02.4 | Pruebas puras con varias partidas en la misma fecha y partidas en fechas distintas. |
| CA-02.5 | Prueba de servicio/progreso que usa la meta activa actual para las partidas de toda la semana. |
| CA-02.6, CA-02.7 | Pruebas de contrato de respuesta sin meta y sin partidas: null, ceros y colecciones vacías según corresponda. |
| CA-03.1, CA-03.2 | Pruebas puras de duplicados por fecha local y asignación completa al día local de inicio. |
| CA-03.3, CA-03.4 | Pruebas puras con fecha de referencia fija: hoy sin partida y ayer con partida; ausencia tanto hoy como ayer. |
| CA-03.5, CA-03.6 | Pruebas puras de racha histórica más larga, huecos entre fechas e historial vacío. |
| CA-04.1–CA-04.4 | Pruebas puras para avance menor, igual y mayor que el objetivo, avance que disminuye e historial sin partidas. |
| CA-07.1–CA-07.3 | Pruebas de servicio/ruta para consultar una Partida por ID, actualizarla sin duplicar, rechazar datos inválidos con 400 e informar partida inexistente con 404. |
| CA-08.1, CA-08.2 | Pruebas de servicio para transición a completado/abandonado y regreso a otro estado sin reactivación. |
| CA-08.3 | Prueba de integración de eliminación que comprueba ausencia del Videojuego, sus Partidas y todas sus Metas después de la operación. |
| T-05: errores 400/404/409/500 | Pruebas unitarias del `errorHandler` por categoría; comprobar código, forma del JSON y que el 500 no revela detalles internos. |
| T-01: tests del dominio | Ejecutar todas las pruebas de dominio sin conexión a MongoDB y confirmar que las funciones reciben el reloj como dato de entrada. |

## Ticket → archivos

| Ticket | Archivos previstos |
|---|---|
| T-01 | `backend/package.json` (script `test` y dependencia de desarrollo `tsx` para `node:test`); `backend/src/dominio/progreso.test.ts` (pruebas puras). |
| T-02 | `backend/src/dominio/progreso.ts`; `backend/src/dominio/progreso.test.ts`. |
| T-03 | `backend/src/models/Meta.ts`; `backend/src/services/metas.service.ts`; `backend/src/controllers/metas.controller.ts`; `backend/src/routes/metas.routes.ts`; `backend/src/app.ts`; `backend/src/middleware/errorHandler.ts`; pruebas de modelo/servicio/ruta en `backend/src/**/*.test.ts`. |
| T-04 | `backend/src/services/progreso.service.ts`; `backend/src/controllers/videojuegos.controller.ts`; `backend/src/routes/videojuegos.routes.ts`; `backend/src/services/progreso.service.test.ts` y pruebas de ruta en `backend/src/**/*.test.ts`. |
| T-05 | `backend/src/middleware/errorHandler.ts`; pruebas de error en `backend/src/middleware/errorHandler.test.ts`. |
| T-06 | `backend/src/services/videojuegos.service.ts`; pruebas de integración/servicio de ciclo de vida en `backend/src/services/videojuegos.service.test.ts`. |
| T-07 | `backend/src/services/partidas.service.ts`; `backend/src/controllers/partidas.controller.ts`; `backend/src/routes/partidas.routes.ts`; pruebas de servicio/ruta en `backend/src/**/*.test.ts`. |

## Dependencias

- T-01 precede a T-02: las pruebas puras definen el comportamiento antes de implementar los cálculos.
- T-05 precede a T-03, T-04 y T-07: el CRUD, el progreso y la edición de partidas dependen de respuestas de error correctas.
- T-03 precede a T-04 y T-06: el cálculo necesita la Meta y el ciclo de vida debe poder desactivarla/eliminarla.
- Los tickets frontend consumen el contrato del progreso y de metas definido aquí; no duplican reglas de dominio.

## Riesgos y puntos abiertos

- La creación de un índice único parcial puede depender de los índices ya creados en MongoDB. La implementación debe comprobar que el índice se puede crear sin alterar ni borrar datos existentes y reportar conflictos de datos históricos.
- La estrategia de atomicidad de la eliminación del videojuego y sus registros debe verificarse en MongoDB Atlas/Render. Si transacciones no están disponibles en el entorno, no se puede afirmar atomicidad; sí debe demostrarse que la política acordada no deja huérfanos al terminar con éxito.
