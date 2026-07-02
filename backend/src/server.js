require('dotenv').config(); // Load environment variables from .env file

const app = require('./app');
const db = require('./config/db');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

// -------------------------------------------------------------
// 1. Startup Checks (Fail fast if key config is missing)
// -------------------------------------------------------------
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length) {
  logger.error(`Fatal: Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// -------------------------------------------------------------
// 2. Run Database Migrations on Startup
// -------------------------------------------------------------
const { run: runMigrations } = require('./db/migrate');
runMigrations(false)
  .then(() => {
    logger.info('Database migrations applied/verified successfully.');
  })
  .catch((err) => {
    logger.error(`Database migration failed on startup: ${err.message}`);
    process.exit(1);
  });

// -------------------------------------------------------------
// 3. Start the HTTP Server
// -------------------------------------------------------------
const server = app.listen(PORT, () => {
  logger.info(`Acowale CRM API listening on port ${PORT} [${process.env.NODE_ENV}]`);
});

// -------------------------------------------------------------
// 4. Graceful Shutdown Handler
// -------------------------------------------------------------
function shutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  
  if (process.env.NODE_ENV === 'development') {
    process.exit(0);
  }

  // Close the server and then disconnect the PostgreSQL database pool
  server.close(async () => {
    await db.pool.end();
    logger.info('Server closed. Database connections drained cleanly.');
    process.exit(0);
  });

  // Force exit if the server fails to shut down within 10 seconds
  setTimeout(() => {
    logger.error('Shutdown timed out. Forcing termination.');
    process.exit(1);
  }, 10000).unref();
}

// Listen for termination signals from OS/Render
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// -------------------------------------------------------------
// 5. Global Error Handlers (Uncaught exceptions and promise rejections)
// -------------------------------------------------------------
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Promise Rejection: ${reason}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

module.exports = server;

