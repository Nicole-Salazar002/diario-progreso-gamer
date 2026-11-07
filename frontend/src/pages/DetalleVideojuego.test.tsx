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
    obtenerProgresoSemanal: vi.fn(),
    actualizarLogro: vi.fn()
  }
}));

vi.mock('../services/partidasApi', () => ({
  partidasApi: {
    obtenerPorVideojuego: vi.fn(),
    eliminar: vi.fn()
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
const progreso = {
  semana: { inicio: '2026-11-02', fin: '2026-11-08' },
  meta: { horasSemanales: 5, diasPorSemana: 4 },
  horasSemana: 3.5,
  porcentajeHoras: 70,
  diasJugadosSemana: 3,
  rachaActual: 2,
  mejorRacha: 4,
  hitos: [{ descripcion: 'Llegar al 50 %', porcentajeObjetivo: 50, alcanzado: true }]
};
const partida = {
  _id: 'partida-id',
  videojuego: 'juego-id',
  fecha: '2026-11-05T17:00:00.000Z',
  duracionMinutos: 60,
  porcentajeAvance: 25,
  notas: 'Sesión de prueba'
};

const renderDetalle = () => render(
  <MemoryRouter
    initialEntries={['/videojuegos/juego-id']}
    future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
  >
    <Routes>
      <Route path="/videojuegos/:id" element={<DetalleVideojuego />} />
      <Route path="/partidas/:id/editar" element={<div>Edición de partida</div>} />
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

    vi.mocked(videojuegosApi.obtenerProgresoSemanal).mockResolvedValue(progreso);
    vi.mocked(partidasApi.obtenerPorVideojuego).mockResolvedValue([]);
    vi.mocked(partidasApi.eliminar).mockResolvedValue();
    vi.mocked(metasApi.obtenerPorVideojuego).mockResolvedValue([meta]);
    vi.mocked(metasApi.desactivar).mockResolvedValue(meta);
  });

  it('cancela el borrado o elimina y vuelve a cargar partidas, resumen y progreso', async () => {
    const user = userEvent.setup();
    const confirmar = vi.spyOn(window, 'confirm')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    let resolverPartidas: ((partidas: Array<typeof partida>) => void) | undefined;
    vi.mocked(partidasApi.obtenerPorVideojuego)
      .mockResolvedValueOnce([partida])
      .mockImplementationOnce(() => new Promise(resolve => { resolverPartidas = resolve; }));
    renderDetalle();

    await screen.findByText('60 min de juego');
    expect(await screen.findByRole('link', { name: 'Editar partida' })).toHaveAttribute(
      'href',
      '/partidas/partida-id/editar'
    );
    await user.click(screen.getByRole('button', { name: 'Eliminar partida' }));
    expect(confirmar).toHaveBeenCalledOnce();
    expect(partidasApi.eliminar).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Eliminar partida' }));
    expect(await screen.findByText(/Cargando detalle del videojuego/)).toBeInTheDocument();
    expect(screen.queryByText('60 min de juego')).not.toBeInTheDocument();
    expect(partidasApi.eliminar).toHaveBeenCalledWith('partida-id');
    resolverPartidas?.([]);
    await waitFor(() => {
      expect(partidasApi.obtenerPorVideojuego).toHaveBeenCalledTimes(2);
      expect(videojuegosApi.obtenerResumen).toHaveBeenCalledTimes(2);
      expect(videojuegosApi.obtenerProgresoSemanal).toHaveBeenCalledTimes(2);
    });
    expect(screen.queryByText('60 min de juego')).not.toBeInTheDocument();
  });

  it('no desactiva si se cancela la confirmación y actualiza la lista si se confirma', async () => {
    const user = userEvent.setup();
    const confirmar = vi.spyOn(window, 'confirm')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    vi.mocked(metasApi.obtenerPorVideojuego)
      .mockResolvedValueOnce([meta])
      .mockResolvedValueOnce([]);
    vi.mocked(videojuegosApi.obtenerProgresoSemanal)
      .mockResolvedValueOnce(progreso)
      .mockResolvedValueOnce({ ...progreso, meta: null, porcentajeHoras: null, hitos: [] });
    renderDetalle();

    await user.click(await screen.findByRole('button', { name: 'Ver meta semanal' }));
    await screen.findByText('5 horas');
    await user.click(screen.getByRole('button', { name: 'Desactivar' }));
    expect(confirmar).toHaveBeenCalledOnce();
    expect(metasApi.desactivar).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Desactivar' }));
    await waitFor(() => expect(metasApi.desactivar).toHaveBeenCalledWith('meta-id'));
    expect(await screen.findByText('Define una meta semanal para comparar tus horas y días de juego.')).toBeInTheDocument();
    expect(metasApi.obtenerPorVideojuego).toHaveBeenCalledTimes(2);
  });

  it('no ofrece crear una meta activa para un videojuego completado', async () => {
    vi.mocked(videojuegosApi.obtenerPorId).mockResolvedValue({
      ...juego,
      estado: 'completado'
    });
    vi.mocked(metasApi.obtenerPorVideojuego).mockResolvedValue([]);
    vi.mocked(videojuegosApi.obtenerProgresoSemanal).mockResolvedValue({
      ...progreso,
      meta: null,
      porcentajeHoras: null,
      hitos: []
    });
    renderDetalle();

    expect(await screen.findByText(
      'No se puede crear una meta activa para un juego completado o abandonado.'
    )).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Crear meta' })).not.toBeInTheDocument();
  });

  it('muestra la respuesta semanal del servidor con sus horas, rachas e hitos', async () => {
    renderDetalle();

    expect(await screen.findByText('Progreso semanal')).toBeInTheDocument();
    expect(screen.getByText('2026-11-02')).toBeInTheDocument();
    expect(screen.getByText('3.5')).toBeInTheDocument();
    expect(screen.getByText('70% de tu objetivo')).toBeInTheDocument();
    expect(screen.getByText('Llegar al 50 % · 50%')).toBeInTheDocument();
    expect(screen.getByText('Alcanzado')).toBeInTheDocument();
    expect(screen.getByText('Mejor racha: 4 días')).toBeInTheDocument();
  });

  it('muestra horas y rachas sin inventar porcentaje ni objetivos cuando no hay meta', async () => {
    vi.mocked(videojuegosApi.obtenerProgresoSemanal).mockResolvedValue({
      ...progreso,
      meta: null,
      porcentajeHoras: null,
      hitos: []
    });
    vi.mocked(metasApi.obtenerPorVideojuego).mockResolvedValue([]);
    renderDetalle();

    expect(await screen.findByText('Sin objetivo de horas activo')).toBeInTheDocument();
    expect(screen.getByText('Define una meta semanal para comparar tus horas y días de juego.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear meta' })).toBeInTheDocument();
    expect(screen.queryByText(/% de tu objetivo/)).not.toBeInTheDocument();
  });

  it('abre la meta en un diálogo modal y permite cerrarlo con Escape', async () => {
    const user = userEvent.setup();
    vi.mocked(metasApi.obtenerPorVideojuego).mockResolvedValue([]);
    vi.mocked(videojuegosApi.obtenerProgresoSemanal).mockResolvedValue({
      ...progreso,
      meta: null,
      porcentajeHoras: null,
      hitos: []
    });
    renderDetalle();

    const abrir = await screen.findByRole('button', { name: 'Crear meta' });
    await user.click(abrir);
    expect(screen.getByRole('dialog', { name: 'Meta semanal' })).toBeInTheDocument();
    expect(document.querySelector('.goal-panel')).not.toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Meta semanal' })).not.toBeInTheDocument();
    expect(document.activeElement).toBe(abrir);
  });

  it('mantiene el estado de carga hasta recibir el progreso del servidor', async () => {
    let resolver: ((value: typeof progreso) => void) | undefined;
    vi.mocked(videojuegosApi.obtenerProgresoSemanal)
      .mockImplementationOnce(() => new Promise(resolve => { resolver = resolve; }));
    renderDetalle();

    expect(screen.getByText(/Cargando detalle del videojuego/)).toBeInTheDocument();
    resolver?.(progreso);
    expect(await screen.findByText('Progreso semanal')).toBeInTheDocument();
  });

  it('muestra un error en vez de ceros y permite reintentar la consulta', async () => {
    vi.mocked(videojuegosApi.obtenerProgresoSemanal)
      .mockRejectedValueOnce(new Error('Servicio de progreso no disponible'))
      .mockResolvedValueOnce(progreso);
    renderDetalle();

    expect(await screen.findByRole('alert')).toHaveTextContent('Servicio de progreso no disponible');
    expect(screen.queryByText('Progreso semanal')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Progreso semanal')).toBeInTheDocument();
  });
});
