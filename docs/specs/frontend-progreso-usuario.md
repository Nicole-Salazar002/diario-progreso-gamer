# Spec frontend — Acceso rápido al progreso del usuario

## Propósito

Dar acceso desde la navegación a una vista unificada del progreso semanal por videojuego, usando los datos existentes del endpoint de progreso semanal.

## Requisitos comprobables

### DEBE

- Ofrecer en la navegación un acceso «Mi progreso» que abre `/progreso`.
- Cargar la biblioteca y el progreso semanal calculado por el servidor para cada videojuego.
- Mostrar horas, días, racha actual y mejor racha por juego y permitir abrir su detalle.
- Presentar carga, error con reintento y biblioteca vacía como estados distintos.

### NO DEBE

- Inventar una racha global ni recalcular semanas, días o rachas en el frontend.
- Ocultar un error de consulta como si fuera biblioteca vacía o progreso cero.

## Verificación

| Criterio | Verificación |
|---|---|
| CA-09.1 | Prueba de navegación que el enlace «Mi progreso» abre `/progreso`. |
| CA-09.2 | Prueba de componente con servicios simulados que muestra por juego los valores devueltos por la API. |
| CA-09.3 | Prueba que el enlace de una tarjeta abre el detalle del juego correcto. |
| CA-09.4 | Pruebas separadas de carga, error/reintento y biblioteca vacía. |
| CA-09.5 | Inspección del componente: muestra la respuesta semanal y no calcula métricas de dominio en el cliente. |
| Build y lint | `npm run build` y `npm run lint` dentro de `frontend`. |
| Pruebas automatizadas | `npm test` dentro de `frontend`, sin backend ni MongoDB. |

## Ticket → archivos

| Ticket | Archivos |
|---|---|
| T-11 | `frontend/src/App.tsx`; `frontend/src/pages/ProgresoUsuario.tsx`; `frontend/src/pages/ProgresoUsuario.test.tsx`; `frontend/src/pages/index.ts`; `frontend/src/styles.css`; `frontend/src/progreso.css`. |
