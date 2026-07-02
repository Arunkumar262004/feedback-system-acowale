require('dotenv').config();
const app = require('./app');
const db = require('./config/db');
const logger = require('./config/logger');
const cors = require('cors');
app.use(cors());
const PORT = process.env.PORT || 5000;

// Fail fast if required env vars are missing
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length) {
  logger.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// Run migrations on startup
const { run: runMigrations } = require('./db/migrate');
runMigrations(false)
  .then(() => {
    logger.info('Database migrations applied/verified successfully.');
  })
  .catch((err) => {
    logger.error(`Database migration failed on startup: ${err.message}`);
    process.exit(1);
  });

const server = app.listen(PORT, () => {
  logger.info(`Acowale CRM API listening on port ${PORT} [${process.env.NODE_ENV}]`);
});

function shutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  if (process.env.NODE_ENV === 'development') {
    process.exit(0);
  }
  server.close(async () => {
    await db.pool.end();
    logger.info('Server closed. DB pool drained.');
    process.exit(0);
  });
  // Force-exit if graceful shutdown hangs
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

module.exports = server;
