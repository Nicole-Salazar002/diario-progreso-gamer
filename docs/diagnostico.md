# Diagnóstico del Proyecto 3

Fecha: 2026-11-04

## Estado actual

El proyecto contiene un backend Express + TypeScript + Mongoose y un frontend React + TypeScript + Vite. El backend ya separa modelos, servicios, controladores, rutas y middleware de errores. `Videojuego` y `Partida` existen; `Partida` referencia a `Videojuego`, y `GET /api/videojuegos/:id/resumen` calcula el resumen existente. El frontend ya muestra el detalle y ese resumen.

La carpeta recibida no tenía historial Git ni remoto. Se inicializó un repositorio nuevo; el commit `chore: capture Proyecto 3 baseline` conserva el código recibido en `main`, y el trabajo de E2 continúa en `feature/e2-metas-rachas`. Este historial nuevo no recupera commits previos del Proyecto 3. Después se configuró el remoto del repositorio existente y el PR #1 se integró en `main`; la integración conserva ambas líneas de historia sin reconstruir los commits anteriores del Proyecto 3.

## Verificación inicial

| Comprobación | Resultado |
|---|---|
| Node.js | v24.22.0 |
| Compilación backend (`npm run build`) | Correcta |
| Compilación frontend (`npm run build`) | Correcta |
| Pruebas automatizadas existentes | No se encontraron |
| Documentación SDD (`docs/`) | No existía; este archivo inicia la documentación |
| Harness de agente | No se encontraron `AGENTS.md`, `CLAUDE.md` ni configuración `.claude/` |
| Configuración de entorno | Hay archivos `.env.example`; `.env` está excluido por `.gitignore`. No se leyó ni se añadió ningún `.env` al repositorio |

## Problemas y decisiones

| ID | Hallazgo | Decisión | Clasificación |
|---|---|---|---|
| B-01 | No existe entidad Meta, CRUD de metas, progreso semanal, cálculo de rachas ni hitos. | Implementar E2 según las reglas acordadas en PRD y specs. | Bloquea E2 |
| B-02 | El frontend no tiene sección de progreso semanal, formulario de meta ni servicio `metasApi.ts`. | Implementar la experiencia E2 y sus estados de carga, error y vacío. | Bloquea E2 |
| B-03 | No hay pruebas automatizadas ni scripts de pruebas. | Incorporar pruebas para las funciones puras de dominio y verificaciones especificadas antes de implementar el código relacionado. | Bloquea E2 |
| B-04 | No existen PRD, backlog, specs, auditoría ni bitácora del agente. | Crear los documentos de la cadena SDD antes del código que describan. | Bloquea trazabilidad |
| B-05 | No hay `AGENTS.md`, `CLAUDE.md`, skill, hooks ni `DESIGN.md`. | Preparar el harness y documentar el diseño antes de implementar la interfaz. | Bloquea trazabilidad |
| B-06 | La ruta de partidas permite consultar, crear y eliminar, pero no editar una partida. | Añadir la edición que requiere la consigna y refrescar el progreso tras editar, además de hacerlo tras crear o eliminar. | Bloquea E2 |
| B-07 | Al eliminar un videojuego se eliminan sus partidas, pero no hay política para las metas que se agregarán. La eliminación de registros relacionados no está agrupada en una transacción. | Definir y probar la eliminación de metas e hitos junto con el videojuego; evitar metas huérfanas. La estrategia transaccional se evaluará con la infraestructura disponible. | Bloquea E2 |
| B-08 | El middleware distingue errores de validación y de ID inválido como 400 y conserva el `statusCode` de `AppError`, pero etiqueta cualquier `AppError` como `NO_ENCONTRADO`. | Extenderlo para responder con categorías y mensajes correctos, incluido el 409 de meta activa duplicada. | Bloquea E2 |
| B-09 | Git se inicializó desde una copia sin historial previo y al inicio no había remoto configurado. | Resuelto: se vinculó el remoto correcto y E2 se integró mediante el PR #1. La historia anterior del Proyecto 3 no se reconstruyó. | Resuelto; el historial antiguo del Proyecto 3 no se recupera |
| D-01 | El README indica Node 18+, mientras que las instrucciones de E2 requieren Node 20+. | Actualizar el requisito al revisar el README para la entrega. | Diferible hasta actualizar README |
| D-02 | El README describe `ultimaSesion`, pero el resumen implementado devuelve `ultimaPartida`. | Mantener el contrato existente durante E2 salvo que el diagnóstico de compatibilidad demuestre que hay que cambiarlo; documentar y probar cualquier ajuste. | Diferible; no alterar el resumen sin decisión |
| D-03 | El servicio del resumen carga y ordena los documentos de partida para calcular unos pocos valores. | Deferir una optimización hasta que exista una medición y pruebas que permitan preservar el contrato del resumen. | Diferible |

## Alcance acordado

Se consideran bloqueantes los requisitos expresos de E2, la trazabilidad documental y el orden de commits. Las mejoras no necesarias para esos requisitos quedan como deuda técnica hasta que el backlog justifique pagarlas. En particular, la edición de partidas sí se incluye porque la consigna exige actualizar la vista de progreso después de editar.

El resumen del Proyecto 3 se conservará sin cambios funcionales salvo que una spec y sus pruebas justifiquen una corrección. La validación inicial solo comprobó compilación; no se ejecutaron pruebas porque todavía no existen. Las ocho decisiones de producto que faltan (racha de hoy, partidas en el mismo día, cruce de medianoche, cambio de meta, porcentaje máximo, persistencia lógica de hitos, estado del juego y eliminación del juego) se resolverán en el PRD, no se supondrán en esta fase.

## Deuda técnica para priorizar en el backlog

- Corregir la discrepancia documental `ultimaSesion`/`ultimaPartida` con una verificación del contrato antes de cambiarlo.
- Evaluar y probar una consulta más eficiente para el resumen, sin modificar su respuesta observable.
- Actualizar la versión de Node documentada de 18+ a 20+.
