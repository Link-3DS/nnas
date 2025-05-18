const { Router } = require('express');
const subdomain = require('express-subdomain');
const v1 = require('./v1');
const logger = require('../../logger');
const { LNIDMiddleware } = require('../../middleware/lnid');

const nnas = Router();

nnas.use(LNIDMiddleware);

nnas.use('/v1', v1);

const router = Router();

logger.info('[NNAS] Activating defined routes.');

router.use(subdomain('account', nnas));

module.exports = router;