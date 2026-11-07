# Guion para la demo de E2 (máximo 6 minutos)

La demo debe grabarse con datos de prueba y sin mostrar `.env`, credenciales, URI de MongoDB ni información privada. Usa un videojuego de prueba en estado `en curso`; el juego que aparece completado en la captura no permite crear una meta activa.

## Preparación antes de grabar

- Despliega o inicia backend y frontend y comprueba que la biblioteca carga.
- Crea un videojuego temporal en estado `en curso`.
- Registra una meta con horas, días e hitos (por ejemplo, 25 %, 50 % y 100 %).
- Registra varias partidas de prueba en días distintos; para demostrar una racha, usa días consecutivos. Puedes ajustar su avance para alcanzar al menos un hito.
- Ten a mano `docs/diagnostico.md`, el PRD, el backlog, ambas specs, un test de dominio y el código relacionado.
- Identifica el ID del videojuego temporal para la prueba de conflicto 409. No uses un videojuego que contenga datos personales.

## Secuencia sugerida

| Tiempo | Demostración |
|---|---|
| 0:00–0:35 | Presentar el problema E2 y mostrar dónde están el PRD, las historias/tickets, las specs y esta auditoría. |
| 0:35–1:25 | En el detalle del juego temporal, crear o editar una meta con horas, días e hitos. Mostrar validación y estado de guardado. |
| 1:25–2:30 | Registrar o mostrar partidas en días distintos. Volver al detalle y mostrar semana, horas, días, racha actual, mejor racha e hito alcanzado. |
| 2:30–3:10 | Editar una partida para cambiar fecha/duración/avance; demostrar que el detalle refresca. Mostrar confirmación antes de eliminar, cancelando primero. |
| 3:10–3:45 | Provocar el 409: conservar la meta activa del juego temporal e intentar crear otra meta activa para el mismo ID mediante la API. La respuesta debe ser HTTP 409 `CONFLICTO`. |
| 3:45–4:20 | Mostrar el caso de juego completado o abandonado, sin acción para crear una meta activa. |
| 4:20–5:20 | Recorrer un criterio de punta a punta: PRD → historia/criterio → ticket → spec → prueba → implementación → fila de auditoría. |
| 5:20–6:00 | Mostrar comandos de pruebas/build y mencionar con transparencia qué verificaciones de Atlas, móvil/teclado o despliegue quedaron pendientes. |

## Prueba manual del conflicto

Con el servidor local y un videojuego temporal existente que ya tenga una meta activa, sustituye el ID y los valores de ejemplo por datos de prueba propios:

```bash
curl -i -X POST http://localhost:5000/api/metas \
  -H "Content-Type: application/json" \
  -d '{"videojuego":"<ID_DEL_JUEGO_DE_PRUEBA>","horasSemanales":5,"diasPorSemana":3,"hitos":[]}'
```

La respuesta esperada es `409 Conflict` con categoría `CONFLICTO`. No compartas el ID ni la respuesta si corresponden a datos reales.

## Evidencia posterior

Guarda el video en el lugar indicado por el curso. Anota en [AUDITORIA.md](./AUDITORIA.md) el enlace o nombre de la evidencia y la fecha; no subas videos ni capturas que revelen datos sensibles.
