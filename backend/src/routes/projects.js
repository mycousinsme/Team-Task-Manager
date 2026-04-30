const router = require('express').Router();
const c = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', c.getAll);
router.post('/', c.create);
router.get('/:id', c.getOne);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
router.post('/:id/members', c.addMember);
router.delete('/:id/members/:userId', c.removeMember);

module.exports = router;
