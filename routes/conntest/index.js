const { Router } = require('express');
const subdomain = require('express-subdomain');
const path = require('path');
const logger = require('../../logger');

const conntest = Router();

conntest.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../assets/conntest/test.html'));
});

const router = Router();

logger.info('[CONNTEST] Activating defined routes.');

router.use(subdomain('conntest', conntest));

module.exports = router;