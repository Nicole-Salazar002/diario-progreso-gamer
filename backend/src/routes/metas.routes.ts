import { Router } from 'express';
import * as ctrl from '../controllers/metas.controller';

const router = Router();

router.post('/', ctrl.crear);
router.get('/videojuego/:videojuegoId', ctrl.getPorVideojuego);
router.get('/:id', ctrl.getPorId);
router.put('/:id', ctrl.actualizar);
router.patch('/:id/desactivar', ctrl.desactivar);

export default router;
