# Backlog — E2 · Metas y rachas

Este backlog descompone [el PRD aprobado](../prd/PRD.md) en historias, criterios de aceptación y tickets. Los criterios describen resultados observables; las decisiones técnicas se reservan para las specs.

## Historias y criterios de aceptación

### HU-01 · Definir y administrar la meta de un videojuego

**Como** persona que registra sus videojuegos, **quiero** definir y administrar una meta semanal por juego, **para** saber qué objetivo me propuse y conservar las metas anteriores.

- **CA-01.1 — Crear una meta válida.** DADO un videojuego existente sin meta activa, CUANDO la persona define horas mayores que 0 y hasta 100, entre 1 y 7 días enteros y hasta cinco hitos con descripción y objetivo entre 1 % y 100 %, ENTONCES la meta queda creada y activa con los datos ingresados.
- **CA-01.2 — Rechazar datos fuera de regla.** DADO un videojuego, CUANDO se intenta crear o actualizar una meta con horas, días o hitos fuera de los límites acordados, ENTONCES la operación se rechaza y se informa qué dato debe corregirse.
- **CA-01.3 — Evitar dos metas activas.** DADO un videojuego que ya tiene una meta activa, CUANDO se intenta crear o activar otra para ese juego, ENTONCES la operación se rechaza claramente y la meta existente permanece activa.
- **CA-01.4 — Consultar y actualizar.** DADA una meta existente, CUANDO la persona consulta o modifica sus datos, ENTONCES ve o conserva los valores actualizados de esa meta.
- **CA-01.5 — Desactivar sin borrar el historial.** DADA una meta activa, CUANDO la persona confirma su desactivación, ENTONCES deja de estar activa y se conserva como antecedente; puede crearse una nueva meta activa para el juego.

### HU-02 · Entender el progreso de la semana

**Como** persona que juega a un videojuego, **quiero** comparar mis horas y días jugados esta semana con mi meta, **para** saber si estoy cumpliendo lo que me propuse.

- **CA-02.1 — Contar la semana local.** DADAS partidas de un videojuego, CUANDO consulto el progreso semanal, ENTONCES se consideran los días de lunes a domingo según `America/Guayaquil`, incluso en los límites entre semanas y años.
- **CA-02.2 — Calcular horas jugadas.** DADAS partidas dentro de la semana actual, CUANDO consulto el progreso, ENTONCES veo la suma de sus duraciones convertida a horas y redondeada a un decimal.
- **CA-02.3 — Comparar horas sin límite superior.** DADA una meta activa, CUANDO consulto el progreso, ENTONCES el porcentaje compara las horas de la semana con las horas objetivo, se redondea a un entero y puede superar 100 %.
- **CA-02.4 — Contar días distintos.** DADAS una o varias partidas del mismo día, CUANDO consulto el progreso semanal, ENTONCES ese día cuenta una sola vez; los demás días con partidas cuentan individualmente.
- **CA-02.5 — Aplicar la meta activa actual.** DADO un cambio de meta a mitad de semana, CUANDO consulto el progreso, ENTONCES toda la actividad de la semana se compara con la meta que está activa en ese momento.
- **CA-02.6 — Mostrar progreso sin meta activa.** DADO un videojuego sin meta activa, CUANDO consulto el progreso, ENTONCES veo sus horas, días y rachas, y el porcentaje de horas y los objetivos de meta aparecen como no aplicables.
- **CA-02.7 — Mostrar semana sin partidas.** DADO un videojuego sin partidas en la semana, CUANDO consulto el progreso, ENTONCES sus horas y días jugados de esa semana son cero.

### HU-03 · Reconocer las rachas de juego

**Como** persona que registra partidas, **quiero** conocer mi racha actual y mi mejor racha por videojuego, **para** entender mi constancia sin contar dos veces un mismo día.

