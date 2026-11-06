import mongoose, { ClientSession } from 'mongoose';
import { Videojuego, IVideojuego } from '../models/Videojuego';
import { Partida } from '../models/Partida';
import { Meta } from '../models/Meta';
import { AppError } from '../middleware/errorHandler';

const ejecutarEnTransaccion = async <T>(
  operacion: (session: ClientSession) => Promise<T>
): Promise<T> => {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(() => operacion(session));
  } finally {
    await session.endSession();
  }
};

export const obtenerTodosVideojuegos = async (filtroEstado?: string) => {
  const query = filtroEstado ? { estado: filtroEstado } : {};
  return await Videojuego.find(query).sort({ createdAt: -1 });
};

export const obtenerVideojuegoPorId = async (id: string) => {
  const juego = await Videojuego.findById(id);
  if (!juego) throw new AppError('Videojuego no encontrado', 404);
  return juego;
};

export const crearVideojuego = async (data: Partial<IVideojuego>) => {
  return await Videojuego.create(data);
};

export const actualizarVideojuego = async (id: string, data: Partial<IVideojuego>) => {
  if (data.estado === 'completado' || data.estado === 'abandonado') {
    return ejecutarEnTransaccion(async session => {
      const juego = await Videojuego.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
        session
      });
      if (!juego) throw new AppError('Videojuego no encontrado', 404);

      await Meta.updateMany(
        { videojuego: id, activa: true },
        { $set: { activa: false } },
        { session }
      );
      return juego;
    });
  }

  const juego = await Videojuego.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!juego) throw new AppError('Videojuego no encontrado', 404);
  return juego;
};

export const eliminarVideojuego = async (id: string) => {
  return ejecutarEnTransaccion(async session => {
    await Meta.deleteMany({ videojuego: id }, { session });
    await Partida.deleteMany({ videojuego: id }, { session });
    const juego = await Videojuego.findByIdAndDelete(id, { session });
    if (!juego) throw new AppError('Videojuego no encontrado', 404);
    return juego;
  });
};

// Operación sobre sub-documento embebido (marcar o actualizar logro)
export const actualizarLogro = async (juegoId: string, logroId: string, obtenido: boolean) => {
  const juego = await Videojuego.findById(juegoId);
  if (!juego) throw new AppError('Videojuego no encontrado', 404);

  const logro = juego.logros.find((l: any) => l._id?.toString() === logroId);
  if (!logro) throw new AppError('Logro no encontrado', 404);

  logro.obtenido = obtenido;
  await juego.save();
  return juego;
};

// ENDPOINT CALCULADO (RESUMEN)
export const obtenerResumenVideojuego = async (id: string) => {
  await obtenerVideojuegoPorId(id); // Valida que exista el juego

  const partidas = await Partida.find({ videojuego: id }).sort({ fecha: -1 });

  if (partidas.length === 0) {
    return {
      totalPartidas: 0,
      horasTotales: 0,
      ultimaPartida: null,
      porcentajeAvanceActual: 0
    };
  }

  const totalPartidas = partidas.length;
  const minutosTotales = partidas.reduce((acc, p) => acc + p.duracionMinutos, 0);
  const horasTotales = Number((minutosTotales / 60).toFixed(1));
  
  // Como están ordenadas por fecha descendente, la primera es la más reciente
  const ultimaPartida = partidas[0].fecha;
  const porcentajeAvanceActual = partidas[0].porcentajeAvance;

  return {
    totalPartidas,
    horasTotales,
    ultimaPartida,
    porcentajeAvanceActual
  };
};