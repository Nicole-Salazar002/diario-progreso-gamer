import { IPartida } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const partidasApi = {
  obtenerTodas: async (): Promise<IPartida[]> => {
    const res = await fetch(`${API_URL}/partidas`);
    if (!res.ok) throw new Error('Error al cargar las partidas');
    return res.json();
  },

  obtenerPorVideojuego: async (videojuegoId: string): Promise<IPartida[]> => {
    const res = await fetch(`${API_URL}/videojuegos/${videojuegoId}/partidas`);
    if (!res.ok) throw new Error('Error al cargar partidas del videojuego');
    return res.json();
  },

  crear: async (partida: Partial<IPartida>): Promise<IPartida> => {
    const res = await fetch(`${API_URL}/partidas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partida)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al registrar la partida');
    }
    return res.json();
  },

  eliminar: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/partidas/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar la partida');
  }
};