- **CA-03.1 — Contar un día por fecha local.** DADAS varias partidas del mismo videojuego en un día de Ecuador, CUANDO se calcula la racha, ENTONCES todas cuentan como un solo día jugado.
- **CA-03.2 — Asignar una sesión que cruza medianoche.** DADA una partida que empieza antes y termina después de la medianoche en Ecuador, CUANDO se calcula el día jugado, ENTONCES toda la partida pertenece al día en que empezó.
- **CA-03.3 — Mantener viva la racha durante hoy.** DADO que hoy no hay partida pero sí hubo ayer, CUANDO se consulta la racha actual, ENTONCES se conserva la secuencia consecutiva hasta hoy.
- **CA-03.4 — Romper la racha tras más de un día sin jugar.** DADO que no hubo partidas ni hoy ni ayer, CUANDO se consulta la racha actual, ENTONCES es cero.
- **CA-03.5 — Calcular la mejor racha histórica.** DADO el historial completo con días jugados consecutivos y días vacíos, CUANDO se calcula la mejor racha, ENTONCES se devuelve la secuencia histórica más larga de días consecutivos.
- **CA-03.6 — Historial vacío.** DADO un videojuego sin partidas, CUANDO se consultan sus rachas, ENTONCES la racha actual y la mejor racha son cero.

### HU-04 · Ver el avance de los hitos

**Como** persona que definió hitos para un videojuego, **quiero** ver cuáles corresponden a mi avance actual, **para** entender qué objetivos de progreso ya alcancé.

- **CA-04.1 — Hito alcanzado.** DADO un hito cuyo objetivo es menor o igual al avance actual del videojuego, CUANDO consulto el progreso, ENTONCES se muestra como alcanzado.
- **CA-04.2 — Hito pendiente.** DADO un hito cuyo objetivo es mayor al avance actual, CUANDO consulto el progreso, ENTONCES se muestra como pendiente.
- **CA-04.3 — El estado refleja el avance actual.** DADO que el avance actual baja por debajo del objetivo de un hito, CUANDO vuelvo a consultar, ENTONCES el hito deja de mostrarse como alcanzado.
- **CA-04.4 — Sin partidas ni avance.** DADO un videojuego sin partidas, CUANDO consulto sus hitos, ENTONCES ninguno aparece alcanzado.

### HU-05 · Ver el progreso en el detalle del juego

**Como** persona que consulta un videojuego, **quiero** ver el resumen semanal en su detalle, **para** entender mi progreso sin perder el contexto.

- **CA-05.1 — Consultar el resumen semanal.** DADO un videojuego con actividad, CUANDO abro su detalle, ENTONCES veo horas frente a la meta, días frente al objetivo, racha actual, mejor racha e hitos con su estado.
- **CA-05.2 — Estado sin meta.** DADO un videojuego sin meta activa, CUANDO abro su detalle, ENTONCES veo las estadísticas disponibles y una invitación clara a crear una meta.
- **CA-05.3 — Estados de carga y error.** DADO que el resumen está cargando o no se pudo consultar, CUANDO abro el detalle, ENTONCES se informa el estado sin presentar un resultado inventado y se ofrece reintentar cuando sea posible.

### HU-06 · Administrar la meta desde el detalle

**Como** persona que consulta un videojuego, **quiero** crear, editar o desactivar su meta desde el detalle, **para** mantener mis objetivos semanales actualizados.

- **CA-06.1 — Crear y editar la meta.** DADO el detalle de un videojuego, CUANDO creo o edito su meta y sus hitos con datos válidos, ENTONCES el detalle refleja los valores guardados.
- **CA-06.2 — Confirmar desactivación.** DADA una meta activa, CUANDO solicito desactivarla, ENTONCES se pide confirmación y solo se desactiva al confirmar.
- **CA-06.3 — Ajustar campos numéricos.** DADO el formulario de meta, CUANDO aumento o reduzco horas, días o porcentaje de hito con sus controles visibles, ENTONCES el valor cambia sin superar los límites y también puede ingresarse por teclado.

### HU-07 · Corregir una partida registrada

**Como** persona que registra sus partidas, **quiero** editar una partida existente, **para** corregir su fecha, duración, avance o notas sin crear un registro duplicado.

- **CA-07.1 — Actualizar una partida existente.** DADA una partida registrada, CUANDO la persona guarda cambios válidos, ENTONCES se actualiza esa partida y no se crea otra.
- **CA-07.2 — Rechazar cambios inválidos.** DADA una partida registrada, CUANDO los cambios no cumplen las reglas de sus datos, ENTONCES se rechaza la edición y se informa qué debe corregirse.
- **CA-07.3 — Informar partida inexistente.** DADO un identificador sin partida asociada, CUANDO se intenta editarla, ENTONCES se informa que no se encontró y no se modifica otra partida.
- **CA-07.4 — Refrescar el progreso del detalle.** DADO el detalle del videojuego, CUANDO registro, edito o elimino una partida, ENTONCES el resumen, las rachas y los hitos se vuelven a consultar y reflejan los datos guardados.

