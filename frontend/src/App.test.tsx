import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { videojuegosApi } from './services/videojuegosApi';

vi.mock('./services/videojuegosApi', () => ({
  videojuegosApi: {
    obtenerTodos: vi.fn(),
    obtenerProgresoSemanal: vi.fn()
  }
}));

describe('App navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(videojuegosApi.obtenerTodos).mockResolvedValue([]);
  });

  it('opens the user progress view from the navigation', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('link', { name: 'Mi progreso' }));

    expect(await screen.findByRole('heading', { name: 'Mi progreso' })).toBeInTheDocument();
  });
});
