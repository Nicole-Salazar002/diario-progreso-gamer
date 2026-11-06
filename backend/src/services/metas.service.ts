import { Meta, ActualizarMetaInput, CrearMetaInput } from '../models/Meta';
import { Videojuego } from '../models/Videojuego';
import { AppError } from '../middleware/errorHandler';

function validarCuerpo(data: unknown): asserts data is Record<string, unknown> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new AppError('El cuerpo de la solicitud debe ser un objeto', 400);
  }
}

const esClaveDuplicada = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;

export const crearMeta = async (data: CrearMetaInput) => {
  validarCuerpo(data);
  if (typeof data.videojuego !== 'string' || data.videojuego.trim() === '') {
    throw new AppError('El ID del videojuego es obligatorio', 400);
  }

  const videojuego = await Videojuego.findById(data.videojuego);
  if (!videojuego) throw new AppError('Videojuego no encontrado', 404);
  if (videojuego.estado === 'completado' || videojuego.estado === 'abandonado') {
    throw new AppError('No se puede crear una Meta para un videojuego completado o abandonado', 409);
  }

  const metaActiva = await Meta.findOne({ videojuego: data.videojuego, activa: true });
  if (metaActiva) throw new AppError('Ya existe una Meta activa para este videojuego', 409);

  try {
    return await Meta.create({
      videojuego: data.videojuego,
      horasSemanales: data.horasSemanales,
      diasPorSemana: data.diasPorSemana,
      hitos: data.hitos,
      activa: true
    });
  } catch (error) {
    if (esClaveDuplicada(error)) {
      throw new AppError('Ya existe una Meta activa para este videojuego', 409);
    }
    throw error;
  }
};

export const obtenerMetaPorId = async (id: string) => {
  const meta = await Meta.findById(id);
  if (!meta) throw new AppError('Meta no encontrada', 404);
  return meta;
};

export const obtenerMetasPorVideojuego = async (videojuegoId: string) => {
  const videojuego = await Videojuego.findById(videojuegoId);
  if (!videojuego) throw new AppError('Videojuego no encontrado', 404);
  return await Meta.find({ videojuego: videojuegoId }).sort({ createdAt: -1 });
};

export const actualizarMeta = async (id: string, data: ActualizarMetaInput) => {
  validarCuerpo(data);
  const cambios: ActualizarMetaInput = {};
  if (data.horasSemanales !== undefined) cambios.horasSemanales = data.horasSemanales;
  if (data.diasPorSemana !== undefined) cambios.diasPorSemana = data.diasPorSemana;
  if (data.hitos !== undefined) cambios.hitos = data.hitos;
  if (Object.keys(cambios).length === 0) {
    throw new AppError('Debe proporcionar horas, días o hitos para actualizar la Meta', 400);
  }

  const meta = await Meta.findByIdAndUpdate(id, cambios, { new: true, runValidators: true });
  if (!meta) throw new AppError('Meta no encontrada', 404);
  return meta;
};

export const desactivarMeta = async (id: string) => {
  const meta = await Meta.findById(id);
  if (!meta) throw new AppError('Meta no encontrada', 404);
  if (meta.activa) {
    meta.activa = false;
    await meta.save();
  }
  return meta;
};
