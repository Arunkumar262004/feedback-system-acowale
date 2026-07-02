const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'acowale_crm_' });

const httpRequestDuration = new client.Histogram({
  name: 'acowale_crm_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

const httpRequestsTotal = new client.Counter({
  name: 'acowale_crm_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const feedbackSubmittedTotal = new client.Counter({
  name: 'acowale_crm_feedback_submitted_total',
  help: 'Total number of feedback entries submitted',
  labelNames: ['category'],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(feedbackSubmittedTotal);

// Express middleware to record duration + count of every request
function metricsMiddleware(req, res, next) {
  const start = process.hrtime();
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds + nanoseconds / 1e9;
    // Use route pattern where available to avoid unbounded label cardinality
    const route = (req.route && req.baseUrl + req.route.path) || req.path;
    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration
    );
    httpRequestsTotal.inc({ method: req.method, route, status_code: res.statusCode });
  });
  next();
}

module.exports = { register, metricsMiddleware, feedbackSubmittedTotal };