### HU-08 · Mantener la coherencia entre el estado del juego y sus registros

**Como** persona que mantiene su biblioteca, **quiero** que las metas sigan el estado de cada videojuego, **para** no conservar objetivos activos para juegos completados o abandonados ni registros huérfanos.

- **CA-08.1 — Desactivar al completar o abandonar.** DADO un videojuego con meta activa, CUANDO su estado cambia a completado o abandonado, ENTONCES la meta queda desactivada.
- **CA-08.2 — No reactivar automáticamente.** DADO un videojuego cuya meta se desactivó al completarlo o abandonarlo, CUANDO vuelve a otro estado, ENTONCES la meta permanece inactiva hasta que la persona cree una nueva.
- **CA-08.3 — Eliminar registros dependientes.** DADO un videojuego con partidas y metas, CUANDO se elimina el videojuego, ENTONCES también se eliminan sus partidas y todas sus metas e hitos asociados.

### HU-09 · Consultar el progreso semanal de todos los videojuegos

**Como** persona que registra varios videojuegos, **quiero** consultar el progreso semanal de cada uno desde una vista general, **para** encontrar rápidamente qué juegos estoy siguiendo y abrir su detalle.

- **CA-09.1 — Acceso desde la navegación.** DADA la aplicación, CUANDO consulto la navegación, ENTONCES encuentro el acceso «Mi progreso» que abre la vista `/progreso`.
- **CA-09.2 — Resumen por videojuego.** DADA una biblioteca con videojuegos, CUANDO abro «Mi progreso», ENTONCES veo por juego las horas, días, racha actual y mejor racha entregados por el servidor.
- **CA-09.3 — Abrir detalle.** DADO un juego en la vista general, CUANDO selecciono su enlace, ENTONCES se abre el detalle de ese videojuego.
- **CA-09.4 — Carga, error y vacío.** DADA la carga de la vista, CUANDO aún espera datos, falla una consulta o la biblioteca está vacía, ENTONCES cada estado se comunica de forma distinta y el error permite reintentar.
- **CA-09.5 — No duplicar reglas.** DADA la respuesta del backend, CUANDO se muestra el resumen general, ENTONCES no se recalculan semanas, días ni rachas en el navegador ni se inventa una racha global.

### HU-10 · Leer el progreso con claridad y accesibilidad

**Como** persona que consulta el detalle de un videojuego, **quiero** distinguir sus métricas de horas, días y rachas, **para** comprender el progreso sin solapamientos ni depender solo del color.

- **CA-10.1 — Jerarquía adaptable.** DADO el detalle y el progreso semanal, CUANDO se muestran títulos y métricas en distintas anchuras, ENTONCES el contenido se adapta sin solapamientos ni pérdida de legibilidad.
- **CA-10.2 — Estado accesible de la racha.** DADO el indicador visual de racha, CUANDO se recorre con tecnologías de asistencia o se consulta visualmente, ENTONCES conserva nombre accesible y texto de racha actual y mejor racha.
- **CA-10.3 — Teclado y movimiento reducido.** DADO el listado de hitos y sus animaciones, CUANDO se navega con teclado o la persona prefiere menos movimiento, ENTONCES el foco es visible y las animaciones nuevas se reducen o desactivan.

### HU-11 · Ajustar los campos numéricos con controles visibles

**Como** persona que registra metas y partidas, **quiero** aumentar o reducir los valores numéricos con controles claros, **para** editarlos con precisión sin exceder sus límites.

- **CA-11.1 — Controles accesibles.** DADO un campo numérico de meta o partida, CUANDO lo edito, ENTONCES veo botones accesibles para aumentar y reducir el valor y puedo seguir escribiéndolo directamente.
- **CA-11.2 — Respetar límites.** DADO un campo con mínimo, máximo y paso definidos, CUANDO llego a un límite, ENTONCES el control correspondiente se deshabilita y ningún botón permite salir del rango.
- **CA-11.3 — Duración sin máximo artificial.** DADO el campo de duración de una partida sin máximo configurado, CUANDO aumento su valor, ENTONCES puedo seguir aumentándolo sin un tope arbitrario.
- **CA-11.4 — Unidad y foco visibles.** DADO un campo con unidad como porcentaje, CUANDO navego con teclado o cambio el valor, ENTONCES la unidad permanece dentro del grupo visual del campo y el foco de sus controles es visible.

