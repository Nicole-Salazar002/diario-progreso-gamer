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
        <article className="weekly-stat weekly-hours-stat">
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
        <article className="weekly-stat weekly-days-stat">
          <span>Días jugados</span>
          <strong>
            {progreso.diasJugadosSemana}
            {progreso.meta && <small> / {progreso.meta.diasPorSemana}</small>}
          </strong>
          <span>{progreso.meta ? 'días de tu objetivo semanal' : 'esta semana'}</span>
        </article>
        <article className="weekly-stat weekly-streak-stat">
          <span className="streak-orbit" aria-hidden="true">✦</span>
          <span className="streak-label">RACHA EN CURSO</span>
          <span className="streak-flame" aria-hidden="true">🔥</span>
          <span>Racha actual</span>
          <strong>{progreso.rachaActual}<small> días</small></strong>
          <span>Mejor racha: {progreso.mejorRacha} días</span>
          <div className="streak-dots" role="img" aria-label={`Racha actual de ${progreso.rachaActual} días`}>
            {Array.from({ length: Math.min(7, Math.max(1, progreso.rachaActual)) }, (_, index) => (
              <i key={index} aria-hidden="true" />
            ))}
          </div>
        </article>
      </div>

      {progreso.hitos.length > 0 && (
        <div className="weekly-milestones">
          <div className="weekly-milestones-heading">
            <div>
              <h4>Hitos de progreso</h4>
              <p>El estado se actualiza con el porcentaje de avance de la última partida guardada.</p>
            </div>
            <strong className="milestone-count">
              {progreso.hitos.filter(hito => hito.alcanzado).length} de {progreso.hitos.length} hitos alcanzados
              {' · '}
              {progreso.hitos.filter(hito => !hito.alcanzado).length} pendiente{progreso.hitos.filter(hito => !hito.alcanzado).length === 1 ? '' : 's'}
            </strong>
          </div>
          <ul className="milestone-track">
            {progreso.hitos.map((hito, indice) => (
              <li className={hito.alcanzado ? 'milestone-reached' : ''} key={`${hito.descripcion}-${indice}`}>
                <span className="milestone-status" aria-hidden="true">{hito.alcanzado ? '✓' : '○'}</span>
                <span className="milestone-copy">
                  <strong>{hito.descripcion}</strong>
                  <small>Objetivo: {hito.porcentajeObjetivo}% de avance</small>
                </span>
                <strong className="milestone-state">{hito.alcanzado ? 'Alcanzado' : 'Pendiente'}</strong>
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
