const { Router } = require('express');
const router = Router();
const controller = require('../controllers/responsables.controller');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const paginate = require('../middleware/paginate');

router.use(auth);

// View is public for all authenticated users (to load dropdowns)
router.get('/', paginate, controller.list);
router.get('/:id', controller.getById);

// Create, edit, delete require admin or config edit permissions
router.post('/', authorize('config', 'edit'), controller.create);
router.put('/:id', authorize('config', 'edit'), controller.update);
router.delete('/:id', authorize('config', 'edit'), controller.delete);

module.exports = router;
