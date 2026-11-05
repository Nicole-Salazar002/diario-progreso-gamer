import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IProgresoSemanal } from '../types';
import { ProgresoSemanal } from './ProgresoSemanal';

const progresoBase: IProgresoSemanal = {
  semana: { inicio: '2026-11-02', fin: '2026-11-08' },
  meta: { horasSemanales: 5, diasPorSemana: 4 },
  horasSemana: 6,
  porcentajeHoras: 120,
  diasJugadosSemana: 3,
  rachaActual: 2,
  mejorRacha: 5,
  hitos: [
    { descripcion: 'Superar la primera zona', porcentajeObjetivo: 25, alcanzado: true },
    { descripcion: 'Llegar al final', porcentajeObjetivo: 100, alcanzado: false }
  ]
};

describe('ProgresoSemanal', () => {
  it('muestra la semana, objetivos, rachas e hitos y conserva el porcentaje real sobre 100', () => {
    render(
      <ProgresoSemanal
        progreso={progresoBase}
        puedeCrearMeta
        onCrearMeta={vi.fn()}
      />
    );

    expect(screen.getByText('2026-11-02')).toBeInTheDocument();
    expect(screen.getByText('2026-11-08')).toBeInTheDocument();
    expect(screen.getByText('120% de tu objetivo')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Mejor racha: 5 días')).toBeInTheDocument();
    expect(screen.getByText('Superar la primera zona · 25%')).toBeInTheDocument();
    expect(screen.getByText('Alcanzado')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();

    const barra = screen.getByRole('progressbar', { name: 'Horas semanales: 120% del objetivo' });
    expect(barra).toHaveAttribute('aria-valuenow', '100');
    expect(barra).toHaveAttribute('aria-valuetext', '120% del objetivo de horas');
    expect(barra.querySelector('i')).toHaveStyle({ width: '100%' });
  });

  it('muestra estadísticas sin meta, invita a crearla y no presenta hitos', () => {
    const onCrearMeta = vi.fn();
    render(
      <ProgresoSemanal
        progreso={{ ...progresoBase, meta: null, porcentajeHoras: null, hitos: [] }}
        puedeCrearMeta
        onCrearMeta={onCrearMeta}
      />
    );

    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('Sin objetivo de horas activo')).toBeInTheDocument();
    expect(screen.getByText('Define una meta semanal para comparar tus horas y días de juego.')).toBeInTheDocument();
    expect(screen.queryByText(/% de tu objetivo/)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Hitos de progreso' })).not.toBeInTheDocument();
    screen.getByRole('button', { name: 'Crear meta' }).click();
    expect(onCrearMeta).toHaveBeenCalledOnce();
  });

  it('sin meta para un juego completado explica la restricción y oculta crear', () => {
    render(
      <ProgresoSemanal
        progreso={{ ...progresoBase, meta: null, porcentajeHoras: null, hitos: [] }}
        puedeCrearMeta={false}
        onCrearMeta={vi.fn()}
      />
    );

    expect(screen.getByText('No se puede crear una meta activa para un juego completado o abandonado.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Crear meta' })).not.toBeInTheDocument();
  });

  it('representa cero horas y hitos pendientes sin partidas', () => {
    render(
      <ProgresoSemanal
        progreso={{
          ...progresoBase,
          horasSemana: 0,
          porcentajeHoras: 0,
          diasJugadosSemana: 0,
          rachaActual: 0,
          mejorRacha: 0,
          hitos: [{ descripcion: 'Primer avance', porcentajeObjetivo: 10, alcanzado: false }]
        }}
        puedeCrearMeta
        onCrearMeta={vi.fn()}
      />
    );

    expect(screen.getAllByText('0')).toHaveLength(3);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });
});
