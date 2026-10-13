import { Request, Response, NextFunction } from 'express';
import * as service from '../services/partidas.service';

export const getTodas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const partidas = await service.obtenerTodasPartidas();
    res.json(partidas);
  } catch (error) { next(error); }
};

export const getPorVideojuego = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const partidas = await service.obtenerPartidasPorVideojuego(req.params.id);
    res.json(partidas);
  } catch (error) { next(error); }
};

export const crear = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nueva = await service.crearPartida(req.body);
    res.status(201).json(nueva);
  } catch (error) { next(error); }
};

export const eliminar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.eliminarPartida(req.params.id);
    res.status(204).send();
  } catch (error) { next(error); }
};