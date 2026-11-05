import { Partida, IPartida } from '../models/Partida';
import { Videojuego } from '../models/Videojuego';
import { AppError } from '../middleware/errorHandler';

export interface ActualizarPartidaInput {
  fecha?: Date | string;
  duracionMinutos?: number;
  porcentajeAvance?: number;
  notas?: string;
}

function validarCuerpo(data: unknown): asserts data is Record<string, unknown> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new AppError('El cuerpo de la solicitud debe ser un objeto', 400);
  }
}

export const obtenerTodasPartidas = async () => {
  return await Partida.find().populate('videojuego').sort({ fecha: -1 });
};

export const obtenerPartidaPorId = async (id: string) => {
  const partida = await Partida.findById(id);
  if (!partida) throw new AppError('Partida no encontrada', 404);
  return partida;
};

export const obtenerPartidasPorVideojuego = async (videojuegoId: string) => {
  const juego = await Videojuego.findById(videojuegoId);
  if (!juego) throw new AppError('Videojuego no encontrado', 404);
  return await Partida.find({ videojuego: videojuegoId }).sort({ fecha: -1 });
};

export const crearPartida = async (data: Partial<IPartida>) => {
  // Validar referencia existente (responde 404 si el videojuego no existe)
  const juegoExiste = await Videojuego.findById(data.videojuego);
  if (!juegoExiste) {
    throw new AppError('El videojuego referenciado no existe', 404);
  }
  return await Partida.create(data);
};

export const actualizarPartida = async (id: string, data: ActualizarPartidaInput) => {
  validarCuerpo(data);
  const camposPermitidos = new Set(['fecha', 'duracionMinutos', 'porcentajeAvance', 'notas']);
  const camposNoPermitidos = Object.keys(data).filter(campo => !camposPermitidos.has(campo));
  if (camposNoPermitidos.length > 0) {
    throw new AppError(`Campos no editables: ${camposNoPermitidos.join(', ')}`, 400);
  }

  const cambios: ActualizarPartidaInput = {};
  if ('fecha' in data) {
    const fecha = data.fecha;
    if (!(typeof fecha === 'string' || fecha instanceof Date) || Number.isNaN(new Date(fecha).getTime())) {
      throw new AppError('La fecha debe ser válida', 400);
    }
    cambios.fecha = new Date(fecha);
  }
  if ('duracionMinutos' in data) {
    const duracionMinutos = data.duracionMinutos;
    if (typeof duracionMinutos !== 'number' || !Number.isFinite(duracionMinutos)) {
      throw new AppError('La duración debe ser un número válido', 400);
    }
    cambios.duracionMinutos = duracionMinutos;
  }
  if ('porcentajeAvance' in data) {
    const porcentajeAvance = data.porcentajeAvance;
    if (typeof porcentajeAvance !== 'number' || !Number.isFinite(porcentajeAvance)) {
      throw new AppError('El porcentaje de avance debe ser un número válido', 400);
    }
    cambios.porcentajeAvance = porcentajeAvance;
  }
  if ('notas' in data) {
    if (typeof data.notas !== 'string') {
      throw new AppError('Las notas deben ser texto', 400);
    }
    cambios.notas = data.notas;
  }
  if (Object.keys(cambios).length === 0) {
    throw new AppError('Debe proporcionar al menos un campo editable', 400);
  }

  const partida = await Partida.findByIdAndUpdate(id, cambios, { new: true, runValidators: true });
  if (!partida) throw new AppError('Partida no encontrada', 404);
  return partida;
};

export const eliminarPartida = async (id: string) => {
  const partida = await Partida.findByIdAndDelete(id);
  if (!partida) throw new AppError('Partida no encontrada', 404);
  return partida;
};