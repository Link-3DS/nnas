require('dotenv/config');
const { Pool } = require('pg');
const logger = require('./logger');

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
        CREATE TABLE IF NOT EXISTS lnid (
        id SERIAL PRIMARY KEY,
        deleted BOOLEAN DEFAULT FALSE,
        permissions BIGINT DEFAULT 0,
        account_level INTEGER DEFAULT 0,
        pid INTEGER UNIQUE,
        creation_date TEXT,
        updated TEXT,
        username VARCHAR(16) UNIQUE CHECK (char_length(username) >= 6),
        usernameLower VARCHAR(255) UNIQUE,
        password TEXT,
        birthdate TEXT,
        gender TEXT,
        country TEXT,
        language TEXT,
        email_address TEXT,
        email_primary BOOLEAN,
        email_parent BOOLEAN,
        email_reachable BOOLEAN,
        email_validated BOOLEAN,
        email_validated_date TEXT,
        email_id INTEGER,
        region INTEGER,
        timezone_name TEXT,
        timezone_offset INTEGER,
        mii_name TEXT,
        mii_primary BOOLEAN,
        mii_data TEXT,
        mii_id INTEGER,
        mii_hash TEXT,
        mii_image_url TEXT,
        mii_image_id INTEGER,
        flags_active BOOLEAN,
        flags_marketing BOOLEAN,
        flags_off_device BOOLEAN,
        devices JSONB,
        identification_email_code TEXT UNIQUE,
        identification_email_token TEXT UNIQUE,
        access_token_value TEXT,
        access_token_ttl INTEGER,
        refresh_token_value TEXT,
        refresh_token_ttl INTEGER
      );
    `);

    logger.success('Tables initialized successfully.');
  } catch (err) {
    logger.error('Failed to initialize tables:', err);
  }
}

module.exports = {
  pool,
  connect,
  query
};