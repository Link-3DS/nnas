const { Router } = require('express');

const router = Router();

router.get('/time', async (req, res) => {
	res.set('X-Nintendo-Date', Date.now().toString());
	res.set('Server', 'Nintendo 3DS (http)');
	res.set('Date', new Date().toUTCString());
	res.send('');
});