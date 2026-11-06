# Diario de Progreso Gamer

## Proyecto y stack
- Aplicación para registrar videojuegos y partidas y consultar su progreso.
- Backend: Node.js 20+, Express, TypeScript y Mongoose/MongoDB.
- Frontend: React, TypeScript y Vite.
- Base de datos: MongoDB Atlas; despliegue existente en Render.

## Estructura
- `backend/src/models/`: esquemas de Mongoose.
- `backend/src/services/`: lógica de aplicación y acceso a datos.
- `backend/src/controllers/`, `routes/`, `middleware/`, `config/`: API y configuración.
- `frontend/src/pages/`, `services/`, `types/`: pantallas, API y tipos.
- `docs/prd/`, `docs/backlog/`, `docs/specs/`: cadena de especificación del producto.
- `DESIGN.md`: decisiones visuales de frontend; consúltalo antes de cambiar la interfaz.

## Comandos
- Backend: `cd backend`; `npm install`; `npm run dev`; `npm run build`.
- Frontend: `cd frontend`; `npm install`; `npm run dev`; `npm run build`; `npm run lint`.
- Ejecuta las pruebas automatizadas definidas por el paquete afectado antes de dar una tarea por terminada.
- Si todavía no hay pruebas para una regla nueva, añade las pruebas y el comando correspondiente antes o junto con su implementación.

## Convenciones y reglas
- Sigue la arquitectura por capas y los patrones existentes; mantén el resumen del Proyecto 3 compatible.
- Antes de implementar una funcionalidad, exige una spec en `docs/specs/` y verifica que exista una prueba para cada criterio comprobable.
- No leas, muestres, edites ni crees archivos `.env`. Usa únicamente nombres de variables y valores ficticios en `.env.example`.
- No añadas credenciales, secretos ni datos reales al código, documentación, pruebas o commits.
- Valida tipos y entradas; entrega errores mediante el `errorHandler` centralizado.
- Mantén la lógica de dominio pura y separada del acceso a la base de datos cuando corresponda.
- Conserva los cambios ajenos del usuario; no reviertas ni reformatees archivos sin relación con la tarea.
- Mantén cada fase trazable en Git y registra las specs antes de los cambios de código que describen.
- Comprueba el diff y ejecuta los tests y builds pertinentes antes de declarar una tarea terminada.
