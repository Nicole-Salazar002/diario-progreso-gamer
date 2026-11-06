import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  // 1. Error de ID mal formado (CastError de Mongoose)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'ID_INVALIDO',
      message: `El ID provisto '${err.value}' no tiene un formato válido.`
    });
  }

  // 2. Error de Validación de Esquema (ValidationError de Mongoose)
  if (err.name === 'ValidationError') {
    const mensajes = Object.values(err.errors).map((e: any) => e.message);
    return res.status(400).json({
      error: 'ERROR_VALIDACION',
      message: 'Error en los datos provistos',
      detalles: mensajes
    });
  }

  // 3. Errores de aplicación con estado conocido
  if (err instanceof AppError) {
    const respuestas: Record<number, { error: string; message: string }> = {
      400: { error: 'ERROR_VALIDACION', message: err.message },
      404: { error: 'NO_ENCONTRADO', message: err.message },
      409: { error: 'CONFLICTO', message: err.message }
    };
    const respuesta = respuestas[err.statusCode];

    if (respuesta) {
      return res.status(err.statusCode).json(respuesta);
    }

    return res.status(500).json({
      error: 'ERROR_INTERNO',
      message: 'Ha ocurrido un error inesperado en el servidor.'
    });
  }

  // 4. Error Inesperado del Servidor (500)
  return res.status(500).json({
    error: 'ERROR_INTERNO',
    message: 'Ha ocurrido un error inesperado en el servidor.'
  });
};