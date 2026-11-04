// backend/src/routes/videojuegos.routes.ts
import { Router } from 'express';
import * as ctrl from '../controllers/videojuegos.controller';
import { getPorVideojuego } from '../controllers/partidas.controller';

const router = Router();

router.get('/', ctrl.getTodos);
router.post('/', ctrl.crear);
router.get('/:id', ctrl.getPorId);
router.put('/:id', ctrl.actualizar);
router.delete('/:id', ctrl.eliminar);

// Sub-documentos y cálculo
router.patch('/:id/logros/:logroId', ctrl.toggleLogro);
router.get('/:id/resumen', ctrl.getResumen);

// Ruta anidada de partidas
router.get('/:id/partidas', getPorVideojuego);

export default router;