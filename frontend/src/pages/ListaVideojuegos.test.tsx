import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { videojuegosApi } from '../services/videojuegosApi';
import { ListaVideojuegos } from './ListaVideojuegos';

vi.mock('../services/videojuegosApi', () => ({
  videojuegosApi: {
    obtenerTodos: vi.fn(),
    eliminar: vi.fn()
  }
}));

const juego = {
  _id: 'juego-prueba-id',
  nombre: 'Juego de prueba',
  plataforma: 'PC' as const,
  genero: 'rol' as const,
  estado: 'jugando' as const,
  logros: []
};

const Ubicacion = () => {
  const { pathname } = useLocation();
  return <output aria-label="Ruta actual">{pathname}</output>;
};

const renderLista = () => render(
  <MemoryRouter initialEntries={['/']}>
    <ListaVideojuegos />
    <Ubicacion />
  </MemoryRouter>
);

describe('eliminación de videojuegos desde la biblioteca', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(videojuegosApi.obtenerTodos).mockResolvedValue([juego]);
    vi.mocked(videojuegosApi.eliminar).mockResolvedValue();
  });

  it('cancela el borrado sin llamar a la API', async () => {
    const user = userEvent.setup();
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderLista();

    await user.click(await screen.findByRole('button', { name: 'Eliminar Juego de prueba' }));

    expect(confirmar).toHaveBeenCalledWith(
      expect.stringContaining('partidas y metas asociadas')
    );
    expect(videojuegosApi.eliminar).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: /Juego de prueba/ })).toBeInTheDocument();
  });

  it('elimina el juego confirmado y actualiza la biblioteca sin navegar al detalle', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderLista();

    await user.click(await screen.findByRole('button', { name: 'Eliminar Juego de prueba' }));

    await waitFor(() => expect(videojuegosApi.eliminar).toHaveBeenCalledWith('juego-prueba-id'));
    expect(await screen.findByText('Tu biblioteca está esperando')).toBeInTheDocument();
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('/');
  });

  it('mantiene la tarjeta y muestra un error si falla la eliminación', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(videojuegosApi.eliminar).mockRejectedValue(new Error('No se pudo eliminar el videojuego.'));
    renderLista();

    await user.click(await screen.findByRole('button', { name: 'Eliminar Juego de prueba' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo eliminar el videojuego.');
    expect(screen.getByRole('link', { name: /Juego de prueba/ })).toBeInTheDocument();
  });
});
