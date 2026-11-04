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
