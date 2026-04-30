const router = require('express').Router();
const c = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/dashboard', c.getDashboard);
router.get('/project/:projectId', c.getByProject);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
