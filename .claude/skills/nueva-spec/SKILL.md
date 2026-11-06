---
name: nueva-spec
description: 'Crea o revisa una spec de este proyecto antes de implementar funcionalidad. Úsala cuando se solicite preparar una spec de backend o frontend a partir del PRD, historias y tickets de E2.'
argument-hint: '[backend|frontend] [ticket o funcionalidad]'
user-invocable: true
disable-model-invocation: true
---

# Crear una spec

## Propósito

Preparar un contrato verificable de producto y comportamiento antes de escribir código. Esta skill modifica documentación del repositorio y solo se ejecuta por invocación explícita.

## Procedimiento

1. Lee `docs/prd/`, `docs/backlog/epicas.md` y `docs/backlog/E2-metas-y-rachas.md`. No leas archivos `.env`.
2. Identifica el tipo de spec solicitado (backend o frontend), los tickets relacionados, sus dependencias y los criterios de aceptación ya acordados.
3. Si falta una decisión de producto, no la inventes: enumera el hueco y pide una decisión antes de cerrar la spec.
4. Crea o actualiza el archivo correspondiente dentro de `docs/specs/`. Aún no implementes código ni pruebas.
5. Incluye propósito y alcance, requisitos `DEBE` y `NO DEBE`, reglas de negocio, comportamiento de error/estados aplicable y una tabla criterio → verificación.
6. Incluye una tabla ticket → archivos previstos. Los archivos deben corresponder a la estructura real del repositorio; distingue cambios de código y pruebas.
7. Comprueba que cada criterio tenga una verificación concreta y que las reglas vengan de una fuente acordada. Marca los puntos abiertos explícitamente.
8. Revisa el diff y resume la spec, las verificaciones y los puntos que requieren decisión. No hagas commit salvo que el usuario lo solicite.

## Reglas

- La spec es el contrato: no rebajes ni agregues alcance para que coincida con una implementación existente.
- Los criterios describen resultados observables; evita prescribir detalles internos que no sean necesarios.
- Las funciones puras de dominio deben tener verificaciones automatizadas sin base de datos cuando aplique.
- No marques una spec como verificada por una compilación si requiere pruebas de comportamiento.
