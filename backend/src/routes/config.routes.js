const { Router } = require('express');
const router = Router();
const configController = require('../controllers/config.controller');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(auth);

// Ruta pública para dropdowns (solo requiere estar autenticado)
router.get('/all', configController.getAll);

// Rutas de administración
router.use(authorize('config', 'view'));

router.get('/:section', configController.getSection);
router.post('/:section', authorize('config', 'edit'), configController.createItem);
router.put('/:section/:id', authorize('config', 'edit'), configController.updateItem);
router.delete('/:section/:id', authorize('config', 'edit'), configController.removeItem);

module.exports = router;
