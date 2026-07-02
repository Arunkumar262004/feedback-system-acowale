const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const logger = require('./config/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { metricsMiddleware, register } = require('./utils/metrics');

const authRoutes = require('./routes/auth.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const healthRoutes = require('./routes/health.routes');

const app = express();

// --- Security & core middleware ---
app.use(helmet());
app.set('trust proxy', 1); // needed on Render for correct req.ip behind proxy

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // allow no-origin requests (curl, server-to-server, health checks)
      if (
        !origin ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV === 'development' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// --- Observability: access logs + Prometheus metrics ---
app.use(morgan('combined', { stream: logger.stream, skip: () => process.env.NODE_ENV === 'test' }));
app.use(metricsMiddleware);

// --- Rate limiting (applies to all /api routes; stricter limiters override per-route) ---
app.use('/api', apiLimiter);

// --- Routes ---
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Acowale CRM API is running.' });
});

app.get('/api', (req, res) => {
  res.json({ success: true, message: 'Acowale CRM API base route.' });
});

// --- Error handling (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
