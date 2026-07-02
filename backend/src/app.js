const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Middleware & Utilities
const logger = require('./config/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { metricsMiddleware, register } = require('./utils/metrics');

// Route Modules
const authRoutes = require('./routes/auth.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const healthRoutes = require('./routes/health.routes');

const app = express();

// -------------------------------------------------------------
// 1. Security & Core Request Configuration
// -------------------------------------------------------------
app.use(helmet()); // Sets secure HTTP headers to protect against common web vulnerabilities
app.set('trust proxy', 1); // Trust Render's proxy to get correct client IP addresses (important for rate limiting)

// -------------------------------------------------------------
// 2. CORS (Cross-Origin Resource Sharing) Configuration
// -------------------------------------------------------------
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (e.g. curl, server-to-server, health checks)
      if (!origin) return callback(null, true);

      // If no allowed origins configured, allow all (permissive fallback)
      if (allowedOrigins.length === 0) return callback(null, true);

      // Allow if the requesting origin is in the allowed list
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // In local development, automatically allow localhost origins
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (process.env.NODE_ENV === 'development' && isLocalhost) {
        return callback(null, true);
      }

      // Otherwise, reject the request
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// -------------------------------------------------------------
// 3. Body Parsing & Compression Middleware
// -------------------------------------------------------------
app.use(compression()); // Compresses response bodies for faster load times
app.use(express.json({ limit: '100kb' })); // Parse incoming JSON request bodies (limits size to 100kb to prevent abuse)
app.use(express.urlencoded({ extended: true, limit: '100kb' })); // Parse URL-encoded bodies

// -------------------------------------------------------------
// 4. Observability: Access Logging & Metrics
// -------------------------------------------------------------
// Log requests using Morgan (skipping tests)
app.use(morgan('combined', { stream: logger.stream, skip: () => process.env.NODE_ENV === 'test' }));
app.use(metricsMiddleware); // Automatically tracks request duration and counts for Prometheus monitoring

// -------------------------------------------------------------
// 5. Global Rate Limiter
// -------------------------------------------------------------
app.use('/api', apiLimiter); // Protect all API routes from brute-force/DDoS attacks

// -------------------------------------------------------------
// 6. Registered API Routes
// -------------------------------------------------------------
app.use('/api/health', healthRoutes);       // Health check route for database and API status
app.use('/api/auth', authRoutes);           // Auth routes (Login, Current User status)
app.use('/api/feedback', feedbackRoutes);   // Customer feedback submissions and retrieval
app.use('/api/analytics', analyticsRoutes); // Dashboard analytics and summary details

// -------------------------------------------------------------
// 7. Base Checkpoints & Utility Routes
// -------------------------------------------------------------
// Endpoint for Prometheus to scrape API and system metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// General server root health status
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Acowale CRM API is running.' });
});

// API endpoint root health status
app.get('/api', (req, res) => {
  res.json({ success: true, message: 'Acowale CRM API base route.' });
});

// -------------------------------------------------------------
// 8. Error Handling Middleware (must be last)
// -------------------------------------------------------------
app.use(notFoundHandler); // Handles 404 (Not Found) errors
app.use(errorHandler);    // Catches and formats all internal server errors into standard JSON

module.exports = app;

