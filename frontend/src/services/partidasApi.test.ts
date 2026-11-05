import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { partidasApi } from './partidasApi';
import { IPartida } from '../types';

const partida: IPartida = {
  _id: 'partida-id',
  videojuego: 'juego-id',
  fecha: '2026-11-05T17:00:00.000Z',
  duracionMinutos: 60,
  porcentajeAvance: 25,
  notas: ''
};

describe('partidasApi edición', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('consulta por ID y actualiza usando PUT', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => partida } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => partida } as Response);

    await expect(partidasApi.obtenerPorId('partida-id')).resolves.toEqual(partida);
    await partidasApi.actualizar('partida-id', { duracionMinutos: 90 });

    expect(fetch).toHaveBeenNthCalledWith(1, expect.stringMatching(/\/partidas\/partida-id$/));
    expect(fetch).toHaveBeenNthCalledWith(2, expect.stringMatching(/\/partidas\/partida-id$/), expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ duracionMinutos: 90 })
    }));
  });

  it('propaga el mensaje del servidor al consultar o actualizar', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'Partida no encontrada' }) } as Response)
      .mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'Duración inválida' }) } as Response);

    await expect(partidasApi.obtenerPorId('partida-id')).rejects.toThrow('Partida no encontrada');
    await expect(partidasApi.actualizar('partida-id', { duracionMinutos: 0 })).rejects.toThrow('Duración inválida');
  });
});
