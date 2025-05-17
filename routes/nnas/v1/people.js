const { Router } = require('express');
const xmlbuilder = require('xmlbuilder');
const database = require('../../../database');

const router = Router();

router.get('/:lnid', async (req, res) => {
    const { lnid } = req.params;

    const result = await database.query('SELECT * FROM users WHERE pseudo = $1', [lnid]);

    if (result.rows.length > 0) {
        const xmlResponse = xmlbuilder.create({
            errors: {
                error: {
                    code: '0100',
                    message: 'Account ID already exists'
                }
            }
        }).end();
        return res.status(400).send(xmlResponse);
    }

    res.send('ok');
});

module.exports = router;