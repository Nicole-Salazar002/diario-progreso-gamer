import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { metasApi } from '../services/metasApi';
import { IMeta } from '../types';
import { FormularioMeta } from './FormularioMeta';

vi.mock('../services/metasApi', () => ({
  metasApi: {
    crear: vi.fn(),
    actualizar: vi.fn()
  }
}));

const videojuegoId = '507f1f77bcf86cd799439011';
const meta: IMeta = {
  _id: 'meta-id',
  videojuego: videojuegoId,
  horasSemanales: 5,
  diasPorSemana: 4,
  activa: true,
  hitos: [{ descripcion: 'Terminar el nivel', porcentajeObjetivo: 50 }]
};

describe('FormularioMeta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('crea una meta válida y notifica que debe refrescarse el detalle', async () => {
    const user = userEvent.setup();
    const onGuardado = vi.fn();
    render(
      <FormularioMeta
        videojuegoId={videojuegoId}
        onGuardado={onGuardado}
        onCancelar={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/Horas por semana/), '5');
    await user.clear(screen.getByLabelText(/Días por semana/));
    await user.type(screen.getByLabelText(/Días por semana/), '4');
    await user.click(screen.getByRole('button', { name: 'Crear meta' }));

    await waitFor(() => {
      expect(metasApi.crear).toHaveBeenCalledWith({
        videojuego: videojuegoId,
        horasSemanales: 5,
        diasPorSemana: 4,
        hitos: []
      });
    });
    expect(metasApi.actualizar).not.toHaveBeenCalled();
    expect(onGuardado).toHaveBeenCalledOnce();
  });

  it('actualiza la meta existente en lugar de crear otra', async () => {
    const user = userEvent.setup();
    const onGuardado = vi.fn();
    render(
      <FormularioMeta
        videojuegoId={videojuegoId}
        meta={meta}
        onGuardado={onGuardado}
        onCancelar={vi.fn()}
      />
    );

    await user.clear(screen.getByLabelText(/Horas por semana/));
    await user.type(screen.getByLabelText(/Horas por semana/), '8');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(metasApi.actualizar).toHaveBeenCalledWith('meta-id', {
        horasSemanales: 8,
        diasPorSemana: 4,
        hitos: meta.hitos
      });
    });
    expect(metasApi.crear).not.toHaveBeenCalled();
    expect(onGuardado).toHaveBeenCalledOnce();
  });

  it('valida los rangos antes de llamar al servicio', async () => {
    const user = userEvent.setup();
    render(
      <FormularioMeta
        videojuegoId={videojuegoId}
        onGuardado={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/Horas por semana/), '101');
    await user.click(screen.getByRole('button', { name: 'Crear meta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('mayores que 0 y no superar 100');
    expect(metasApi.crear).not.toHaveBeenCalled();
  });

  it('ofrece controles visibles para sumar y restar respetando los límites', async () => {
    const user = userEvent.setup();
    render(
      <FormularioMeta
        videojuegoId={videojuegoId}
        meta={meta}
        onGuardado={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    const horas = screen.getByLabelText(/Horas por semana/);
    await user.click(screen.getByRole('button', { name: 'Aumentar horas por semana' }));
    expect(horas).toHaveValue(5.5);
    await user.click(screen.getByRole('button', { name: 'Reducir horas por semana' }));
    expect(horas).toHaveValue(5);

    const dias = screen.getByLabelText(/Días por semana/);
    await user.click(screen.getByRole('button', { name: 'Reducir días por semana' }));
    expect(dias).toHaveValue(3);
    await user.click(screen.getByRole('button', { name: 'Aumentar días por semana' }));
    expect(dias).toHaveValue(4);

    const avance = screen.getByLabelText(/Avance objetivo/);
    await user.click(screen.getByRole('button', { name: 'Aumentar porcentaje del hito 1' }));
    expect(avance).toHaveValue(51);
  });

  it('deshabilita los controles que ya están en el mínimo o máximo', () => {
    render(
      <FormularioMeta
        videojuegoId={videojuegoId}
        meta={{ ...meta, horasSemanales: 100, diasPorSemana: 1, hitos: [{ descripcion: 'Fin', porcentajeObjetivo: 100 }] }}
        onGuardado={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Aumentar horas por semana' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reducir días por semana' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Aumentar porcentaje del hito 1' })).toBeDisabled();
  });

  it('muestra el error del servidor y conserva los valores del formulario', async () => {
    const user = userEvent.setup();
    vi.mocked(metasApi.crear).mockRejectedValueOnce(new Error('Ya existe una meta activa'));
    render(
      <FormularioMeta
        videojuegoId={videojuegoId}
        onGuardado={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    const horas = screen.getByLabelText(/Horas por semana/);
    await user.type(horas, '6');
    await user.click(screen.getByRole('button', { name: 'Crear meta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe una meta activa');
    expect(horas).toHaveValue(6);
  });

  it('limita el formulario a cinco hitos', async () => {
    const user = userEvent.setup();
    render(
      <FormularioMeta
        videojuegoId={videojuegoId}
        onGuardado={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    const agregar = screen.getByRole('button', { name: 'Añadir hito' });
    for (let indice = 0; indice < 5; indice += 1) {
      await user.click(agregar);
    }

    expect(screen.getAllByLabelText(/Descripción del hito/)).toHaveLength(5);
    expect(agregar).toBeDisabled();
  });

  it('valida descripción y porcentaje de los hitos', async () => {
    const user = userEvent.setup();
    render(
      <FormularioMeta
        videojuegoId={videojuegoId}
        onGuardado={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Añadir hito' }));
    await user.type(screen.getByLabelText('Descripción del hito 1'), 'Terminar el nivel');
    await user.clear(screen.getByLabelText('Avance objetivo 1–100%'));
    await user.type(screen.getByLabelText('Avance objetivo 1–100%'), '101');
    await user.type(screen.getByLabelText(/Horas por semana/), '5');
    await user.click(screen.getByRole('button', { name: 'Crear meta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('porcentaje entre 1 y 100');
    expect(metasApi.crear).not.toHaveBeenCalled();
  });
});
