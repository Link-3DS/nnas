const { Router } = require('express');

const content = require('./content');
const devices = require('./devices');

const router = Router();

router.use('/api/content', content);
router.use('/api/devices', devices);

module.exports = router;