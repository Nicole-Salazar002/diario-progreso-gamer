# Spec frontend — Eliminar videojuego desde la biblioteca

## Objetivo

Permitir que la persona elimine un videojuego desde la aplicación sin recurrir directamente a MongoDB, conservando el borrado en cascada que ya ofrece el backend.

## Requisitos

- Cada tarjeta de videojuego en la biblioteca ofrece una acción visible y accesible para eliminar ese juego.
- La acción solicita confirmación y advierte que la eliminación también borra las partidas y metas asociadas y no se puede deshacer.
- Si se cancela la confirmación, no se llama a la API y el juego permanece en la biblioteca.
- Si se confirma, se llama a `videojuegosApi.eliminar` con el ID correspondiente; tras éxito, se actualizan la lista y sus conteos.
- Si falla la solicitud, se conserva la tarjeta y se muestra un error comprensible.
- La acción de eliminar no activa la navegación de la tarjeta al detalle.

## Criterio → verificación

| Criterio | Verificación |
|---|---|
| CA-08.4 | Pruebas de `ListaVideojuegos` verifican cancelar sin llamada, confirmar con ID correcto y quitar la tarjeta tras éxito. |
| CA-08.5 | Prueba de error verifica que la tarjeta permanece visible y se anuncia el fallo. |
| Navegación independiente | Prueba que hacer clic en eliminar no navega al detalle del videojuego. |
| Confirmación destructiva | Inspección de la interfaz confirma que el aviso menciona partidas, metas y que la acción no se puede deshacer. |

## Archivos

- `frontend/src/pages/ListaVideojuegos.tsx`
- `frontend/src/pages/ListaVideojuegos.test.tsx`
- `frontend/src/styles.css`
