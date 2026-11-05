import assert from 'node:assert/strict';
import test from 'node:test';
import { Partida } from '../models/Partida';
import { AppError } from '../middleware/errorHandler';
import * as servicio from './partidas.service';

interface Reemplazo {
  objetivo: object;
  propiedad: string;
  valor: (...argumentos: unknown[]) => unknown;
}

const conReemplazos = async <T>(reemplazos: Reemplazo[], ejecutar: () => Promise<T>): Promise<T> => {
  const originales = reemplazos.map(({ objetivo, propiedad }) => ({
    objetivo,
    propiedad,
    descriptor: Object.getOwnPropertyDescriptor(objetivo, propiedad)
  }));

  for (const { objetivo, propiedad, valor } of reemplazos) {
    Object.defineProperty(objetivo, propiedad, {
      configurable: true,
      writable: true,
      value: valor
    });
  }

  try {
    return await ejecutar();
  } finally {
    for (const { objetivo, propiedad, descriptor } of originales.reverse()) {
      if (descriptor) {
        Object.defineProperty(objetivo, propiedad, descriptor);
      } else {
        Reflect.deleteProperty(objetivo, propiedad);
      }
    }
  }
};

const entradaEdicion = {
  fecha: new Date('2026-11-05T17:00:00.000Z'),
  duracionMinutos: 90,
  porcentajeAvance: 50,
  notas: 'Sesión corregida'
};

test('consulta una partida por ID', async () => {
  const partida = { _id: 'partida-id', videojuego: 'juego-id' };
  await conReemplazos([
    { objetivo: Partida, propiedad: 'findById', valor: async () => partida }
  ], async () => {
    assert.equal(await servicio.obtenerPartidaPorId('partida-id'), partida);
  });
});

test('devuelve 404 al consultar una partida inexistente', async () => {
  await conReemplazos([
    { objetivo: Partida, propiedad: 'findById', valor: async () => null }
  ], async () => {
    await assert.rejects(servicio.obtenerPartidaPorId('partida-id'), (error: unknown) =>
      error instanceof AppError && error.statusCode === 404
    );
  });
});

test('actualiza la partida existente sin cambiar su videojuego', async () => {
  const actualizada = { _id: 'partida-id', videojuego: 'juego-original', ...entradaEdicion };
  let argumentosActualizacion: unknown[] = [];
  await conReemplazos([
    {
      objetivo: Partida,
      propiedad: 'findByIdAndUpdate',
      valor: async (...argumentos: unknown[]) => {
        argumentosActualizacion = argumentos;
        return actualizada;
      }
    }
  ], async () => {
    assert.equal(
      await servicio.actualizarPartida('partida-id', entradaEdicion),
      actualizada
    );
  });

  assert.equal(argumentosActualizacion[0], 'partida-id');
  assert.deepEqual(argumentosActualizacion[1], entradaEdicion);
  assert.deepEqual(argumentosActualizacion[2], { new: true, runValidators: true });
});

test('devuelve 404 al actualizar una partida inexistente', async () => {
  await conReemplazos([
    { objetivo: Partida, propiedad: 'findByIdAndUpdate', valor: async () => null }
  ], async () => {
    await assert.rejects(servicio.actualizarPartida('partida-id', entradaEdicion), (error: unknown) =>
      error instanceof AppError && error.statusCode === 404
    );
  });
});

test('rechaza una edición sin campos editables', async () => {
  await assert.rejects(servicio.actualizarPartida('partida-id', {}), (error: unknown) =>
    error instanceof AppError && error.statusCode === 400
  );
});

test('rechaza propiedades no editables en lugar de modificar la referencia', async () => {
  await assert.rejects(
    servicio.actualizarPartida('partida-id', { ...entradaEdicion, videojuego: 'otro-juego' }),
    (error: unknown) => error instanceof AppError && error.statusCode === 400
  );
});

test('propaga errores de validación del modelo para que el middleware responda 400', async () => {
  const errorValidacion = Object.assign(new Error('duracionMinutos debe ser al menos 1'), {
    name: 'ValidationError',
    errors: {}
  });
  await conReemplazos([
    {
      objetivo: Partida,
      propiedad: 'findByIdAndUpdate',
      valor: async () => { throw errorValidacion; }
    }
  ], async () => {
    await assert.rejects(
      servicio.actualizarPartida('partida-id', { duracionMinutos: 0 }),
      error => error === errorValidacion
    );
  });
});
