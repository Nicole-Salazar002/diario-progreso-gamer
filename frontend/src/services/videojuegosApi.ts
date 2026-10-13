import { IVideojuego, IResumen } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const videojuegosApi = {
  obtenerTodos: async (estado?: string): Promise<IVideojuego[]> => {
    const url = estado ? `${API_URL}/videojuegos?estado=${estado}` : `${API_URL}/videojuegos`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener la lista de videojuegos');
    return res.json();
  },

  obtenerPorId: async (id: string): Promise<IVideojuego> => {
    const res = await fetch(`${API_URL}/videojuegos/${id}`);
    if (!res.ok) throw new Error('Error al obtener el videojuego');
    return res.json();
  },

  crear: async (juego: Partial<IVideojuego>): Promise<IVideojuego> => {
    const res = await fetch(`${API_URL}/videojuegos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(juego)
    });
    if (!res.ok) throw new Error('Error al crear el videojuego');
    return res.json();
  },

  actualizar: async (id: string, juego: Partial<IVideojuego>): Promise<IVideojuego> => {
    const res = await fetch(`${API_URL}/videojuegos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(juego)
    });
    if (!res.ok) throw new Error('Error al actualizar el videojuego');
    return res.json();
  },

  eliminar: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/videojuegos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar el videojuego');
  },

  actualizarLogro: async (juegoId: string, logroId: string, obtenido: boolean): Promise<IVideojuego> => {
    const res = await fetch(`${API_URL}/videojuegos/${juegoId}/logros/${logroId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ obtenido })
    });
    if (!res.ok) throw new Error('Error al actualizar el logro');
    return res.json();
  },

  obtenerResumen: async (id: string): Promise<IResumen> => {
    const res = await fetch(`${API_URL}/videojuegos/${id}/resumen`);
    if (!res.ok) throw new Error('Error al obtener el resumen del videojuego');
    return res.json();
  }
};