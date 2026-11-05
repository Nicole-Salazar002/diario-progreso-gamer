import assert from 'node:assert/strict';
import test from 'node:test';
import { Types } from 'mongoose';
import { Meta } from './Meta';

const crearHitos = (cantidad: number) => Array.from({ length: cantidad }, (_, indice) => ({
  descripcion: `Hito ${indice + 1}`,
  porcentajeObjetivo: 25
}));

test('valida los rangos de horas, días y hitos de una Meta', () => {
  const meta = new Meta({
    videojuego: new Types.ObjectId(),
    horasSemanales: 0,
    diasPorSemana: 8,
    hitos: crearHitos(6)
  });

  const error = meta.validateSync();

  assert.ok(error);
  assert.ok(error.errors.horasSemanales);
  assert.ok(error.errors.diasPorSemana);
  assert.ok(error.errors.hitos);
});

test('limita el porcentaje objetivo de un hito al rango de 1 a 100', () => {
  const meta = new Meta({
    videojuego: new Types.ObjectId(),
    horasSemanales: 5,
    diasPorSemana: 4,
    hitos: [{ descripcion: 'Hito inválido', porcentajeObjetivo: 101 }]
  });

  const error = meta.validateSync();

  assert.ok(error);
  assert.ok(error.errors['hitos.0.porcentajeObjetivo']);
});

test('usa un índice único parcial para impedir más de una Meta activa por videojuego', () => {
  const activeIndex = Meta.schema.indexes().find(([, options]) =>
    options.unique === true && options.partialFilterExpression?.activa === true
  );

  assert.deepEqual(activeIndex?.[0], { videojuego: 1 });
});
