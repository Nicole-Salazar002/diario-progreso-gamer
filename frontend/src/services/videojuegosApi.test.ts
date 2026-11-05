import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { videojuegosApi } from './videojuegosApi';
import { IProgresoSemanal } from '../types';

const progreso: IProgresoSemanal = {
  semana: { inicio: '2026-11-02', fin: '2026-11-08' },
  meta: null,
  horasSemana: 0,
  porcentajeHoras: null,
  diasJugadosSemana: 0,
  rachaActual: 0,
  mejorRacha: 0,
  hitos: []
};

describe('videojuegosApi.obtenerProgresoSemanal', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('consulta el endpoint de progreso semanal y devuelve su respuesta', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => progreso
    } as Response);

    await expect(videojuegosApi.obtenerProgresoSemanal('juego-id')).resolves.toEqual(progreso);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/videojuegos\/juego-id\/progreso-semanal$/)
    );
  });

  it('propaga un error legible cuando falla la consulta semanal', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);

    await expect(videojuegosApi.obtenerProgresoSemanal('juego-id'))
      .rejects.toThrow('Error al obtener el progreso semanal del videojuego');
  });
});
