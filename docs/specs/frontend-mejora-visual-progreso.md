# Spec frontend — Mejora visual del detalle y el progreso semanal

## Propósito

Mejorar la lectura y la presentación visual del detalle del videojuego y de su progreso semanal, conservando las funciones, fuentes de datos y reglas definidas en [`frontend-meta-progreso.md`](./frontend-meta-progreso.md) y los tokens de [`DESIGN.md`](../../DESIGN.md).

## Requisitos

### DEBE

- Reducir el amontonamiento y los solapamientos en el detalle usando columnas flexibles, mínimos adaptables y ajuste de texto para títulos y nombres extensos.
- Presentar horas y días en tarjetas legibles y diferenciadas, y destacar la racha actual con una jerarquía visual propia que muestre también la mejor racha.
- Hacer que el listado de hitos responda al puntero y al foco de teclado, con estados alcanzado/pendiente comprensibles sin depender solo del color.
- Añadir movimiento sutil a progreso y racha, desactivándolo bajo `prefers-reduced-motion`.
- Mantener legibles y operables los componentes en móvil y escritorio, sin quitar controles ni alterar datos.

### NO DEBE

- Comunicar el estado de hitos únicamente por color ni ocultar sus nombres accesibles.
- Cambiar cálculos, datos o acciones del progreso semanal como parte de una mejora visual.
- Ejecutar animaciones cuando `prefers-reduced-motion` solicita reducirlas.

## Criterio → verificación

| Criterio | Verificación |
|---|---|
| CA-10.1 | Revisión de estilos de títulos largos, columnas adaptables y reglas responsivas. |
| CA-10.2 | Prueba de `ProgresoSemanal`: presenta el indicador gráfico de racha con nombre accesible y conserva el texto de racha actual y mejor racha. |
| CA-10.3 | Inspección de foco visible y regla `prefers-reduced-motion`; revisión manual de navegación con teclado. |
| Build y lint | `npm run build` y `npm run lint` dentro de `frontend`. |

## Ticket → archivos

| Ticket | Archivos |
|---|---|
| T-12 | `frontend/src/pages/ProgresoSemanal.tsx`; `frontend/src/pages/ProgresoSemanal.test.tsx`; `frontend/src/styles.css`; `frontend/src/progreso.css`. |
