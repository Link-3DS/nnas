const { Router } = require('express');
const subdomain = require('express-subdomain');
const logger = require('../../logger');

const conntest = Router();

conntest.get('/', (req, res) => {
  res.send('OK');
});

const router = Router();

logger.info('[CONNTEST] Activating defined routes.');

router.use(subdomain('conntest', conntest));

module.exports = router;