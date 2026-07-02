const db = require('../config/db');

/**
 * Check health status of the application and database connection
 */
exports.checkHealth = async (req, res, next) => {
  const health = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: 'unknown',
  };

  try {
    await db.query('SELECT 1');
    health.database = 'connected';
    res.status(200).json({ success: true, ...health });
  } catch (err) {
    health.status = 'degraded';
    health.database = 'disconnected';
    health.error = err.message;
    res.status(503).json({ success: false, ...health });
  }
};
