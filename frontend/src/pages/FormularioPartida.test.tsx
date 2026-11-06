import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { videojuegosApi } from '../services/videojuegosApi';
import { partidasApi } from '../services/partidasApi';
import { IPartida, IVideojuego } from '../types';
import { FormularioPartida } from './FormularioPartida';

vi.mock('../services/videojuegosApi', () => ({
  videojuegosApi: { obtenerTodos: vi.fn() }
}));

vi.mock('../services/partidasApi', () => ({
  partidasApi: {
    obtenerPorId: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn()
  }
}));

const juego: IVideojuego = {
  _id: 'juego-id',
  nombre: 'Juego de prueba',
  plataforma: 'PC',
  genero: 'rol',
  estado: 'jugando',
  logros: []
};
const partida: IPartida = {
  _id: 'partida-id',
  videojuego: 'juego-id',
  fecha: '2026-11-05T17:00:00.000Z',
  duracionMinutos: 60,
  porcentajeAvance: 25,
  notas: 'Nota inicial'
};

const Ubicacion = () => <span data-testid="ubicacion">{useLocation().pathname}</span>;

const renderFormulario = (ruta: string) => render(
  <MemoryRouter initialEntries={[ruta]}>
    <Routes>
      <Route path="/partidas/nueva" element={<FormularioPartida />} />
      <Route path="/partidas/:id/editar" element={<FormularioPartida />} />
      <Route path="/videojuegos/:id" element={<Ubicacion />} />
    </Routes>
  </MemoryRouter>
);

describe('FormularioPartida', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(videojuegosApi.obtenerTodos).mockResolvedValue([juego]);
    vi.mocked(partidasApi.crear).mockResolvedValue(partida);
    vi.mocked(partidasApi.actualizar).mockResolvedValue(partida);
  });

  it('carga una partida existente, edita y regresa al detalle sin crear otra', async () => {
    const user = userEvent.setup();
    vi.mocked(partidasApi.obtenerPorId).mockResolvedValue(partida);
    renderFormulario('/partidas/partida-id/editar');

    expect(await screen.findByRole('heading', { name: 'Editar sesión' })).toBeInTheDocument();
    expect(partidasApi.obtenerPorId).toHaveBeenCalledWith('partida-id');
    const duracion = await screen.findByLabelText(/Duración/);
    expect(duracion).toHaveValue(60);
    await user.clear(duracion);
    await user.type(duracion, '90');
    await user.click(screen.getByRole('button', { name: /Guardar cambios/ }));

    await waitFor(() => {
      expect(partidasApi.actualizar).toHaveBeenCalledWith('partida-id', expect.objectContaining({
        duracionMinutos: 90,
        porcentajeAvance: 25,
        notas: 'Nota inicial'
      }));
    });
    expect(partidasApi.crear).not.toHaveBeenCalled();
    expect(await screen.findByTestId('ubicacion')).toHaveTextContent('/videojuegos/juego-id');
  });

  it('muestra el error de una partida inexistente sin abrir un formulario vacío', async () => {
    vi.mocked(partidasApi.obtenerPorId).mockRejectedValue(new Error('Partida no encontrada'));
    renderFormulario('/partidas/partida-id/editar');

    expect(await screen.findByRole('alert')).toHaveTextContent('Partida no encontrada');
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).not.toBeInTheDocument();
  });

  it('muestra error del servidor al guardar y conserva los valores', async () => {
    const user = userEvent.setup();
    vi.mocked(partidasApi.obtenerPorId).mockResolvedValue(partida);
    vi.mocked(partidasApi.actualizar).mockRejectedValue(new Error('La duración no es válida'));
    renderFormulario('/partidas/partida-id/editar');

    const duracion = await screen.findByLabelText(/Duración/);
    await user.clear(duracion);
    await user.type(duracion, '45');
    await user.click(screen.getByRole('button', { name: /Guardar cambios/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('La duración no es válida');
    expect(duracion).toHaveValue(45);
  });
});
