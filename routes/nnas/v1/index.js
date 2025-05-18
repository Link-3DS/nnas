const { Router } = require('express');

const router = Router();

router.use('/api/content', require('./content'));
router.use('/api/devices', require('./devices'));
router.use('/api/people', require('./people'));
router.use('/api/support', require('./support'));

module.exports = router;