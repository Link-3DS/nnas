const { Router } = require('express');
const child_process = require('child_process');
const logger = require('../../../logger');

const router = Router();

router.post('/validate/email', async (req, res) => {
    const { email } = req.body;

    const domain = String(email).substring(email.lastIndexOf("@") + 1);

    try {
        const ping = child_process.execSync(`ping -c 1 ${domain}`, {
            stdio: 'pipe'
        });
        logger.info(ping.toString());
    } catch(err) {
        logger.error(err);
    }

    res.send();
});

module.exports = router;