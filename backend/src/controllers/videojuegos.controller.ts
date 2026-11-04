import { Request, Response, NextFunction } from 'express';
import * as service from '../services/videojuegos.service';

export const getTodos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const estado = req.query.estado as string;
    const juegos = await service.obtenerTodosVideojuegos(estado);
    res.json(juegos);
  } catch (error) { next(error); }
};

export const getPorId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const juego = await service.obtenerVideojuegoPorId(req.params.id);
    res.json(juego);
  } catch (error) { next(error); }
};

export const crear = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nuevo = await service.crearVideojuego(req.body);
    res.status(201).json(nuevo);
  } catch (error) { next(error); }
};

export const actualizar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actualizado = await service.actualizarVideojuego(req.params.id, req.body);
    res.json(actualizado);
  } catch (error) { next(error); }
};

export const eliminar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.eliminarVideojuego(req.params.id);
    res.status(204).send();
  } catch (error) { next(error); }
};

export const toggleLogro = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, logroId } = req.params;
    const { obtenido } = req.body;
    const juego = await service.actualizarLogro(id, logroId, obtenido);
    res.json(juego);
  } catch (error) { next(error); }
};

export const getResumen = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resumen = await service.obtenerResumenVideojuego(req.params.id);
    res.json(resumen);
  } catch (error) { next(error); }
};