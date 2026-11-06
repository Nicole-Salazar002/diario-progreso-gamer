# Spec frontend — Controles numéricos visibles

## Objetivo

Unificar la interacción visual de todos los campos numéricos de la aplicación con controles visibles para aumentar y reducir su valor.

## Requisitos

### DEBE

- Cada campo numérico de horas, días, hitos, duración de sesión y porcentaje de avance muestra botones `−` y `+` visibles y accesibles.
- Los controles respetan el mínimo, máximo y paso configurados para cada campo; los campos siguen aceptando escritura directa y teclado.
- Los botones de límite se deshabilitan cuando la operación excedería el rango.
- Los campos sin máximo configurado (duración de una sesión) permiten seguir aumentando sin tope artificial.
- Los controles reutilizan los tokens visuales existentes y muestran un foco claro al navegar con teclado.
- Las unidades de los campos numéricos, como `%`, se muestran dentro de la misma superficie del campo, sin chocar con los botones de incremento/decremento.

### NO DEBE

- Deshabilitar la entrada directa por teclado ni añadir un máximo que no esté definido para el campo.
- Permitir que los controles de incremento/decremento superen los límites del contrato.
- Mostrar la unidad fuera del grupo visual al que pertenece o perder el indicador de foco.

## Criterio → verificación

| Criterio | Verificación |
|---|---|
| CA-11.1 | Pruebas de interacción de `FormularioMeta` y `FormularioPartida` verifican botones y edición directa. |
| CA-11.2 | Pruebas de `FormularioMeta` comprueban incremento/decremento y botones deshabilitados en límites; los inputs conservan sus atributos min/max/step. |
| CA-11.3 | Prueba de duración de partida verifica que no se configura un límite superior artificial. |
| CA-11.4 | Prueba/inspección de la unidad de porcentaje dentro del control y revisión de foco visible por teclado. |
| Build, lint y pruebas | TypeScript, `npm test`, `npm run lint` y `npm run build` en frontend. |

## Ticket → archivos

| Ticket | Archivos |
|---|---|
| T-13 | `frontend/src/components/ControlNumero.tsx`; `frontend/src/pages/FormularioMeta.tsx`; `frontend/src/pages/FormularioMeta.test.tsx`; `frontend/src/pages/FormularioPartida.tsx`; `frontend/src/pages/FormularioPartida.test.tsx`; `frontend/src/progreso.css`. |
