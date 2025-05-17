const { Router } = require('express');
const subdomain = require('express-subdomain');

const conntest = Router();

conntest.get('/', (req, res) => {
  res.send('OK');
});

const router = Router();

router.use(subdomain('conntest', conntest));

module.exports = router;