import { Meta } from '../models/Meta';
import { Partida } from '../models/Partida';
import { Videojuego } from '../models/Videojuego';
import { AppError } from '../middleware/errorHandler';
import { calcularProgresoSemanal } from '../dominio/progreso';

export const obtenerProgresoSemanal = async (videojuegoId: string, fechaReferencia = new Date()) => {
  const videojuego = await Videojuego.findById(videojuegoId);
  if (!videojuego) throw new AppError('Videojuego no encontrado', 404);

  const [partidas, metaActiva] = await Promise.all([
    Partida.find({ videojuego: videojuegoId }).sort({ fecha: -1 }),
    Meta.findOne({ videojuego: videojuegoId, activa: true })
  ]);
  const partidaMasReciente = partidas[0];
  const meta = metaActiva
    ? {
        horasSemanales: metaActiva.horasSemanales,
        diasPorSemana: metaActiva.diasPorSemana,
        hitos: metaActiva.hitos
      }
    : null;

  return calcularProgresoSemanal(
    partidas.map(partida => ({
      fecha: partida.fecha,
      duracionMinutos: partida.duracionMinutos
    })),
    meta,
    partidaMasReciente?.porcentajeAvance ?? 0,
    fechaReferencia
  );
};
