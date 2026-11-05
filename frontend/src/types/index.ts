export interface ILogro {
  _id?: string;
  nombre: string;
  obtenido: boolean;
}

export interface IVideojuego {
  _id: string;
  nombre: string;
  plataforma: 'PC' | 'PlayStation' | 'Xbox' | 'Switch' | 'Movil';
  genero: 'accion' | 'rol' | 'estrategia' | 'puzzle' | 'deportes' | 'otro';
  estado: 'jugando' | 'pausado' | 'completado' | 'abandonado';
  logros: ILogro[];
  portadaUrl?: string;
}

export interface IPartida {
  _id: string;
  videojuego: string | IVideojuego;
  fecha: string;
  duracionMinutos: number;
  porcentajeAvance: number;
  notas?: string;
}

export interface IResumen {
  totalPartidas: number;
  horasTotales: number;
  ultimaPartida: string | null;
  porcentajeAvanceActual: number;
}

export interface IHitoMeta {
  descripcion: string;
  porcentajeObjetivo: number;
}

export interface IHitoProgreso extends IHitoMeta {
  alcanzado: boolean;
}

export interface IMeta {
  _id: string;
  videojuego: string;
  horasSemanales: number;
  diasPorSemana: number;
  activa: boolean;
  hitos: IHitoMeta[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IProgresoSemanal {
  semana: { inicio: string; fin: string };
  meta: Pick<IMeta, 'horasSemanales' | 'diasPorSemana'> | null;
  horasSemana: number;
  porcentajeHoras: number | null;
  diasJugadosSemana: number;
  rachaActual: number;
  mejorRacha: number;
  hitos: IHitoProgreso[];
}
