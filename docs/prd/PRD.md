# PRD — Diario de Progreso Gamer

## Contexto

El Diario de Progreso Gamer ya permite registrar videojuegos y partidas y consultar cuánto se ha jugado y cuánto se ha avanzado. La épica E2, **Metas y rachas**, añade una forma de comparar la actividad reciente con lo que la persona se propuso y de reconocer la constancia.

## Usuario y problema

La persona usuaria es quien ya registra sus videojuegos y partidas en el Diario. Aunque puede consultar su historial, no sabe si está cumpliendo lo que se propuso para la semana ni cuántos días seguidos lleva jugando a cada videojuego. Puede jugar mucho un fin de semana y luego dejar ese juego durante semanas.

## Objetivo del producto

Permitir que la persona fije una meta semanal para un videojuego y, en el detalle de ese juego, entienda de forma clara:

- Cuánto tiempo jugó esta semana frente a las horas que se propuso.
- En cuántos días distintos jugó frente a los días que se propuso.
- Cuál es su racha actual y cuál ha sido su mejor racha.
- Qué hitos de avance corresponden a su progreso actual.
- Cómo va el progreso semanal de cada videojuego desde una vista general accesible en la navegación.

## Métrica de éxito

Una semana cumple la meta cuando la persona alcanza **tanto** las horas semanales como los días por semana que se propuso. La señal de éxito descrita por el cliente es cumplir la meta semanal en al menos 3 de cada 4 semanas evaluadas en un mes.

La definición exacta de las cuatro semanas evaluadas cuando un mes contiene semanas parciales o cinco semanas calendario queda abierta. Se justifica dejarla pendiente porque E2 informa el progreso de la semana actual y no incluye gráficos ni consulta histórica de cumplimiento mensual.

## Alcance

- Definir una meta activa por videojuego, expresada en horas semanales y días de juego por semana.
- Permitir una lista corta de hitos de avance asociados a la meta.
- Consultar el progreso de la semana actual y las rachas del videojuego.
- Mostrar el estado de cada hito según el progreso actual del videojuego.
- Crear, consultar, actualizar y desactivar metas.
- Conservar el acceso al resumen y al historial de partidas existentes del Proyecto 3.
- Si se registra, edita o elimina una partida, reflejar los datos actualizados en el progreso mostrado.
- Ofrecer una vista general del progreso semanal por videojuego, con acceso al detalle de cada juego.
- Facilitar la edición de valores numéricos mediante controles visibles, accesibles y limitados por las reglas de cada campo.

## Fuera de alcance

- Notificaciones o recordatorios.
- Metas compartidas entre personas.
- Rankings.
- Gráficos históricos.
- Cambios al propósito del resumen existente del Proyecto 3, salvo que una decisión aprobada y verificable lo requiera.

## Reglas de negocio

### Metas

- Cada videojuego puede tener como máximo una meta activa.
- Una meta indica horas semanales mayores que cero y hasta 100, y un número entero de días por semana entre 1 y 7.
- Una meta contiene como máximo cinco hitos; cada hito tiene una descripción y un objetivo de avance entre 1 % y 100 %.
- Una meta nueva está activa por defecto. Desactivarla no elimina su historial.
- Si ya hay una meta activa para un videojuego, no se puede activar otra mientras la anterior siga activa.

### Semana y progreso

- La semana se cuenta de lunes a domingo según la hora de Ecuador (`America/Guayaquil`).
- Cada partida pertenece al día de Ecuador en que empezó. Si cruza la medianoche, toda su duración se atribuye a ese día; no se reparte entre días.
- Varias partidas del mismo día cuentan como un solo día jugado.
- Las horas semanales suman la duración de las partidas de la semana, convertida a horas y redondeada a un decimal.
- El porcentaje de horas compara esas horas con la meta semanal y se redondea a un entero. No tiene límite de 100 %: superar la meta puede dar, por ejemplo, 140 %.
- Cambiar la meta durante la semana no reinterpreta la actividad registrada con la meta anterior: se compara toda la actividad de la semana actual con la meta que esté activa al consultar.
- Sin una meta activa, se muestran las horas y los días jugados, además de las rachas; el porcentaje de horas y los objetivos de meta no aplican.
- Sin partidas, las horas, los días y las rachas son cero y ningún hito está alcanzado.

### Rachas

- Una racha cuenta días calendario consecutivos de Ecuador con al menos una partida del videojuego; partidas adicionales en el mismo día no la alargan.
- La racha actual se calcula con el historial completo. Si no hubo partida hoy pero sí ayer, la racha continúa durante el día de hoy. Si la última partida fue anterior a ayer, la racha actual es cero.
- La mejor racha es la secuencia más larga de días consecutivos con partidas en el historial completo.

### Hitos

- Un hito está alcanzado cuando el porcentaje de avance actual del videojuego es igual o superior a su objetivo.
- El estado de alcanzado describe el progreso actual, no un logro permanente. Si el porcentaje de avance actual baja del objetivo, el hito deja de estar alcanzado.

### Estado y eliminación del videojuego

- Un videojuego completado o abandonado no puede conservar una meta activa. Al cambiar a uno de esos estados, su meta activa se desactiva.
- Si el videojuego vuelve a un estado distinto, la meta no se reactiva automáticamente.
- Eliminar un videojuego también elimina sus partidas y todas sus metas e hitos; no se conservan registros huérfanos.

## Supuestos y puntos abiertos

| Tema | Estado | Motivo |
|---|---|---|
| Qué cuatro semanas se evalúan para la métrica mensual | Abierto | El cliente define “3 de 4 semanas”, pero no especifica cómo tratar meses que abarcan semanas parciales o cinco semanas calendario. No es necesario para mostrar la semana actual. |
| Partidas con fecha futura | Abierto | La ficha no indica si se permiten. E2 no define una regla nueva sobre fechas futuras; se conserva el comportamiento existente hasta validar este caso. |
| Meta desactivada y meta activa duplicada | Decidido | Se conserva el historial de metas desactivadas; se puede crear otra, pero nunca tener dos activas a la vez para el mismo juego. |
| Juego que vuelve a estar en curso después de completarse o abandonarse | Decidido | La meta desactivada no se reactiva automáticamente; la persona puede definir una nueva meta. |

## Principios de experiencia

- Presentar el progreso de forma clara y alentadora, sin juzgar el ritmo de juego.
- Explicar cuándo no hay una meta activa e invitar a crear una.
- Comunicar carga, errores y estados vacíos con un siguiente paso comprensible.
- La nueva experiencia visual debe seguir el sistema acordado en `DESIGN.md`.
