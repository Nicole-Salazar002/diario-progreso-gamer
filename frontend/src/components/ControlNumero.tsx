import React from 'react';

export interface ControlNumeroProps {
  id: string;
  valor: string;
  alCambiar: (valor: string) => void;
  minimo: number;
  maximo?: number;
  paso: number;
  etiqueta: string;
}

export const ControlNumero: React.FC<ControlNumeroProps> = ({
  id, valor, alCambiar, minimo, maximo, paso, etiqueta
}) => {
  const actual = valor === '' ? 0 : Number(valor);
  const ajustar = (direccion: -1 | 1) => {
    const siguiente = actual + paso * direccion;
    const limitado = Math.max(minimo, maximo === undefined ? siguiente : Math.min(maximo, siguiente));
    alCambiar(String(Number(limitado.toFixed(2))));
  };

  return <span className="number-control">
    <input
      id={id}
      type="number"
      min={minimo}
      max={maximo}
      step={paso}
      required
      value={valor}
      onChange={event => alCambiar(event.target.value)}
    />
    <span className="number-control-actions">
      <button
        type="button"
        aria-label={`Reducir ${etiqueta}`}
        title={`Reducir ${etiqueta}`}
        disabled={!Number.isFinite(actual) || actual <= minimo}
        onClick={() => ajustar(-1)}
      >−</button>
      <button
        type="button"
        aria-label={`Aumentar ${etiqueta}`}
        title={`Aumentar ${etiqueta}`}
        disabled={!Number.isFinite(actual) || (maximo !== undefined && actual >= maximo)}
        onClick={() => ajustar(1)}
      >+</button>
    </span>
  </span>;
};
