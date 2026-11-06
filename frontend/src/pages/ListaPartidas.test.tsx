import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { partidasApi } from '../services/partidasApi';
import { IPartida } from '../types';
import { ListaPartidas } from './ListaPartidas';

vi.mock('../services/partidasApi', () => ({
  partidasApi: {
    obtenerTodas: vi.fn(),
    eliminar: vi.fn()
  }
}));

const partida: IPartida = {
  _id: 'partida-id',
  videojuego: {
    _id: 'juego-id',
    nombre: 'Juego de prueba',
    plataforma: 'PC',
    genero: 'rol',
    estado: 'jugando',
    logros: []
  },
  fecha: '2026-11-05T17:00:00.000Z',
  duracionMinutos: 60,
  porcentajeAvance: 25,
  notas: 'Nota'
};

const Ubicacion = () => <span data-testid="ubicacion">{useLocation().pathname}</span>;

const renderHistorial = () => render(
  <MemoryRouter initialEntries={['/partidas']}>
    <Routes>
      <Route path="/partidas" element={<ListaPartidas />} />
      <Route path="/videojuegos/:id" element={<Ubicacion />} />
      <Route path="/partidas/:id/editar" element={<Ubicacion />} />
    </Routes>
  </MemoryRouter>
);

describe('ListaPartidas acciones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(partidasApi.obtenerTodas).mockResolvedValue([partida]);
    vi.mocked(partidasApi.eliminar).mockResolvedValue();
  });

  it('ofrece editar una partida existente', async () => {
    renderHistorial();

    await userEvent.click(await screen.findByRole('link', { name: 'Editar partida' }));
    expect(await screen.findByTestId('ubicacion')).toHaveTextContent('/partidas/partida-id/editar');
  });

  it('cancela el borrado o confirma y vuelve al detalle del videojuego', async () => {
    const user = userEvent.setup();
    const confirmar = vi.spyOn(window, 'confirm')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    renderHistorial();

    await user.click(await screen.findByRole('button', { name: 'Eliminar partida' }));
    expect(confirmar).toHaveBeenCalledOnce();
    expect(partidasApi.eliminar).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Eliminar partida' }));
    await waitFor(() => expect(partidasApi.eliminar).toHaveBeenCalledWith('partida-id'));
    expect(await screen.findByTestId('ubicacion')).toHaveTextContent('/videojuegos/juego-id');
  });
});
