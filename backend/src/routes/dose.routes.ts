import { Router } from 'express';
import { doseController } from '../controllers/dose.controller';
import { upload } from '../utils/cloudinary';
import { authMiddleware } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

// Rotas públicas para listagem e detalhe de doses
router.get('/', doseController.list);
router.get('/:id', doseController.getById);

// Rotas protegidas - apenas ADMIN e VENDEDOR podem criar/editar/deletar doses
router.use(authMiddleware);
router.use(authorizeRoles('ADMIN', 'VENDEDOR'));
router.post('/', upload.single('image'), doseController.create);
router.put('/:id', upload.single('image'), doseController.update);
router.delete('/:id', doseController.delete);

export default router; 