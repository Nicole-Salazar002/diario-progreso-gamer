import assert from 'node:assert/strict';
import test from 'node:test';
import { Meta } from '../models/Meta';
import { Videojuego } from '../models/Videojuego';
import { AppError } from '../middleware/errorHandler';
import * as servicio from './metas.service';

interface Reemplazo {
  objetivo: object;
  propiedad: string;
  valor: (...argumentos: unknown[]) => unknown;
}

const conReemplazos = async <T>(reemplazos: Reemplazo[], ejecutar: () => Promise<T>): Promise<T> => {
  const originales = reemplazos.map(({ objetivo, propiedad }) => ({
    objetivo,
    propiedad,
    descriptor: Object.getOwnPropertyDescriptor(objetivo, propiedad)
  }));

  for (const { objetivo, propiedad, valor } of reemplazos) {
    Object.defineProperty(objetivo, propiedad, {
      configurable: true,
      writable: true,
      value: valor
    });
  }

  try {
    return await ejecutar();
  } finally {
    for (const { objetivo, propiedad, descriptor } of originales.reverse()) {
      if (descriptor) {
        Object.defineProperty(objetivo, propiedad, descriptor);
      } else {
        Reflect.deleteProperty(objetivo, propiedad);
      }
    }
  }
};

const entradaMeta = {
  videojuego: '507f1f77bcf86cd799439011',
  horasSemanales: 5,
  diasPorSemana: 4,
  hitos: [{ descripcion: 'Llegar al 25 %', porcentajeObjetivo: 25 }]
};

test('crea una Meta activa después de verificar videojuego y ausencia de otra activa', async () => {
  const creada = { ...entradaMeta, activa: true };
  await conReemplazos([
    { objetivo: Videojuego, propiedad: 'findById', valor: async () => ({ estado: 'jugando' }) },
    { objetivo: Meta, propiedad: 'findOne', valor: async () => null },
    { objetivo: Meta, propiedad: 'create', valor: async () => creada }
  ], async () => {
    assert.deepEqual(await servicio.crearMeta(entradaMeta), creada);
  });
});

test('rechaza la creación si el videojuego no existe', async () => {
  await conReemplazos([
    { objetivo: Videojuego, propiedad: 'findById', valor: async () => null },
    { objetivo: Meta, propiedad: 'findOne', valor: async () => null }
  ], async () => {
    await assert.rejects(servicio.crearMeta(entradaMeta), (error: unknown) =>
      error instanceof AppError && error.statusCode === 404
    );
  });
});

test('rechaza una solicitud sin ID de videojuego con 400', async () => {
  await assert.rejects(servicio.crearMeta({ ...entradaMeta, videojuego: '' }), (error: unknown) =>
    error instanceof AppError && error.statusCode === 400
  );
});

test('rechaza la creación si el videojuego está completado o abandonado', async () => {
  await conReemplazos([
    { objetivo: Videojuego, propiedad: 'findById', valor: async () => ({ estado: 'completado' }) }
  ], async () => {
    await assert.rejects(servicio.crearMeta(entradaMeta), (error: unknown) =>
      error instanceof AppError && error.statusCode === 409
    );
  });
});

test('rechaza una segunda Meta activa con 409', async () => {
  await conReemplazos([
    { objetivo: Videojuego, propiedad: 'findById', valor: async () => ({ estado: 'jugando' }) },
    { objetivo: Meta, propiedad: 'findOne', valor: async () => ({ activa: true }) }
  ], async () => {
    await assert.rejects(servicio.crearMeta(entradaMeta), (error: unknown) =>
      error instanceof AppError && error.statusCode === 409 && /meta activa/i.test(error.message)
    );
  });
});

test('convierte el conflicto del índice único en 409', async () => {
  const errorDuplicado = Object.assign(new Error('duplicate key'), { code: 11000 });
  await conReemplazos([
    { objetivo: Videojuego, propiedad: 'findById', valor: async () => ({ estado: 'jugando' }) },
    { objetivo: Meta, propiedad: 'findOne', valor: async () => null },
    { objetivo: Meta, propiedad: 'create', valor: async () => { throw errorDuplicado; } }
  ], async () => {
    await assert.rejects(servicio.crearMeta(entradaMeta), (error: unknown) =>
      error instanceof AppError && error.statusCode === 409
    );
  });
});

test('consulta una Meta por id y devuelve 404 si no existe', async () => {
  const meta = { _id: 'meta-id', activa: false };
  await conReemplazos([
    { objetivo: Meta, propiedad: 'findById', valor: async () => meta }
  ], async () => {
    assert.equal(await servicio.obtenerMetaPorId('meta-id'), meta);
  });

  await conReemplazos([
    { objetivo: Meta, propiedad: 'findById', valor: async () => null }
  ], async () => {
    await assert.rejects(servicio.obtenerMetaPorId('meta-id'), (error: unknown) =>
      error instanceof AppError && error.statusCode === 404
    );
  });
});

test('lista metas históricas de un videojuego existente', async () => {
  const metas = [{ activa: false }, { activa: true }];
  const consulta = { sort: async () => metas };
  await conReemplazos([
    { objetivo: Videojuego, propiedad: 'findById', valor: async () => ({ _id: 'juego-id' }) },
    { objetivo: Meta, propiedad: 'find', valor: () => consulta }
  ], async () => {
    assert.deepEqual(await servicio.obtenerMetasPorVideojuego('juego-id'), metas);
  });
});

test('actualiza solo las reglas de la Meta y conserva videojuego y estado', async () => {
  const actualizada = { ...entradaMeta, _id: 'meta-id', videojuego: 'juego-id', activa: true };
  let argumentosActualizacion: unknown[] = [];
  await conReemplazos([
    {
      objetivo: Meta,
      propiedad: 'findByIdAndUpdate',
      valor: async (...argumentos: unknown[]) => {
        argumentosActualizacion = argumentos;
        return actualizada;
      }
    }
  ], async () => {
    assert.equal(await servicio.actualizarMeta('meta-id', { horasSemanales: 8 }), actualizada);
  });

  assert.equal(argumentosActualizacion[0], 'meta-id');
  assert.deepEqual(argumentosActualizacion[1], { horasSemanales: 8 });
  assert.deepEqual(argumentosActualizacion[2], { new: true, runValidators: true });
});

test('rechaza una actualización sin campos editables con 400', async () => {
  await assert.rejects(servicio.actualizarMeta('meta-id', {}), (error: unknown) =>
    error instanceof AppError && error.statusCode === 400
  );
});

test('desactiva una Meta existente sin eliminarla', async () => {
  let guardada = false;
  const meta = {
    activa: true,
    save: async () => {
      guardada = true;
      return meta;
    }
  };
  await conReemplazos([
    { objetivo: Meta, propiedad: 'findById', valor: async () => meta }
  ], async () => {
    const resultado = await servicio.desactivarMeta('meta-id');
    assert.equal(resultado, meta);
  });

  assert.equal(meta.activa, false);
  assert.equal(guardada, true);
});
