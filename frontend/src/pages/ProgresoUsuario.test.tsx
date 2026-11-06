import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { videojuegosApi } from '../services/videojuegosApi';
import { ProgresoUsuario } from './ProgresoUsuario';

vi.mock('../services/videojuegosApi', () => ({
  videojuegosApi: { obtenerTodos: vi.fn(), obtenerProgresoSemanal: vi.fn() }
}));

const juego = {
  _id: 'juego-1', nombre: 'Aventura Lunar', plataforma: 'PC' as const,
  genero: 'rol' as const, estado: 'jugando' as const, logros: []
};
const progreso = {
  semana: { inicio: '2026-11-02', fin: '2026-11-08' },
  meta: null, horasSemana: 4.5, porcentajeHoras: null, diasJugadosSemana: 3,
  rachaActual: 2, mejorRacha: 6, hitos: []
};

const renderPage = () => render(<MemoryRouter><ProgresoUsuario /></MemoryRouter>);

describe('ProgresoUsuario', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra el progreso semanal por juego y enlaza al detalle', async () => {
    vi.mocked(videojuegosApi.obtenerTodos).mockResolvedValue([juego]);
    vi.mocked(videojuegosApi.obtenerProgresoSemanal).mockResolvedValue(progreso);
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Mi progreso' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Aventura Lunar' })).toBeInTheDocument();
    expect(screen.getByText(/4\.5/)).toBeInTheDocument();
    expect(screen.getByText('Mejor: 6 días')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver progreso del juego/ })).toHaveAttribute('href', '/videojuegos/juego-1');
    expect(videojuegosApi.obtenerProgresoSemanal).toHaveBeenCalledWith('juego-1');
  });

  it('presenta un estado de carga distinto mientras espera los datos', () => {
    const pendiente = new Promise<Awaited<ReturnType<typeof videojuegosApi.obtenerTodos>>>(() => {});
    vi.mocked(videojuegosApi.obtenerTodos).mockReturnValue(pendiente);
    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent('Cargando tu progreso');
  });

  it('permite reintentar cuando falla la carga', async () => {
    const user = userEvent.setup();
    vi.mocked(videojuegosApi.obtenerTodos)
      .mockRejectedValueOnce(new Error('No hay conexión'))
      .mockResolvedValueOnce([juego]);
    vi.mocked(videojuegosApi.obtenerProgresoSemanal).mockResolvedValue(progreso);
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('No hay conexión');
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('heading', { name: 'Aventura Lunar' })).toBeInTheDocument();
  });

  it('ofrece añadir un juego cuando la biblioteca está vacía', async () => {
    vi.mocked(videojuegosApi.obtenerTodos).mockResolvedValue([]);
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Aún no tienes videojuegos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Añadir videojuego' })).toHaveAttribute('href', '/videojuegos/nuevo');
    await waitFor(() => expect(videojuegosApi.obtenerProgresoSemanal).not.toHaveBeenCalled());
  });
});
