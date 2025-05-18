const xmlbuilder = require('xmlbuilder');
const { getLNIDByBasicAuth, getLNIDByTokenAuth } = require('../database.js');

const LNIDMiddleware = async (req, res, next) => {
	const authorization = req.headers['authorization'];

	if (!authorization || (!authorization.startsWith('Bearer') && !authorization.startsWith('Basic'))) {
		next();
		return;
	}

	const [scheme, credentials] = authorization.split(' ');

	let lnid;

	try {
		lnid = scheme === 'Basic'
			? await getLNIDByBasicAuth(credentials)
			: await getLNIDByTokenAuth(credentials);

		if (!lnid) {
			const errorCode = scheme === 'Bearer' ? '0005' : '1105';
			const errorMessage = scheme === 'Bearer'
				? 'Invalid access token'
				: 'Email address, username, or password, is not valid';
            const xmlresponse = xmlbuilder.create({
                errors: {
                    error: {
                        cause: scheme === 'Bearer' ? 'access_token' : undefined,
                        code: errorCode,
                        message: errorMessage
                    }
                }
            }).end();
            return res.status(400).send(xmlresponse);
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

		req.lnid = lnid;
		next();
	} catch (error) {
		logger.error('LNID middleware error:', error);
		next(error);
	}
};

module.exports = {
	LNIDMiddleware
};