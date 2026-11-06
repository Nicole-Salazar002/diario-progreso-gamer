# Spec frontend — Fondo violeta atmosférico

## Objetivo

Reemplazar el aspecto plano del fondo exterior de la aplicación por una composición CSS inspirada en la referencia: luz magenta y violeta, haces difusos y zonas profundas, manteniendo legible el marco oscuro de PLAYERLOG.

## Requisitos

- El fondo decorativo se construye con degradados CSS y no requiere imágenes remotas ni dependencias.
- La capa visual ocupa el fondo exterior en escritorio y móvil sin interceptar interacciones.
- El contraste del marco y las superficies existentes se conserva.
- La composición mantiene la identidad violeta/lavanda descrita en `DESIGN.md`.

## Verificación

| Criterio | Verificación |
|---|---|
| FA-01 | Inspeccionar que el fondo se construye con degradados CSS y no realiza solicitudes de imágenes remotas. |
| FA-02 | Inspeccionar que el fondo se aplica al `body` y no agrega capas que intercepten clics o teclado. |
| FA-03 | Ejecutar TypeScript/build y revisar que el marco y paneles interiores mantienen sus estilos existentes. |
| FA-04 | Revisar visualmente escritorio y móvil para confirmar que el fondo es visible sin perjudicar la legibilidad. |

La comprobación automatizada es `npm run build` en `frontend`; FA-01 y FA-02 se verifican por inspección de `fondo.css`. FA-04 requiere revisión manual y queda pendiente hasta comprobar la interfaz en ambos tamaños.

## Archivos

- `frontend/src/fondo.css`
- `frontend/src/App.tsx`
- `DESIGN.md`
