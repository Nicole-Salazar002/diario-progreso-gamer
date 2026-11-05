import assert from 'node:assert/strict';
import test from 'node:test';
import { Meta } from '../models/Meta';
import { Partida } from '../models/Partida';
import { Videojuego } from '../models/Videojuego';
import { AppError } from '../middleware/errorHandler';
import * as servicio from './progreso.service';

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
const metaActiva = {
  horasSemanales: 5,
  diasPorSemana: 4,
  hitos: [{ descripcion: 'Llegar al 50 %', porcentajeObjetivo: 50 }]
};
const partidasConRachaRota = [
  { fecha: new Date('2026-11-07T17:00:00.000Z'), duracionMinutos: 120, porcentajeAvance: 60 },
  { fecha: new Date('2026-11-06T17:00:00.000Z'), duracionMinutos: 60, porcentajeAvance: 55 },
  { fecha: new Date('2026-11-04T17:00:00.000Z'), duracionMinutos: 90, porcentajeAvance: 45 },
  { fecha: new Date('2026-11-03T17:00:00.000Z'), duracionMinutos: 30, porcentajeAvance: 40 },
  { fecha: new Date('2026-11-02T17:00:00.000Z'), duracionMinutos: 30, porcentajeAvance: 35 }
];

test('integra meta activa, cinco partidas, avance actual y racha rota', async () => {
  const consultaPartidas = { sort: async () => partidasConRachaRota };
  await conReemplazos([
    { objetivo: Videojuego, propiedad: 'findById', valor: async () => ({ _id: videojuegoId }) },
    { objetivo: Partida, propiedad: 'find', valor: () => consultaPartidas },
    { objetivo: Meta, propiedad: 'findOne', valor: async () => metaActiva }
  ], async () => {
    const progreso = await servicio.obtenerProgresoSemanal(
      videojuegoId,
      new Date('2026-11-08T17:00:00.000Z')
    );

    assert.deepEqual(progreso, {
      semana: { inicio: '2026-11-02', fin: '2026-11-08' },
      meta: { horasSemanales: 5, diasPorSemana: 4 },
      horasSemana: 5.5,
      porcentajeHoras: 110,
      diasJugadosSemana: 5,
      rachaActual: 2,
      mejorRacha: 3,
      hitos: [{ descripcion: 'Llegar al 50 %', porcentajeObjetivo: 50, alcanzado: true }]
    });
  });
});

test('sin meta activa ni partidas devuelve el contrato vacío', async () => {
  const consultaPartidas = { sort: async () => [] };
  await conReemplazos([
    { objetivo: Videojuego, propiedad: 'findById', valor: async () => ({ _id: videojuegoId }) },
    { objetivo: Partida, propiedad: 'find', valor: () => consultaPartidas },
    { objetivo: Meta, propiedad: 'findOne', valor: async () => null }
  ], async () => {
    assert.deepEqual(await servicio.obtenerProgresoSemanal(
      videojuegoId,
      new Date('2026-11-08T17:00:00.000Z')
    ), {
      semana: { inicio: '2026-11-02', fin: '2026-11-08' },
      meta: null,
      horasSemana: 0,
      porcentajeHoras: null,
      diasJugadosSemana: 0,
      rachaActual: 0,
      mejorRacha: 0,
      hitos: []
    });
  });
});

test('devuelve 404 para un videojuego inexistente', async () => {
  await conReemplazos([
    { objetivo: Videojuego, propiedad: 'findById', valor: async () => null }
  ], async () => {
    await assert.rejects(servicio.obtenerProgresoSemanal(videojuegoId), (error: unknown) =>
      error instanceof AppError && error.statusCode === 404
    );
  });
});

test('propaga el error de ID mal formado para que el middleware responda 400', async () => {
  const castError = Object.assign(new Error('Invalid ObjectId'), {
    name: 'CastError',
    value: 'id-invalido'
  });
  await conReemplazos([
    { objetivo: Videojuego, propiedad: 'findById', valor: async () => { throw castError; } }
  ], async () => {
    await assert.rejects(servicio.obtenerProgresoSemanal('id-invalido'), error => error === castError);
  });
});
