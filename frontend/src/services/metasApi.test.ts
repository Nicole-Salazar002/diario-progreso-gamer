import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActualizarMetaInput, CrearMetaInput, metasApi } from './metasApi';
import { IMeta } from '../types';

const videojuegoId = '507f1f77bcf86cd799439011';
const meta: IMeta = {
  _id: 'meta-id',
  videojuego: videojuegoId,
  horasSemanales: 5,
  diasPorSemana: 4,
  activa: true,
  hitos: []
};
const crearRespuesta = (body: unknown, ok = true) => ({
  ok,
  json: async () => body
}) as Response;

describe('metasApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('consulta una meta por videojuego', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(crearRespuesta([meta]));

    await expect(metasApi.obtenerPorVideojuego(videojuegoId)).resolves.toEqual([meta]);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/metas\/videojuego\/507f1f77bcf86cd799439011$/)
    );
  });

  it('envía creación y actualización con los métodos y cuerpos esperados', async () => {
    const crear: CrearMetaInput = {
      videojuego: videojuegoId,
      horasSemanales: 5,
      diasPorSemana: 4,
      hitos: []
    };
    const actualizar: ActualizarMetaInput = {
      horasSemanales: 8,
      diasPorSemana: 3,
      hitos: []
    };
    vi.mocked(fetch)
      .mockResolvedValueOnce(crearRespuesta(meta))
      .mockResolvedValueOnce(crearRespuesta({ ...meta, ...actualizar }));

    await metasApi.crear(crear);
    await metasApi.actualizar('meta-id', actualizar);

    expect(fetch).toHaveBeenNthCalledWith(1, expect.stringMatching(/\/metas$/), expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(crear)
    }));
    expect(fetch).toHaveBeenNthCalledWith(2, expect.stringMatching(/\/metas\/meta-id$/), expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify(actualizar)
    }));
  });

  it('desactiva una meta y muestra el mensaje del servidor cuando falla', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(crearRespuesta(meta))
      .mockResolvedValueOnce(crearRespuesta({ message: 'No se encontró la meta' }, false));

    await expect(metasApi.desactivar('meta-id')).resolves.toEqual(meta);
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/\/metas\/meta-id\/desactivar$/),
      { method: 'PATCH' }
    );
    await expect(metasApi.obtenerPorId('meta-id')).rejects.toThrow('No se encontró la meta');
  });
});
