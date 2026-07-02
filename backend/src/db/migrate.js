require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const logger = require('../config/logger');

async function run(shouldEndPool = true) {
  const sqlPath = path.join(__dirname, 'migrations', '001_init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = await pool.connect();
  try {
    logger.info('Running migrations...');
    await client.query(sql);
    logger.info('Migrations applied successfully.');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      const existing = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
      if (existing.rowCount === 0) {
        const hash = await bcrypt.hash(adminPassword, 10);
        await client.query(
          'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
          [adminEmail, hash, 'admin']
        );
        logger.info(`Seeded admin user: ${adminEmail}`);
      } else {
        logger.info('Admin user already exists, skipping seed.');
      }
    }
  } finally {
    client.release();
    if (shouldEndPool) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  run(true).catch((err) => {
    logger.error(`Migration failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { run };
