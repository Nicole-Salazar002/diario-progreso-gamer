# Bitácora de trabajo con el agente

Esta bitácora resume decisiones y correcciones observables en los documentos, pruebas, historial Git y revisión de la aplicación. No sustituye a la auditoría técnica ni afirma verificaciones manuales que no se hayan ejecutado.

## Momentos clave

1. **Diagnóstico del Proyecto 3.** Se pidió identificar qué existía antes de E2. El diagnóstico registró el estado de modelos, rutas, resumen y pruebas, y distinguió los bloqueos de la deuda técnica. También dejó constancia de que la copia local no conservaba los commits históricos del Proyecto 3.
2. **Preparación del harness.** Se añadieron `AGENTS.md`, `CLAUDE.md`, `DESIGN.md`, una skill de proyecto y un hook para proteger los archivos `.env`. Se comprobó que `.env` no se incluyera en Git.
3. **Descubrimiento y documentación del producto.** La ficha se convirtió en reglas del PRD y criterios del backlog. Se resolvieron la zona horaria, racha de hoy, sesiones que cruzan medianoche, porcentaje superior a 100 %, hitos derivados y ciclo de vida de metas; quedaron explícitos los temas mensuales y fechas futuras.
4. **Pruebas antes del cálculo de dominio.** Se añadieron pruebas puras para límites semanales, días distintos, rachas, hitos y ausencia de sesiones antes de implementar el cálculo de progreso. Las pruebas no requieren MongoDB.
5. **Pago de deuda del backend.** El manejo centralizado de errores se ajustó para diferenciar 400, 404, 409 y 500, con pruebas. También se implementó el ciclo de vida de metas al completar, abandonar o eliminar un videojuego; la verificación automatizada usa dobles, por lo que la transacción real en Atlas quedó anotada como pendiente.
6. **Experiencia frontend y verificación.** Se añadieron el servicio y formulario de metas, el progreso semanal en el detalle y la edición/eliminación de partidas. Las pruebas de componentes simulan respuestas; la revisión visual compartida confirmó una pantalla de detalle de escritorio, no móvil ni teclado.
7. **Desviación y corrección durante la integración Git.** Se recomendó integrar historiales sin anticipar suficientemente que ambos repositorios tenían archivos con el mismo nombre pero raíces distintas. La fusión produjo conflictos `add/add`. Se detuvo antes de completar la fusión, se revisaron las versiones y se conservaron los cambios recientes de E2; después el PR #1 se integró. La lección fue revisar el estado y comparar los lados antes de resolver conflictos.
8. **Configuración local y conexión.** El backend requería `MONGO_URI`, mientras el archivo local usaba otro nombre de variable. Se diagnosticó comparando el nombre requerido por el código, sin abrir ni copiar el valor privado; luego se corrigió la conexión que causaba `Failed to fetch`.
9. **Cierre de evidencias automatizadas.** Se agregaron la vista `/progreso`, controles numéricos reutilizables y sus pruebas/specs; se configuró ESLint y se corrigieron los hallazgos de tipos y dependencias de efectos. La validación final pasó: 37 pruebas frontend, lint, build frontend, 52 pruebas backend y build backend. Atlas/Render con datos de prueba, revisión manual de teclado/móvil y grabación de demo siguen explícitamente pendientes.

## Evidencia relacionada

- [Diagnóstico](./diagnostico.md)
- [PRD](./prd/PRD.md)
- [Backlog E2](./backlog/E2-metas-y-rachas.md)
- [Spec backend](./specs/backend-meta-progreso.md)
- [Spec frontend](./specs/frontend-meta-progreso.md)
- [Auditoría](./AUDITORIA.md)
- [Pull Request #1](https://github.com/Nicole-Salazar002/diario-progreso-gamer/pull/1)
