import { Partida, IPartida } from '../models/Partida';
import { Videojuego } from '../models/Videojuego';
import { AppError } from '../middleware/errorHandler';

export const obtenerTodasPartidas = async () => {
  return await Partida.find().populate('videojuego').sort({ fecha: -1 });
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

export const eliminarPartida = async (id: string) => {
  const partida = await Partida.findByIdAndDelete(id);
  if (!partida) throw new AppError('Partida no encontrada', 404);
  return partida;
};