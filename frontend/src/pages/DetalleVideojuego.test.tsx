import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { videojuegosApi } from '../services/videojuegosApi';
import { partidasApi } from '../services/partidasApi';
import { metasApi } from '../services/metasApi';
import { DetalleVideojuego } from './DetalleVideojuego';

vi.mock('../services/videojuegosApi', () => ({
  videojuegosApi: {
    obtenerPorId: vi.fn(),
    obtenerResumen: vi.fn(),
    actualizarLogro: vi.fn()
  }
}));

vi.mock('../services/partidasApi', () => ({
  partidasApi: {
    obtenerPorVideojuego: vi.fn()
  }
}));

vi.mock('../services/metasApi', () => ({
  metasApi: {
    obtenerPorVideojuego: vi.fn(),
    desactivar: vi.fn()
  }
}));

const juego = {
  _id: 'juego-id',
  nombre: 'Juego de prueba',
  plataforma: 'PC' as const,
  genero: 'rol' as const,
  estado: 'jugando' as const,
  logros: []
};
const meta = {
  _id: 'meta-id',
  videojuego: 'juego-id',
  horasSemanales: 5,
  diasPorSemana: 4,
  activa: true,
  hitos: []
};

const renderDetalle = () => render(
  <MemoryRouter
    initialEntries={['/videojuegos/juego-id']}
    future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
  >
    <Routes>
      <Route path="/videojuegos/:id" element={<DetalleVideojuego />} />
    </Routes>
  </MemoryRouter>
);

describe('gestión de meta en el detalle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(videojuegosApi.obtenerPorId).mockResolvedValue(juego);
    vi.mocked(videojuegosApi.obtenerResumen).mockResolvedValue({
      totalPartidas: 0,
      horasTotales: 0,
      ultimaPartida: null,
      porcentajeAvanceActual: 0
    });
    vi.mocked(partidasApi.obtenerPorVideojuego).mockResolvedValue([]);
    vi.mocked(metasApi.obtenerPorVideojuego).mockResolvedValue([meta]);
    vi.mocked(metasApi.desactivar).mockResolvedValue(meta);
  });

  it('no desactiva si se cancela la confirmación y actualiza la lista si se confirma', async () => {
    const user = userEvent.setup();
    const confirmar = vi.spyOn(window, 'confirm')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    vi.mocked(metasApi.obtenerPorVideojuego)
      .mockResolvedValueOnce([meta])
      .mockResolvedValueOnce([]);
    renderDetalle();

    await screen.findByText('5 horas');
    await user.click(screen.getByRole('button', { name: 'Desactivar' }));
    expect(confirmar).toHaveBeenCalledOnce();
    expect(metasApi.desactivar).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Desactivar' }));
    await waitFor(() => expect(metasApi.desactivar).toHaveBeenCalledWith('meta-id'));
    expect(await screen.findByText('Aún no tienes una meta activa para este juego.')).toBeInTheDocument();
    expect(metasApi.obtenerPorVideojuego).toHaveBeenCalledTimes(2);
  });

  it('no ofrece crear una meta activa para un videojuego completado', async () => {
    vi.mocked(videojuegosApi.obtenerPorId).mockResolvedValue({
      ...juego,
      estado: 'completado'
    });
    vi.mocked(metasApi.obtenerPorVideojuego).mockResolvedValue([]);
    renderDetalle();

    expect(await screen.findByText(
      'No se puede crear una meta activa para un juego completado o abandonado.'
    )).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Crear meta' })).not.toBeInTheDocument();
  });
});
