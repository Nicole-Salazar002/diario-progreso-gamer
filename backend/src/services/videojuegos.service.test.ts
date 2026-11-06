import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import { Meta } from '../models/Meta';
import { Partida } from '../models/Partida';
import { Videojuego } from '../models/Videojuego';
import { AppError } from '../middleware/errorHandler';
import * as servicio from './videojuegos.service';

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

const videojuegoId = '507f1f77bcf86cd799439011';

const crearSesionFalsa = () => ({
  withTransaction: async (operacion: () => Promise<unknown>) => operacion(),
  endSession: async () => undefined
});

for (const estado of ['completado', 'abandonado'] as const) {
  test(`desactiva la meta activa cuando el videojuego cambia a ${estado}`, async () => {
    const operaciones: string[] = [];
    const actualizado = { _id: videojuegoId, estado };
    const sesion = crearSesionFalsa();
    await conReemplazos([
      {
        objetivo: mongoose,
        propiedad: 'startSession',
        valor: async () => sesion
      },
      {
        objetivo: Videojuego,
        propiedad: 'findByIdAndUpdate',
        valor: async (_id: unknown, _datos: unknown, opciones: unknown) => {
          operaciones.push('actualizar-videojuego');
          assert.deepEqual(opciones, { new: true, runValidators: true, session: sesion });
          return actualizado;
        }
      },
      {
        objetivo: Meta,
        propiedad: 'updateMany',
        valor: async (...argumentos: unknown[]) => {
          operaciones.push('desactivar-metas');
          assert.deepEqual(argumentos.slice(0, 2), [
            { videojuego: videojuegoId, activa: true },
            { $set: { activa: false } }
          ]);
          assert.deepEqual(argumentos[2], { session: sesion });
        }
      }
    ], async () => {
      assert.equal(await servicio.actualizarVideojuego(videojuegoId, { estado }), actualizado);
    });

    assert.deepEqual(operaciones, ['actualizar-videojuego', 'desactivar-metas']);
  });
}

test('no reactiva ni altera metas al cambiar el videojuego a un estado normal', async () => {
  const actualizado = { _id: videojuegoId, estado: 'jugando' };
  await conReemplazos([
    {
      objetivo: Videojuego,
      propiedad: 'findByIdAndUpdate',
      valor: async () => actualizado
    },
    {
      objetivo: Meta,
      propiedad: 'updateMany',
      valor: async () => {
        assert.fail('No se deben reactivar ni modificar metas');
      }
    }
  ], async () => {
    assert.equal(
      await servicio.actualizarVideojuego(videojuegoId, { estado: 'jugando' }),
      actualizado
    );
  });
});

test('no desactiva metas si el videojuego no existe', async () => {
  const sesion = crearSesionFalsa();
  await conReemplazos([
    { objetivo: mongoose, propiedad: 'startSession', valor: async () => sesion },
    {
      objetivo: Videojuego,
      propiedad: 'findByIdAndUpdate',
      valor: async () => null
    },
    {
      objetivo: Meta,
      propiedad: 'updateMany',
      valor: async () => {
        assert.fail('No se deben modificar metas sin videojuego');
      }
    }
  ], async () => {
    await assert.rejects(
      servicio.actualizarVideojuego(videojuegoId, { estado: 'completado' }),
      (error: unknown) => error instanceof AppError && error.statusCode === 404
    );
  });
});

test('elimina metas y partidas antes del videojuego', async () => {
  const orden: string[] = [];
  const juego = { _id: videojuegoId };
  const sesion = crearSesionFalsa();
  await conReemplazos([
    { objetivo: mongoose, propiedad: 'startSession', valor: async () => sesion },
    {
      objetivo: Meta,
      propiedad: 'deleteMany',
      valor: async (filtro: unknown, opciones: unknown) => {
        orden.push('metas');
        assert.deepEqual(filtro, { videojuego: videojuegoId });
        assert.deepEqual(opciones, { session: sesion });
      }
    },
    {
      objetivo: Partida,
      propiedad: 'deleteMany',
      valor: async (filtro: unknown, opciones: unknown) => {
        orden.push('partidas');
        assert.deepEqual(filtro, { videojuego: videojuegoId });
        assert.deepEqual(opciones, { session: sesion });
      }
    },
    {
      objetivo: Videojuego,
      propiedad: 'findByIdAndDelete',
      valor: async (id: unknown, opciones: unknown) => {
        orden.push('videojuego');
        assert.equal(id, videojuegoId);
        assert.deepEqual(opciones, { session: sesion });
        return juego;
      }
    }
  ], async () => {
    assert.equal(await servicio.eliminarVideojuego(videojuegoId), juego);
  });

  assert.deepEqual(orden, ['metas', 'partidas', 'videojuego']);
});

test('revierte la limpieza relacionada si el videojuego no existe', async () => {
  const sesion = crearSesionFalsa();
  const orden: string[] = [];
  await conReemplazos([
    { objetivo: mongoose, propiedad: 'startSession', valor: async () => sesion },
    {
      objetivo: Meta,
      propiedad: 'deleteMany',
      valor: async () => {
        orden.push('metas');
      }
    },
    {
      objetivo: Partida,
      propiedad: 'deleteMany',
      valor: async () => {
        orden.push('partidas');
      }
    },
    {
      objetivo: Videojuego,
      propiedad: 'findByIdAndDelete',
      valor: async () => {
        orden.push('videojuego');
        return null;
      }
    }
  ], async () => {
    await assert.rejects(
      servicio.eliminarVideojuego(videojuegoId),
      (error: unknown) => error instanceof AppError && error.statusCode === 404
    );
  });
  assert.deepEqual(orden, ['metas', 'partidas', 'videojuego']);
});

test('propaga errores de limpieza y no intenta borrar el videojuego', async () => {
  const errorLimpieza = new Error('No se pudo eliminar las partidas');
  let videojuegoEliminado = false;
  const sesion = crearSesionFalsa();
  await conReemplazos([
    { objetivo: mongoose, propiedad: 'startSession', valor: async () => sesion },
    { objetivo: Meta, propiedad: 'deleteMany', valor: async () => undefined },
    {
      objetivo: Partida,
      propiedad: 'deleteMany',
      valor: async () => { throw errorLimpieza; }
    },
    {
      objetivo: Videojuego,
      propiedad: 'findByIdAndDelete',
      valor: async () => {
        videojuegoEliminado = true;
        return null;
      }
    }
  ], async () => {
    await assert.rejects(
      servicio.eliminarVideojuego(videojuegoId),
      error => error === errorLimpieza
    );
  });

  assert.equal(videojuegoEliminado, false);
});
