const router = require('express').Router();
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', async (req, res) => {
  const users = await User.findAll({ attributes: ['id','name','email','role'] });
  res.json(users);
});

module.exports = router;
