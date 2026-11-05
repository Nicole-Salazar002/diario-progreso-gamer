import assert from 'node:assert/strict';
import test from 'node:test';
import { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler } from './errorHandler';

const ejecutarErrorHandler = (error: unknown) => {
  let statusCode = 0;
  let body: Record<string, unknown> | undefined;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(value: Record<string, unknown>) {
      body = value;
      return this;
    }
  } as unknown as Response;

  const originalConsoleError = console.error;
  console.error = () => undefined;
  try {
    errorHandler(error, {} as Request, res, (() => undefined) as NextFunction);
  } finally {
    console.error = originalConsoleError;
  }
  return { statusCode, body };
};

test('responde 400 con ID_INVALIDO para un ObjectId mal formado', () => {
  const { statusCode, body } = ejecutarErrorHandler({
    name: 'CastError',
    value: 'id-invalido'
  });

  assert.equal(statusCode, 400);
  assert.equal(body?.error, 'ID_INVALIDO');
});

test('responde 400 con ERROR_VALIDACION y los detalles del esquema', () => {
  const { statusCode, body } = ejecutarErrorHandler({
    name: 'ValidationError',
    errors: {
      horasSemanales: { message: 'Las horas deben ser mayores que cero' }
    }
  });

  assert.equal(statusCode, 400);
  assert.equal(body?.error, 'ERROR_VALIDACION');
  assert.deepEqual(body?.detalles, ['Las horas deben ser mayores que cero']);
});

test('conserva 404 y NO_ENCONTRADO para un AppError no encontrado', () => {
  const { statusCode, body } = ejecutarErrorHandler(new AppError('Meta no encontrada', 404));

  assert.equal(statusCode, 404);
  assert.equal(body?.error, 'NO_ENCONTRADO');
});

test('responde 409 con CONFLICTO para una meta activa duplicada', () => {
  const { statusCode, body } = ejecutarErrorHandler(new AppError('Ya existe una meta activa', 409));

  assert.equal(statusCode, 409);
  assert.equal(body?.error, 'CONFLICTO');
  assert.equal(body?.message, 'Ya existe una meta activa');
});

test('responde 500 genérico sin filtrar el mensaje interno', () => {
  const { statusCode, body } = ejecutarErrorHandler(new Error('detalle interno de la base de datos'));

  assert.equal(statusCode, 500);
  assert.equal(body?.error, 'ERROR_INTERNO');
  assert.equal(body?.message, 'Ha ocurrido un error inesperado en el servidor.');
  assert.equal(JSON.stringify(body).includes('detalle interno'), false);
});
