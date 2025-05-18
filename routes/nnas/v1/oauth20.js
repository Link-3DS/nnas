const { Router } = require('express');
const xmlbuilder = require('xmlbuilder');
const bcrypt = require('bcrypt');
const { getLNIDByUsername, getLNIDByTokenAuth } = require('../../../database');
const { generateToken } = require('../../../hash');

const router = Router();

// TODO: Change this
router.post('/access_token/generate', async (req, res) => {
    const { grant_type, user_id, password, refresh_token } = req.body;

    if (!['password', 'refresh_token'].includes(grant_type)) {
		const xmlResponse = xmlbuilder.create({
			error: {
				cause: 'grant_type',
				code: '0004',
				message: 'Invalid Grant Type'
			}
		}).end();
		return res.status(400).send(xmlResponse);
	}

	let lnid = null;

	if (grant_type === 'password') {
		if (!user_id || user_id.trim() === '') {
			const xmlResponse = xmlbuilder.create({
				error: {
					cause: 'user_id',
					code: '0002',
					message: 'user_id format is invalid'
				}
			}).end();
			return res.status(400).send(xmlResponse);
		}

		if (!password || password.trim() === '') {
			const xmlResponse = xmlbuilder.create({
				error: {
					cause: 'password',
					code: '0002',
					message: 'password format is invalid'
				}
			}).end();
			return res.status(400).send(xmlResponse);
		}

		lnid = await getLNIDByUsername(user_id);

		if (!lnid || !await bcrypt.compare(password, lnid.password)) {
			const xmlResponse = xmlbuilder.create({
				errors: {
					error: {
						code: '0106',
						message: 'Invalid account ID or password'
					}
				}
			}).end({ pretty: true });
			return res.status(400).send(xmlResponse);
		}
	} else {
		if (!refresh_token || refresh_token.trim() === '') {
			const xmlResponse = xmlbuilder.create({
				error: {
					cause: 'refresh_token',
					code: '0106',
					message: 'Invalid Refresh Token'
				}
			}).end();
			return res.status(400).send(xmlResponse);
		}

		try {
			lnid = await getLNIDByTokenAuth(refresh_token);

			if (!lnid) {
				const xmlResponse = xmlbuilder.create({
					error: {
						cause: 'refresh_token',
						code: '0106',
						message: 'Invalid Refresh Token'
					}
				}).end();
				return res.status(400).send(xmlResponse);
			}
		} catch (error) {
			const xmlResponse = xmlbuilder.create({
				error: {
					cause: 'refresh_token',
					code: '0106',
					message: 'Invalid Refresh Token'
				}
			}).end();
			return res.status(400).send(xmlResponse);
		}
	}

	if (lnid.deleted) {
		const xmlResponse = xmlbuilder.create({
			error: {
				code: '0112',
				message: lnid.username
			}
		}).end();
        return res.status(400).send(xmlResponse);
	}

	if (lnid.account_level < 0) {
		const xmlResponse = xmlbuilder.create({
			errors: {
				error: {
					code: '0108',
					message: 'Account has been banned'
				}
			}
		}).end();
		return res.status(400).send(xmlResponse);
	}

	const expiresInMs = 3600 * 1000;
	const now = Date.now();
	const expiresIn = 3600;

	const [accessTokenBuffer, refreshTokenBuffer] = await Promise.all([
		generateToken(process.env.AES_KEY, {
			system_type: 0x1,
			token_type: 0x1,
			pid: lnid.pid,
			expire_time: BigInt(now + expiresInMs)
		}),
		generateToken(process.env.AES_KEY, {
			system_type: 0x1,
			token_type: 0x2,
			pid: lnid.pid,
			expire_time: BigInt(now + expiresInMs)
		})
	]);

	const xmlResponse = xmlbuilder.create({
		OAuth20: {
			access_token: {
				token: accessTokenBuffer?.toString('hex') ?? '',
				refresh_token: refreshTokenBuffer?.toString('hex') ?? '',
				expires_in: expiresIn
			}
		}
	}).end();

	res.send(xmlResponse);
});

module.exports = router;