import { IHitoMeta, IMeta } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const obtenerMensajeError = async (res: Response, mensajePredeterminado: string): Promise<string> => {
  try {
    const error = await res.json() as { message?: string };
    return error.message || mensajePredeterminado;
  } catch {
    return mensajePredeterminado;
  }
};

export interface CrearMetaInput {
  videojuego: string;
  horasSemanales: number;
  diasPorSemana: number;
  hitos: IHitoMeta[];
}

export type ActualizarMetaInput = Pick<CrearMetaInput, 'horasSemanales' | 'diasPorSemana' | 'hitos'>;

export const metasApi = {
  obtenerPorId: async (id: string): Promise<IMeta> => {
    const res = await fetch(`${API_URL}/metas/${id}`);
    if (!res.ok) throw new Error(await obtenerMensajeError(res, 'Error al obtener la meta'));
    return res.json();
  },

  obtenerPorVideojuego: async (videojuegoId: string): Promise<IMeta[]> => {
    const res = await fetch(`${API_URL}/metas/videojuego/${videojuegoId}`);
    if (!res.ok) throw new Error(await obtenerMensajeError(res, 'Error al obtener las metas del videojuego'));
    return res.json();
  },

  crear: async (meta: CrearMetaInput): Promise<IMeta> => {
    const res = await fetch(`${API_URL}/metas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meta)
    });
    if (!res.ok) throw new Error(await obtenerMensajeError(res, 'Error al crear la meta'));
    return res.json();
  },

  actualizar: async (id: string, meta: ActualizarMetaInput): Promise<IMeta> => {
    const res = await fetch(`${API_URL}/metas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meta)
    });
    if (!res.ok) throw new Error(await obtenerMensajeError(res, 'Error al actualizar la meta'));
    return res.json();
  },

  desactivar: async (id: string): Promise<IMeta> => {
    const res = await fetch(`${API_URL}/metas/${id}/desactivar`, { method: 'PATCH' });
    if (!res.ok) throw new Error(await obtenerMensajeError(res, 'Error al desactivar la meta'));
    return res.json();
  }
};
