export interface PartidaProgreso {
  fecha: Date;
  duracionMinutos: number;
}

export interface HitoMeta {
  descripcion: string;
  porcentajeObjetivo: number;
}

export interface MetaProgreso {
  horasSemanales: number;
  diasPorSemana: number;
  hitos: HitoMeta[];
}

export interface HitoProgreso extends HitoMeta {
  alcanzado: boolean;
}

export interface SemanaEcuador {
  inicio: string;
  fin: string;
}

export interface ProgresoSemanalCalculado {
  semana: SemanaEcuador;
  meta: Pick<MetaProgreso, 'horasSemanales' | 'diasPorSemana'> | null;
  horasSemana: number;
  porcentajeHoras: number | null;
  diasJugadosSemana: number;
  rachaActual: number;
  mejorRacha: number;
  hitos: HitoProgreso[];
}

const ZONA_HORARIA_ECUADOR = 'America/Guayaquil';

const obtenerFechaLocalEcuador = (fecha: Date): string => {
  if (Number.isNaN(fecha.getTime())) {
    throw new TypeError('La fecha de referencia debe ser válida');
  }

  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA_ECUADOR,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(fecha);
  const valores = Object.fromEntries(partes.map(parte => [parte.type, parte.value]));

  return `${valores.year}-${valores.month}-${valores.day}`;
};

const desplazarDia = (fechaLocal: string, dias: number): string => {
  const [anio, mes, dia] = fechaLocal.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia + dias));
  return fecha.toISOString().slice(0, 10);
};

const diferenciaEnDias = (fechaAnterior: string, fechaPosterior: string): number => {
  const [anioAnterior, mesAnterior, diaAnterior] = fechaAnterior.split('-').map(Number);
  const [anioPosterior, mesPosterior, diaPosterior] = fechaPosterior.split('-').map(Number);
  const anterior = Date.UTC(anioAnterior, mesAnterior - 1, diaAnterior);
  const posterior = Date.UTC(anioPosterior, mesPosterior - 1, diaPosterior);

  return (posterior - anterior) / 86_400_000;
};

export const obtenerSemanaEcuador = (fechaReferencia: Date): SemanaEcuador => {
  const fechaLocal = obtenerFechaLocalEcuador(fechaReferencia);
  const [anio, mes, dia] = fechaLocal.split('-').map(Number);
  const diaSemana = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
  const diasDesdeLunes = (diaSemana + 6) % 7;
  const inicio = desplazarDia(fechaLocal, -diasDesdeLunes);

  return {
    inicio,
    fin: desplazarDia(inicio, 6)
  };
};

const calcularRachas = (fechasJugadas: Set<string>, hoy: string) => {
  const ayer = desplazarDia(hoy, -1);
  let rachaActual = 0;
  let fechaActual = fechasJugadas.has(hoy) ? hoy : fechasJugadas.has(ayer) ? ayer : null;

  while (fechaActual && fechasJugadas.has(fechaActual)) {
    rachaActual += 1;
    fechaActual = desplazarDia(fechaActual, -1);
  }

  const fechasOrdenadas = [...fechasJugadas].sort();
  let mejorRacha = 0;
  let rachaHistorica = 0;
  let fechaAnterior: string | null = null;

  for (const fecha of fechasOrdenadas) {
    rachaHistorica = fechaAnterior && diferenciaEnDias(fechaAnterior, fecha) === 1
      ? rachaHistorica + 1
      : 1;
    mejorRacha = Math.max(mejorRacha, rachaHistorica);
    fechaAnterior = fecha;
  }

  return { rachaActual, mejorRacha };
};

export const calcularProgresoSemanal = (
  partidas: PartidaProgreso[],
  meta: MetaProgreso | null,
  porcentajeAvanceActual: number,
  fechaReferencia: Date
): ProgresoSemanalCalculado => {
  if (!Number.isFinite(porcentajeAvanceActual) || porcentajeAvanceActual < 0 || porcentajeAvanceActual > 100) {
    throw new RangeError('El porcentaje de avance debe estar entre 0 y 100');
  }

  const semana = obtenerSemanaEcuador(fechaReferencia);
  const fechasJugadas = new Set<string>();
  const fechasSemana = new Set<string>();
  let minutosSemana = 0;

  for (const partida of partidas) {
    const fechaLocal = obtenerFechaLocalEcuador(partida.fecha);
    if (!Number.isFinite(partida.duracionMinutos) || partida.duracionMinutos < 0) {
      throw new RangeError('La duración de la partida debe ser un número no negativo');
    }

    fechasJugadas.add(fechaLocal);
    if (fechaLocal >= semana.inicio && fechaLocal <= semana.fin) {
      fechasSemana.add(fechaLocal);
      minutosSemana += partida.duracionMinutos;
    }
  }

  const horasSemana = Number((minutosSemana / 60).toFixed(1));
  const { rachaActual, mejorRacha } = calcularRachas(
    fechasJugadas,
    obtenerFechaLocalEcuador(fechaReferencia)
  );
  const hitos = meta
    ? meta.hitos.map(hito => ({
        ...hito,
        alcanzado: porcentajeAvanceActual >= hito.porcentajeObjetivo
      }))
    : [];

  return {
    semana,
    meta: meta ? {
      horasSemanales: meta.horasSemanales,
      diasPorSemana: meta.diasPorSemana
    } : null,
    horasSemana,
    porcentajeHoras: meta
      ? Math.round((horasSemana / meta.horasSemanales) * 100)
      : null,
    diasJugadosSemana: fechasSemana.size,
    rachaActual,
    mejorRacha,
    hitos
  };
};
