# Spec frontend — Metas y progreso semanal

## Propósito y alcance

Define cómo la persona consulta y mantiene metas semanales y progreso en el detalle del videojuego. Se basa en el [PRD](../prd/PRD.md), el [backlog](../backlog/E2-metas-y-rachas.md), la [spec backend](./backend-meta-progreso.md) y el sistema visual de [`DESIGN.md`](../../DESIGN.md).

Incluye tipos de datos, servicios HTTP separados de la presentación, sección de progreso, formulario de Meta, edición de partidas y actualización de la vista. No implementa reglas de dominio en el cliente ni cambia el resumen existente del Proyecto 3.

## Comportamiento de la interfaz

### Progreso en el detalle

- El detalle solicita el progreso semanal al endpoint definido en la spec backend y muestra el intervalo lunes–domingo devuelto por el servidor sin recalcular la zona horaria en el navegador.
- Para editar la Meta activa, el detalle obtiene también las metas del videojuego y selecciona la que está activa; el endpoint de progreso no se usa como sustituto de la consulta de Meta.
- Con meta activa, muestra horas jugadas y objetivo, porcentaje real (también si supera 100 %), días jugados y objetivo, racha actual, mejor racha e hitos y su estado.
- La sección de hitos resume cuántos están alcanzados y cuántos quedan, explica que el estado depende del porcentaje de avance de la última partida guardada y presenta cada hito con su descripción, porcentaje objetivo y estado textual destacado. El estado no depende solo del color o de un icono.
- El texto presenta el porcentaje real sin límite. La longitud visual de la barra sí se limita al intervalo visual de 0 a 100 %; su etiqueta accesible explica el valor real.
- Sin meta activa, muestra las horas, días y rachas disponibles e invita a crear una meta cuando el estado del juego lo permite. Si el videojuego está completado o abandonado, explica que no se puede añadir una meta activa.
- Sin partidas, muestra ceros y los hitos pendientes que existan; sin meta, no presenta objetivos ni hitos históricos como si fueran actuales.
- Carga, error y vacío son estados distintos. Un error no se representa como cero ni como ausencia de Meta. La persona puede reintentar.

### Formulario y ciclo de vida de Meta

- La meta se consulta y se administra desde un cuadro modal en el detalle; crear y editar no expande un panel al final de la página y no requiere una ruta independiente.
- El cuadro modal tiene nombre accesible, cierre explícito, cierre con Escape, foco inicial y retención del foco mientras permanece abierto; al cerrarse devuelve el foco a su activador.
- Permite ingresar horas semanales, días por semana y hasta cinco hitos, cada uno con descripción y porcentaje objetivo.
- Los campos numéricos de horas, días y porcentaje de hito ofrecen controles visibles para incrementar y reducir, respetando sus límites y permitiendo también la entrada directa por teclado.
- Valida en cliente los mismos límites visibles del contrato backend; la respuesta de error del servidor se muestra de forma legible y no se descarta.
- Sin meta activa se crea una nueva Meta. Con meta activa se editan horas, días e hitos sin cambiar el videojuego ni el estado de la Meta.
- Desactivar una Meta solicita confirmación nativa del navegador. Si se cancela, no se envía la solicitud; si se confirma, se desactiva y se vuelve a consultar el detalle.
- Desactivar no elimina el historial; una nueva Meta activa se crea por separado.

### Edición de partidas y actualización

- `FormularioPartida` sirve para crear y editar. La edición obtiene la partida con `GET /api/partidas/:id`, permite corregir fecha, duración, avance y notas y guarda mediante `PUT /api/partidas/:id`.
- Las vistas con partidas ofrecen acceso claro a editar y eliminar. El borrado solicita confirmación antes de llamar a la API.
- Después de crear o editar una partida, la persona vuelve al detalle de su videojuego y este vuelve a consultar partidas, resumen del Proyecto 3, progreso semanal y metas necesarias. Después de eliminar desde el detalle, se vuelven a consultar esos mismos datos; después de eliminar desde el historial global, la interfaz vuelve al detalle de ese videojuego para mostrar el progreso actualizado. Mientras se actualiza, no presenta el progreso anterior como recién actualizado.
- Si falla la operación de escritura, informa el error y conserva la información necesaria para que la persona pueda corregir o reintentar. Si falla la recarga, presenta el estado de error y ofrece reintentar.