## Tickets

Los tickets de pruebas del dominio preceden a la implementación correspondiente. La spec debe confirmar los archivos y el orden exactos antes de iniciar cualquier cambio de código.

| ID | Tipo | Alcance | Definition of Done | Dependencias | Estado y evidencia |
|---|---|---|---|---|---|
| T-01 | Pruebas | Añadir pruebas automatizadas sin base de datos para los criterios verificables de semana, suma y redondeo, días distintos, rachas, sesión que cruza medianoche e hitos. | Cada criterio de dominio aplicable tiene una prueba; las pruebas fallan si se elimina la regla y pasan con el comportamiento acordado; el comando de pruebas queda documentado y ejecutado. | — | Hecho: pruebas puras en `backend/src/dominio/progreso.test.ts`; incluidas en `npm test`. |
| T-02 | Backend | Implementar el cálculo puro de semana, horas, días jugados, racha actual, mejor racha e hitos conforme a T-01. | Todas las pruebas de T-01 pasan; la lógica recibe datos y fecha de referencia, no consulta la base de datos, y el build backend pasa. | T-01 | Hecho: pruebas de dominio y `npm run build` pasan. |
| T-03 | Backend | Crear y administrar metas; validar límites, videojuego existente y máximo de una meta activa; permitir consultar por id y por videojuego, actualizar y desactivar. | Los criterios HU-01 tienen pruebas; duplicados activos responden 409 con mensaje claro; metas desactivadas se conservan; build backend pasa. | T-05 | Hecho en código y pruebas de modelo/servicio; falta validar el índice y el conflicto concurrente contra Atlas de prueba. |
| T-04 | Backend | Exponer el progreso semanal integrando partidas, meta activa, cálculo de dominio, rachas e hitos; informar videojuego inexistente y ausencia de meta según lo acordado. | Los criterios HU-02, HU-03 y HU-04 tienen pruebas; se verifican juego sin partidas y juego con al menos cinco partidas en días distintos y una racha rota; errores de id y recurso se comprueban; build backend pasa. | T-02, T-03, T-05 | Hecho en pruebas de servicio (incluyen cinco partidas y racha rota) y build; falta prueba manual con ID válido en Atlas/Render y registrar la matriz HTTP. |
| T-05 | Deuda / Backend | Corregir el manejo centralizado de errores para que las respuestas distingan 400, 404, 409 y 500. Paga el hallazgo B-08 del diagnóstico. | Hay pruebas por cada categoría, incluida la respuesta 409; no se filtran detalles internos en 500; los errores existentes mantienen respuesta útil; build backend pasa. | — | Hecho: `errorHandler.test.ts` cubre 400/404/409/500 y el build pasa. |
| T-06 | Deuda / Backend | Extender la política de ciclo de vida para desactivar la meta al completar o abandonar el juego y eliminar metas y partidas al borrar el juego. Paga el hallazgo B-07 del diagnóstico. | Los criterios HU-08 tienen pruebas de estado, reactivación y eliminación; no quedan metas ni partidas huérfanas tras la operación; la estrategia funciona en el entorno MongoDB objetivo y build backend pasa. | T-03 | Hecho en código y pruebas con dobles; pendiente confirmar transacciones, eliminación y ausencia de huérfanos en Atlas de prueba. |
| T-07 | Backend | Permitir editar una partida existente con validación y referencia correcta, de acuerdo con la necesidad de refrescar el progreso después de editar. | Hay pruebas de actualización válida, entrada inválida y partida inexistente; la edición conserva el videojuego asociado salvo cambio permitido por el contrato; build backend pasa. | T-05 | Hecho en código y pruebas de servicio para lectura, edición, validación y 404; falta prueba HTTP manual de GET/PUT con datos de juego de prueba. |
| T-08 | Frontend | Crear un servicio independiente para consultar, crear, editar y desactivar metas, y un formulario accesible para horas, días e hitos. | Los criterios HU-06.1 y HU-06.2 están cubiertos; se validan límites antes de guardar, se muestra el error del servidor, y el build frontend y lint pasan. | T-03 | Hecho: pruebas del formulario y servicios; build y lint configurado/ejecutado. |
| T-09 | Frontend | Incorporar al detalle la sección de progreso semanal, estados de carga/error/vacío, comparación de horas y días, rachas e hitos. | Los criterios HU-05.1–HU-05.3 están cubiertos; “sin meta” invita a crear una; estilos respetan `DESIGN.md`; build frontend y lint pasan. | T-04, T-08 | Hecho en pruebas y build; evidencia visual compartida para escritorio. Pendiente revisar móvil, teclado y foco en el navegador. |
| T-10 | Frontend | Incorporar edición de partidas y actualizar los datos visibles del detalle después de crear, editar o eliminar una partida. | Los criterios HU-07.1–HU-07.4 están cubiertos; los errores de guardado se muestran y no se presenta progreso obsoleto como actualizado; build frontend y lint pasan. | T-07, T-09 | Hecho en pruebas de UI y build/lint; pendiente repetir el flujo en navegador y adjuntar evidencia visual. |
| T-11 | Frontend | Agregar una vista de progreso semanal por videojuego en `/progreso`, con enlaces a los detalles y estados de carga, error y biblioteca vacía. | Los criterios HU-09 tienen pruebas con servicios simulados; cada tarjeta usa datos del servidor; build y lint frontend pasan. | T-09 | Hecho en `ProgresoUsuario.tsx`; prueba de componente con valores, reintento y biblioteca vacía; build y lint pasan. |
| T-12 | Frontend | Mejorar la jerarquía visual y accesibilidad del detalle y del progreso semanal siguiendo `DESIGN.md`. | Los criterios HU-10 tienen prueba de accesibilidad del indicador; estilos responden a anchuras, foco visible y `prefers-reduced-motion`; build/lint pasan y revisión móvil/teclado queda registrada. | T-09 | Hecho en estilos y prueba del indicador; build/lint pasan. Falta revisión manual en móvil y teclado. |
| T-13 | Frontend | Incorporar controles numéricos accesibles y reutilizables para metas y partidas, con límites por campo y unidades integradas. | Los criterios HU-11 tienen pruebas de meta, duración y avance; límites deshabilitan el control correcto; unidades y foco son legibles; build/lint frontend pasan. | T-07, T-08 | Hecho en `ControlNumero.tsx` y formularios; pruebas de interacción y build/lint pasan. Pendiente completar revisión manual con teclado. |

