import { Request, Response, NextFunction } from 'express';
import * as service from '../services/metas.service';

export const crear = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const meta = await service.crearMeta(req.body);
    res.status(201).json(meta);
  } catch (error) { next(error); }
};

export const getPorId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const meta = await service.obtenerMetaPorId(req.params.id);
    res.json(meta);
  } catch (error) { next(error); }
};

export const getPorVideojuego = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metas = await service.obtenerMetasPorVideojuego(req.params.videojuegoId);
    res.json(metas);
  } catch (error) { next(error); }
};

export const actualizar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const meta = await service.actualizarMeta(req.params.id, req.body);
    res.json(meta);
  } catch (error) { next(error); }
};

export const desactivar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const meta = await service.desactivarMeta(req.params.id);
    res.json(meta);
  } catch (error) { next(error); }
};