## Servicios y tipos

- `metasApi.ts` gestiona exclusivamente las operaciones HTTP de Meta: consultar por ID, listar por videojuego, crear, actualizar y desactivar.
- `videojuegosApi.ts` incorpora la consulta de progreso semanal y conserva intacta la operación existente de resumen.
- `partidasApi.ts` incorpora consulta por ID y actualización; sus operaciones existentes de listar, crear y eliminar continúan disponibles.
- Los componentes no ejecutan `fetch` directamente ni derivan horas, días, rachas o hitos.
- Los tipos compartidos describen la Meta, el hito con su estado derivado y la respuesta `IProgresoSemanal`; no duplican entidades con formas incompatibles.

## Requisitos

### DEBE

- Presentar el progreso semanal, metas y rachas en el detalle de cada videojuego.
- Usar el progreso y el intervalo calculados por el servidor, sin volver a calcular reglas temporales en el navegador.
- Mostrar el porcentaje de horas real, incluidos valores mayores que 100 %, aunque la barra visual se limite a 100 %.
- Mostrar horas y días frente a su meta, racha actual, mejor racha e hitos con texto y estado legibles.
- Hacer visibles el resumen de hitos alcanzados/pendientes, su porcentaje objetivo y la indicación de cómo se actualiza su estado.
- Invitar a crear una meta cuando no haya una activa y el videojuego no esté completado ni abandonado.
- Presentar explícitamente carga, error y vacío; permitir reintentar los datos que fallaron.
- Proveer un formulario accesible para crear/editar Meta y sus hitos, con validación y errores del servidor.
- Proveer controles visibles para aumentar/reducir horas, días y porcentajes de hitos sin exceder límites y admitir entrada por teclado.
- Pedir confirmación antes de desactivar una Meta y antes de eliminar una Partida.
- Permitir editar una Partida existente y refrescar los datos tras crear, editar o eliminar.
- Mantener `metasApi.ts` separado de los componentes y los tipos explícitos en `types/index.ts`.
- Respetar `DESIGN.md`, los tokens de color existentes, los breakpoints, el teclado y el foco visible.
- Añadir pruebas de componentes con Vitest, jsdom y React Testing Library. Las pruebas de interacción usan `@testing-library/user-event`; las verificaciones deben usar respuestas simuladas y no requerir MongoDB ni credenciales.

### NO DEBE

- Mostrar cero, éxito o estado vacío como respuesta alternativa cuando falla la carga.
- Limitar el porcentaje textual a 100 % ni mostrar la barra como única representación del progreso.
- Duplicar en componentes los cálculos de semana, racha o hitos del backend.
- Permitir crear una meta activa desde la interfaz para un videojuego completado o abandonado.
- Usar una librería visual no autorizada, colores arbitrarios ni interacción dependiente solo del color.
- Desactivar metas o borrar partidas sin confirmar la acción.
- Presentar datos anteriores como actualizados después de un cambio de Partida mientras se recarga el progreso.

## Criterio → verificación

