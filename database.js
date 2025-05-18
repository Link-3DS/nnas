require('dotenv/config');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const logger = require('./logger');
const { nintendoPasswordHash, decryptToken, unpackToken } = require('./hash');

const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: false
});

async function connect() {
  try {
    const client = await pool.connect();
    initializeTables();
    logger.database('Connected to PostgreSQL.');
    client.release();
  } catch (err) {
    logger.error('PostgreSQL connection error:', err);
    process.exit(1);
  }
}

async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

async function initializeTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lnids (
        id SERIAL PRIMARY KEY,
        pid INTEGER NOT NULL UNIQUE,
        deleted BOOLEAN DEFAULT FALSE,
        permissions BIGINT DEFAULT 0,
        account_level INTEGER DEFAULT 0,
        server_level VARCHAR(10) DEFAULT 'prod',
        creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        username VARCHAR(16) NOT NULL UNIQUE,
        usernameLower VARCHAR(255) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        birthdate VARCHAR(20) NOT NULL,
        gender VARCHAR(10) NOT NULL,
        country VARCHAR(10) NOT NULL,
        language VARCHAR(10) NOT NULL,
        email JSON NOT NULL,
        region VARCHAR(10) NOT NULL,
        timezone JSON NOT NULL,
        mii JSON NOT NULL,
        flags JSON NOT NULL,
        identification JSON NOT NULL
      );
    `);

    logger.success('Tables initialized successfully.');
  } catch (err) {
    logger.error('Failed to initialize tables:', err);
  }
}

async function getLNIDByPID(pid) {
  try {
    const res = await query('SELECT * FROM lnids WHERE pid = $1 LIMIT 1;', [pid]);
    return res.rows[0] || null;
  } catch (err) {
    logger.error('Error fetching LNID by PID:', err);
    return null;
  }
}

async function getLNIDByUsername(username) {
  try {
    const usernameLower = username.toLowerCase();
    const res = await query('SELECT * FROM lnids WHERE usernameLower = $1 LIMIT 1;', [usernameLower]);
    return res.rows[0] || null;
  } catch (err) {
    logger.error('Error fetching LNID by username:', err);
    return null;
  }
}

async function getLNIDByTokenAuth(token) {
  try {
    const decryptedToken = decryptToken(Buffer.from(token, 'hex'));
    const unpackedToken = unpackToken(decryptedToken);
    const lnid = await getLNIDByPID(unpackedToken.pid);
    if (lnid) {
      const expireTime = Math.floor(Number(unpackedToken.expire_time) / 1000);
      if (Math.floor(Date.now() / 1000) > expireTime) {
        return null;
      }
    }
    return lnid;
  } catch (error) {
    console.log(logger.error(error));
    return null;
  }
}

async function getLNIDByBasicAuth(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const parts = decoded.split(' ');
    const username = parts[0];
    const password = parts[1];
    const res = await query('SELECT * FROM lnids WHERE username = $1 LIMIT 1;', [username]);
    const lnid = res.rows[0];
    if (!lnid) {
      return null;
    }
    const hashedPassword = nintendoPasswordHash(password, lnid.pid);
    if (!bcrypt.compareSync(hashedPassword, lnid.password)) {
      return null;
    }
    return lnid;
  } catch (err) {
    logger.error('Error in getLNIDByBasicAuth:', err);
    return null;
  }
}

module.exports = {
  pool,
  connect,
  query,
  getLNIDByPID,
  getLNIDByUsername,
  getLNIDByTokenAuth,
  getLNIDByBasicAuth
};