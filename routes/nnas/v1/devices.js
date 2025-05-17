const { Router } = require('express');
const xmlbuilder = require('xmlbuilder');

const router = Router();

router.get('/@current/status', async (req, res) => {
  const xmlResponse = xmlbuilder.create({
    device: ''
  }).end();

  res.type('application/xml').send(xmlResponse);
});

module.exports = router;