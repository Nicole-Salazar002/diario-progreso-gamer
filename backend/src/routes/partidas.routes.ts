// backend/src/routes/partidas.routes.ts
import { Router } from 'express';
import * as ctrl from '../controllers/partidas.controller';

const router = Router();

router.get('/', ctrl.getTodas);
router.post('/', ctrl.crear);
router.get('/:id', ctrl.getPorId);
router.put('/:id', ctrl.actualizar);
router.delete('/:id', ctrl.eliminar);

export default router;