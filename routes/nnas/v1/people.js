const { Router } = require('express');
const xmlbuilder = require('xmlbuilder');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const database = require('../../../database');
const logger = require('../../../logger');

const router = Router();

function nintendoPasswordHash(password, pid) {
	const pidBuffer = Buffer.alloc(4);
	pidBuffer.writeUInt32LE(pid);

	const unpacked = Buffer.concat([
		pidBuffer,
		Buffer.from('\x02\x65\x43\x46'),
		Buffer.from(password)
	]);

	return crypto.createHash('sha256').update(unpacked).digest().toString('hex');
}

router.get('/:username', async (req, res) => {
  const { username } = req.params;

  const result = await database.query('SELECT * FROM lnids WHERE username = $1', [username]);

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


router.post('/', async (req, res) => {
  const { person } = req.body;

  const result = await database.query('SELECT 1 FROM lnids WHERE username = $1', [person.user_id]);
  if (result.rows.length > 0) {
    res.status = 400;
    return res.send('<?xml version="1.0"?><errors><error><code>0100</code><message>Account ID already exists</message></error></errors>');
  }

  try {
    const pid = 1;
    const primaryPasswordHash = nintendoPasswordHash(person.password, pid);
    const passwordHash = await bcrypt.hash(primaryPasswordHash, 10);

    const now = new Date().toISOString();

    const email = {
      address: person.email.address.toLowerCase(),
      primary: person.email.primary === 'Y',
      parent: person.email.parent === 'Y',
      reachable: false,
      validated: person.email.validated === 'Y',
      validated_date: '',
      id: crypto.randomBytes(4).readUInt32LE()
    };

    const timezone = {
      name: person.tz_name,
      offset: -14400 // TODO: dynamic offset
    };

    const mii = {
      name: person.mii.name,
      primary: person.mii.primary === 'Y',
      data: person.mii.data,
      id: crypto.randomBytes(4).readUInt32LE(),
      hash: crypto.randomBytes(7).toString('hex'),
      image_url: '',
      image_id: crypto.randomBytes(4).readUInt32LE()
    };

    const flags = {
      active: true,
      marketing: person.marketing_flag === 'Y',
      off_device: person.off_device_flag === 'Y'
    };

    const identification = {
      email_code: 1,
      email_token: ''
    };

    const insertSQL = `
      INSERT INTO lnids (
        pid, deleted, permissions, account_level, server_level,
        creation_date, updated, username, usernameLower, password,
        birthdate, gender, country, language, email, region,
        timezone, mii, flags, identification
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      )
    `;

    const values = [
      pid,
      false,
      0n,
      0,
      'prod',
      now,
      now,
      person.user_id,
      person.user_id.toLowerCase(),
      passwordHash,
      person.birth_date,
      person.gender,
      person.country,
      person.language,
      JSON.stringify(email),
      person.region,
      JSON.stringify(timezone),
      JSON.stringify(mii),
      JSON.stringify(flags),
      JSON.stringify(identification)
    ];

    await database.query(insertSQL, values);

    const xmlResponse = xmlbuilder.create({
      person: {
        pid
      }
    }).end();

    res.send(xmlResponse);

    logger.success(`Account created for ${person.user_id} with PID ${pid}.`);
  } catch (error) {
    logger.error('Error creating account:', error);
    res.status(400).send(xmlbuilder.create({
      error: {
        cause: 'Bad Request',
        code: '1600',
        message: 'Unable to process request'
      }
    }).end());
  }
});

module.exports = router;