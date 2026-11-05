import React from 'react';
import { IProgresoSemanal } from '../types';

interface ProgresoSemanalProps {
  progreso: IProgresoSemanal;
  puedeCrearMeta: boolean;
  onCrearMeta: () => void;
}

export const ProgresoSemanal: React.FC<ProgresoSemanalProps> = ({
  progreso,
  puedeCrearMeta,
  onCrearMeta
}) => {
  const porcentajeReal = progreso.porcentajeHoras;
  const porcentajeVisual = porcentajeReal === null ? 0 : Math.min(100, Math.max(0, porcentajeReal));

  return (
    <section className="panel weekly-progress-panel" aria-labelledby="weekly-progress-title">
      <div className="panel-heading weekly-progress-heading">
        <div>
          <span className="eyebrow">ESTA SEMANA</span>
          <h3 id="weekly-progress-title">Progreso semanal</h3>
        </div>
        <p className="week-range">
          <time dateTime={progreso.semana.inicio}>{progreso.semana.inicio}</time>
          {' – '}
          <time dateTime={progreso.semana.fin}>{progreso.semana.fin}</time>
        </p>
      </div>

      <div className="weekly-stats">
        <article className="weekly-stat">
          <span>Horas jugadas</span>
          <strong>
            {progreso.horasSemana}
            {progreso.meta && <small> / {progreso.meta.horasSemanales} h</small>}
            {!progreso.meta && <small> h</small>}
          </strong>
          {progreso.meta ? (
            <>
              <span className="weekly-percent">{porcentajeReal}% de tu objetivo</span>
              <div
                className="progress-track weekly-progress-track"
                role="progressbar"
                aria-label={`Horas semanales: ${porcentajeReal}% del objetivo`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={porcentajeVisual}
                aria-valuetext={`${porcentajeReal}% del objetivo de horas`}
              >
                <i style={{ width: `${porcentajeVisual}%` }} />
              </div>
            </>
          ) : <span>Sin objetivo de horas activo</span>}
        </article>
        <article className="weekly-stat">
          <span>Días jugados</span>
          <strong>
            {progreso.diasJugadosSemana}
            {progreso.meta && <small> / {progreso.meta.diasPorSemana}</small>}
          </strong>
          <span>{progreso.meta ? 'días de tu objetivo semanal' : 'esta semana'}</span>
        </article>
        <article className="weekly-stat">
          <span>Racha actual</span>
          <strong>{progreso.rachaActual}<small> días</small></strong>
          <span>Mejor racha: {progreso.mejorRacha} días</span>
        </article>
      </div>

      {progreso.hitos.length > 0 && (
        <div className="weekly-milestones">
          <h4>Hitos de progreso</h4>
          <ul>
            {progreso.hitos.map((hito, indice) => (
              <li key={`${hito.descripcion}-${indice}`}>
                <span className="milestone-status" aria-hidden="true">{hito.alcanzado ? '✓' : '○'}</span>
                <span>{hito.descripcion} · {hito.porcentajeObjetivo}%</span>
                <strong>{hito.alcanzado ? 'Alcanzado' : 'Pendiente'}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!progreso.meta && (
        <div className="weekly-no-goal">
          <p>{puedeCrearMeta
            ? 'Define una meta semanal para comparar tus horas y días de juego.'
            : 'No se puede crear una meta activa para un juego completado o abandonado.'}</p>
          {puedeCrearMeta && (
            <button className="button button-primary" type="button" onClick={onCrearMeta}>
              Crear meta
            </button>
          )}
        </div>
      )}
    </section>
  );
};