| Criterio | Verificación |
|---|---|
| CA-05.1 | Prueba del detalle con respuesta simulada: aparecen semana, horas/objetivo, días/objetivo, rachas e hitos con su estado. |
| CA-05.4 | Prueba del progreso semanal: muestra el conteo de hitos alcanzados y pendientes, la explicación sobre el avance guardado y cada hito con su objetivo y estado textual. |
| CA-05.2 | Prueba sin Meta: aparecen horas, días y rachas, no aparece porcentaje como cero y se ofrece crear Meta; prueba separada confirma el mensaje de juego completado/abandonado sin CTA de creación. |
| CA-05.3 | Pruebas de carga, error y reintento; se comprueba que el error no representa valores faltantes como ceros o éxito. |
| CA-06.1 | Prueba del formulario: crear con datos válidos y editar la Meta activa llaman al método correcto de `metasApi` y refrescan el detalle. |
| CA-06.2 | Prueba que cancelar la confirmación no llama al servicio y confirmar desactiva la Meta, actualizando el estado del detalle. |
| CA-06.3 | Prueba de los controles numéricos visibles: incrementan y decrementan horas, días y porcentaje de hito sin exceder sus límites. |
| CA-06.4 | Prueba del detalle: crear/editar meta abre un diálogo modal, cerrar/Escape lo cierra y la meta no se despliega al final de la página. |
| CA-07.1 | Prueba del formulario de edición que carga `GET /api/partidas/:id`, envía `PUT` y actualiza la partida existente sin usar el método de creación. |
| CA-07.2 | Pruebas de validación de campos y presentación del error de servidor sin borrar los valores introducidos. |
| CA-07.3 | Prueba de partida inexistente: se muestra el error y no se presenta un formulario de edición vacío como una partida válida. |
| CA-07.4 | Pruebas de integración del detalle con servicio simulado: tras crear, editar o eliminar se vuelven a solicitar Partidas, resumen y progreso semanal; mientras las consultas están pendientes no se expone el valor previo como actualizado. Prueba del historial global confirma que al eliminar se abre el detalle del videojuego afectado. |
| Revisión visual E2 | Abrir el detalle en anchos de escritorio y móvil; comparar sección, formulario, estados y barra con `DESIGN.md`; comprobar teclado, foco, etiquetas y texto accesible del porcentaje. |
| Build y lint | `npm run build` y `npm run lint` dentro de `frontend`. |
| Pruebas automatizadas | `npm test` dentro de `frontend`; la suite corre sin servidor backend ni base de datos. |

## Ticket → archivos

| Ticket | Archivos previstos |
|---|---|
| T-08 | `frontend/package.json` (script `test` y dependencias Vitest, jsdom, `@testing-library/react`, `@testing-library/user-event` y `@testing-library/jest-dom`); `frontend/vitest.config.ts`; `frontend/src/types/index.ts`; `frontend/src/services/metasApi.ts`; `frontend/src/pages/DetalleVideojuego.tsx`; `frontend/src/pages/FormularioMeta.tsx`; `frontend/src/pages/FormularioMeta.test.tsx`; estilos del formulario en `frontend/src/styles.css` y `frontend/src/progreso.css`. |
| T-09 | `frontend/src/types/index.ts`; `frontend/src/services/videojuegosApi.ts`; `frontend/src/services/metasApi.ts`; `frontend/src/pages/DetalleVideojuego.tsx`; `frontend/src/pages/ProgresoSemanal.tsx`; `frontend/src/pages/ProgresoSemanal.test.tsx`; clases de progreso en `frontend/src/styles.css`; `frontend/vitest.config.ts`. |
| T-10 | `frontend/package.json`; `frontend/vitest.config.ts`; `frontend/src/App.tsx`; `frontend/src/pages/index.ts`; `frontend/src/types/index.ts`; `frontend/src/services/partidasApi.ts`; `frontend/src/pages/FormularioPartida.tsx`; `frontend/src/pages/DetalleVideojuego.tsx`; `frontend/src/pages/ListaPartidas.tsx`; `frontend/src/pages/FormularioPartida.test.tsx`; `frontend/src/pages/DetalleVideojuego.test.tsx`; `frontend/src/pages/ListaPartidas.test.tsx`; `frontend/src/styles.css`. |

## Dependencias

- T-08 depende de T-03 y de la spec backend aprobada.
- T-09 depende de T-04, T-08 y del contrato de respuesta backend.
- T-10 depende de T-07 y T-09; el formulario requiere el `GET /api/partidas/:id` especificado para precargar los datos.
- No se inicia ningún ticket frontend de código antes de que esta spec quede registrada en Git.

## Notas de accesibilidad y diseño

- Formularios usan etiquetas asociadas, límites e instrucciones visibles; se puede completar con teclado.
- Errores de campo y errores generales se anuncian con texto y se asocian al control correspondiente.
- Las barras incluyen nombre accesible y valores; la cifra real textual permanece visible si supera 100 %.
- Confirmar, cancelar y volver son acciones diferenciadas con nombres claros.
- Componentes nuevos reutilizan las variables y convenciones de `DESIGN.md`; las animaciones nuevas respetan movimiento reducido.
