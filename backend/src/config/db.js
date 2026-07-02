const { Pool } = require('pg');
require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' || isProd
    ? { rejectUnauthorized: false } // Render Postgres requires SSL, uses self-signed chain
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  // Log and let the process supervisor (Render) restart on fatal pool errors
  // instead of crashing silently.
  // eslint-disable-next-line global-require
  const logger = require('./logger');
  logger.error(`Unexpected PG pool error: ${err.message}`);
});

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line global-require
    require('./logger').debug(`query executed`, { text, duration, rows: res.rowCount });
  }
  return res;
}

module.exports = { pool, query };