## Deuda técnica diferida

| Hallazgo del diagnóstico | Decisión | Motivo para diferir |
|---|---|---|
| D-02: el README dice `ultimaSesion` y el resumen implementado devuelve `ultimaPartida`. | Mantener el contrato existente y verificar qué nombre usa el cliente antes de decidir un cambio. | Cambiarlo sin evidencia podría romper compatibilidad con el Proyecto 3. |
| D-03: el resumen carga todas las partidas para calcular sus agregados. | Medir y probar antes de optimizar. | No hay evidencia de un problema de rendimiento; una reescritura sin medición añade riesgo al resumen que se quiere conservar. |
| Métrica mensual “3 de 4 semanas” para meses con semanas parciales o cinco semanas. | Mantener como pregunta abierta del PRD. | E2 no incluye historial mensual y la ficha no define qué cuatro semanas se comparan. |
| Partidas con fecha futura. | Mantener como pregunta abierta del PRD y conservar el comportamiento actual hasta acordar una regla. | No está definido por el cliente y no es necesario para el cálculo acordado de la semana. |

## Notas de trazabilidad

- Los criterios HU-01 a HU-08 se derivan de las reglas y alcance del PRD y del diagnóstico aprobado.
- T-05 está pagado con código, pruebas y build. T-06 está implementado y tiene pruebas automatizadas, pero no se declara cerrado hasta verificar transacciones en un Atlas de prueba.
- T-01 se implementa y verifica antes del código de dominio T-02.
- Cada spec se registra en Git antes de los tickets de código que describe. Este backlog no autoriza a implementar antes de que las specs de backend y frontend estén revisadas.
