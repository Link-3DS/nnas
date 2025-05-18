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

module.exports = {
  pool,
  connect,
  query
};