import assert from 'node:assert/strict';
import test from 'node:test';
import { calcularProgresoSemanal, obtenerSemanaEcuador } from './progreso';

const crearPartida = (fecha: string, duracionMinutos: number) => ({
  fecha: new Date(fecha),
  duracionMinutos
});

const meta = {
  horasSemanales: 2.5,
  diasPorSemana: 4,
  hitos: [
    { descripcion: 'Llegar al 25 %', porcentajeObjetivo: 25 },
    { descripcion: 'Llegar al 50 %', porcentajeObjetivo: 50 },
    { descripcion: 'Terminar el juego', porcentajeObjetivo: 100 }
  ]
};

test('obtiene la semana de Ecuador en los límites del lunes y domingo', () => {
  assert.deepEqual(obtenerSemanaEcuador(new Date('2026-11-09T04:59:59.999Z')), {
    inicio: '2026-11-02',
    fin: '2026-11-08'
  });
  assert.deepEqual(obtenerSemanaEcuador(new Date('2026-11-09T05:00:00.000Z')), {
    inicio: '2026-11-09',
    fin: '2026-11-15'
  });
});

test('obtiene correctamente una semana que cruza el cambio de año', () => {
  assert.deepEqual(obtenerSemanaEcuador(new Date('2027-01-01T12:00:00.000Z')), {
    inicio: '2026-12-28',
    fin: '2027-01-03'
  });
});

test('suma y redondea horas antes de calcular un porcentaje que puede superar 100', () => {
  const progreso = calcularProgresoSemanal(
    [crearPartida('2026-11-02T17:00:00.000Z', 120), crearPartida('2026-11-03T17:00:00.000Z', 90)],
    meta,
    50,
    new Date('2026-11-04T17:00:00.000Z')
  );

  assert.equal(progreso.horasSemana, 3.5);
  assert.equal(progreso.porcentajeHoras, 140);
});

test('cuenta una sola vez cada día local, aunque haya varias partidas', () => {
  const progreso = calcularProgresoSemanal(
    [
      crearPartida('2026-11-03T04:30:00.000Z', 20),
      crearPartida('2026-11-03T04:50:00.000Z', 20),
      crearPartida('2026-11-03T05:10:00.000Z', 20)
    ],
    meta,
    25,
    new Date('2026-11-04T17:00:00.000Z')
  );

  assert.equal(progreso.diasJugadosSemana, 2);
});

test('asigna toda la duración al día local en que empezó una partida que cruza medianoche', () => {
  const progreso = calcularProgresoSemanal(
    [
      crearPartida('2026-11-03T04:59:00.000Z', 120),
      crearPartida('2026-11-03T05:00:00.000Z', 60)
    ],
    meta,
    25,
    new Date('2026-11-04T17:00:00.000Z')
  );

  assert.equal(progreso.horasSemana, 3);
  assert.equal(progreso.diasJugadosSemana, 2);
});

test('mantiene viva la racha de ayer sin contar hoy como día jugado', () => {
  const progreso = calcularProgresoSemanal(
    [
      crearPartida('2026-11-02T17:00:00.000Z', 30),
      crearPartida('2026-11-03T17:00:00.000Z', 30),
      crearPartida('2026-11-04T17:00:00.000Z', 30)
    ],
    meta,
    25,
    new Date('2026-11-05T17:00:00.000Z')
  );

  assert.equal(progreso.rachaActual, 3);
});

test('rompe la racha actual después de más de un día sin jugar', () => {
  const progreso = calcularProgresoSemanal(
    [
      crearPartida('2026-11-01T17:00:00.000Z', 30),
      crearPartida('2026-11-02T17:00:00.000Z', 30),
      crearPartida('2026-11-03T17:00:00.000Z', 30)
    ],
    meta,
    25,
    new Date('2026-11-05T17:00:00.000Z')
  );

  assert.equal(progreso.rachaActual, 0);
  assert.equal(progreso.mejorRacha, 3);
});

test('calcula la racha actual hasta hoy cuando sí se jugó hoy', () => {
  const progreso = calcularProgresoSemanal(
    [
      crearPartida('2026-11-03T17:00:00.000Z', 30),
      crearPartida('2026-11-04T17:00:00.000Z', 30),
      crearPartida('2026-11-05T17:00:00.000Z', 30)
    ],
    meta,
    25,
    new Date('2026-11-05T18:00:00.000Z')
  );

  assert.equal(progreso.rachaActual, 3);
});

test('calcula hitos desde el avance actual y no los conserva si este disminuye', () => {
  const alcanzados = calcularProgresoSemanal(
    [crearPartida('2026-11-02T17:00:00.000Z', 30)],
    meta,
    50,
    new Date('2026-11-03T17:00:00.000Z')
  );
  const pendientesTrasDescenso = calcularProgresoSemanal(
    [crearPartida('2026-11-02T17:00:00.000Z', 30)],
    meta,
    40,
    new Date('2026-11-03T17:00:00.000Z')
  );

  assert.deepEqual(alcanzados.hitos.map(hito => hito.alcanzado), [true, true, false]);
  assert.deepEqual(pendientesTrasDescenso.hitos.map(hito => hito.alcanzado), [true, false, false]);
});

test('sin meta activa devuelve null para meta y porcentaje y no incluye hitos', () => {
  const progreso = calcularProgresoSemanal(
    [crearPartida('2026-11-02T17:00:00.000Z', 60)],
    null,
    25,
    new Date('2026-11-03T17:00:00.000Z')
  );

  assert.equal(progreso.meta, null);
  assert.equal(progreso.porcentajeHoras, null);
  assert.deepEqual(progreso.hitos, []);
  assert.equal(progreso.horasSemana, 1);
  assert.equal(progreso.diasJugadosSemana, 1);
});

test('sin partidas devuelve ceros y todos los hitos pendientes', () => {
  const progreso = calcularProgresoSemanal(
    [],
    meta,
    0,
    new Date('2026-11-03T17:00:00.000Z')
  );

  assert.equal(progreso.horasSemana, 0);
  assert.equal(progreso.diasJugadosSemana, 0);
  assert.equal(progreso.rachaActual, 0);
  assert.equal(progreso.mejorRacha, 0);
  assert.deepEqual(progreso.hitos.map(hito => hito.alcanzado), [false, false, false]);
});
