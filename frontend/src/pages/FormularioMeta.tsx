import React, { FormEvent, useState } from 'react';
import { ActualizarMetaInput, CrearMetaInput, metasApi } from '../services/metasApi';
import { IHitoMeta, IMeta } from '../types';

interface FormularioMetaProps {
  videojuegoId: string;
  meta?: IMeta;
  onGuardado: () => void | Promise<void>;
  onCancelar: () => void;
}

const crearHitoVacio = (): IHitoMeta => ({ descripcion: '', porcentajeObjetivo: 1 });

export const FormularioMeta: React.FC<FormularioMetaProps> = ({
  videojuegoId,
  meta,
  onGuardado,
  onCancelar
}) => {
  const [horasSemanales, setHorasSemanales] = useState(meta?.horasSemanales.toString() ?? '');
  const [diasPorSemana, setDiasPorSemana] = useState(meta?.diasPorSemana.toString() ?? '1');
  const [hitos, setHitos] = useState<IHitoMeta[]>(meta?.hitos.map(hito => ({ ...hito })) ?? []);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const actualizarHito = (indice: number, cambios: Partial<IHitoMeta>) => {
    setHitos(actuales => actuales.map((hito, i) => i === indice ? { ...hito, ...cambios } : hito));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const horas = Number(horasSemanales);
    const dias = Number(diasPorSemana);
    if (!Number.isFinite(horas) || horas <= 0 || horas > 100) {
      setError('Las horas semanales deben ser mayores que 0 y no superar 100.');
      return;
    }
    if (!Number.isInteger(dias) || dias < 1 || dias > 7) {
      setError('Los días por semana deben ser un número entero entre 1 y 7.');
      return;
    }
    if (hitos.length > 5 || hitos.some(hito =>
      !hito.descripcion.trim() ||
      !Number.isFinite(hito.porcentajeObjetivo) ||
      hito.porcentajeObjetivo < 1 ||
      hito.porcentajeObjetivo > 100
    )) {
      setError('Cada hito necesita una descripción y un porcentaje entre 1 y 100. Puedes añadir hasta cinco.');
      return;
    }

    const datos: ActualizarMetaInput = { horasSemanales: horas, diasPorSemana: dias, hitos };
    try {
      setGuardando(true);
      setError(null);
      if (meta) {
        await metasApi.actualizar(meta._id, datos);
      } else {
        const nuevaMeta: CrearMetaInput = { videojuego: videojuegoId, ...datos };
        await metasApi.crear(nuevaMeta);
      }
      await onGuardado();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la meta.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form className="goal-form" onSubmit={handleSubmit} noValidate aria-labelledby="goal-form-title">
      <div className="form-section-title">
        <span className="step-number">✧</span>
        <div>
          <h4 id="goal-form-title">{meta ? 'Editar meta semanal' : 'Crear meta semanal'}</h4>
          <p>Elige un objetivo que se ajuste a tu ritmo.</p>
        </div>
      </div>

      {error && <div className="alert-error" role="alert">{error}</div>}

      <div className="field-grid">
        <label className="field" htmlFor="goal-hours">
          <span>Horas por semana <small>0–100</small></span>
          <input
            id="goal-hours"
            type="number"
            min="0.01"
            max="100"
            step="any"
            required
            value={horasSemanales}
            onChange={event => setHorasSemanales(event.target.value)}
          />
        </label>
        <label className="field" htmlFor="goal-days">
          <span>Días por semana <small>1–7</small></span>
          <input
            id="goal-days"
            type="number"
            min="1"
            max="7"
            step="1"
            required
            value={diasPorSemana}
            onChange={event => setDiasPorSemana(event.target.value)}
          />
        </label>
      </div>

      <fieldset className="goal-milestones">
        <legend>Hitos <small>(opcional, máximo 5)</small></legend>
        {hitos.map((hito, indice) => (
          <div className="goal-milestone" key={indice}>
            <label className="field" htmlFor={`goal-milestone-description-${indice}`}>
              <span>Descripción del hito {indice + 1}</span>
              <input
                id={`goal-milestone-description-${indice}`}
                value={hito.descripcion}
                onChange={event => actualizarHito(indice, { descripcion: event.target.value })}
              />
            </label>
            <label className="field" htmlFor={`goal-milestone-percent-${indice}`}>
              <span>Avance objetivo <small>1–100%</small></span>
              <input
                id={`goal-milestone-percent-${indice}`}
                type="number"
                min="1"
                max="100"
                step="any"
                value={hito.porcentajeObjetivo}
                onChange={event => actualizarHito(indice, { porcentajeObjetivo: Number(event.target.value) })}
              />
            </label>
            <button
              className="button button-quiet goal-remove-milestone"
              type="button"
              aria-label={`Quitar hito ${indice + 1}`}
              onClick={() => setHitos(actuales => actuales.filter((_, i) => i !== indice))}
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          className="button button-secondary"
          type="button"
          disabled={hitos.length >= 5}
          onClick={() => setHitos(actuales => [...actuales, crearHitoVacio()])}
        >
          Añadir hito
        </button>
      </fieldset>

      <div className="form-actions">
        <button className="button button-quiet" type="button" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
        <button className="button button-primary" type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : meta ? 'Guardar cambios' : 'Crear meta'}
        </button>
      </div>
    </form>
  );
};
