const { query } = require('../config/db');

async function create({ category, comment, email, rating }) {
  const { rows } = await query(
    `INSERT INTO feedback (category, comment, email, rating)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [category, comment, email || null, rating || null]
  );
  return rows[0];
}

async function findAll({ category, search, status, page = 1, limit = 20 }) {
  const conditions = [];
  const params = [];

  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`comment ILIKE $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  params.push(limit);
  params.push(offset);

  const { rows } = await query(
    `SELECT * FROM feedback ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countParams = params.slice(0, params.length - 2);
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM feedback ${where}`,
    countParams
  );

  return { data: rows, total: countRows[0].total, page: Number(page), limit: Number(limit) };
}

async function getAnalyticsSummary() {
  const totalPromise = query('SELECT COUNT(*)::int AS total FROM feedback');
  const byCategoryPromise = query(
    `SELECT category, COUNT(*)::int AS count
     FROM feedback GROUP BY category ORDER BY count DESC`
  );
  const byStatusPromise = query(
    `SELECT status, COUNT(*)::int AS count FROM feedback GROUP BY status`
  );
  const recentTrendPromise = query(
    `SELECT DATE(created_at) AS day, COUNT(*)::int AS count
     FROM feedback
     WHERE created_at >= NOW() - INTERVAL '30 days'
     GROUP BY day ORDER BY day ASC`
  );
  const avgRatingPromise = query(
    `SELECT ROUND(AVG(rating)::numeric, 2) AS avg_rating FROM feedback WHERE rating IS NOT NULL`
  );

  const [total, byCategory, byStatus, recentTrend, avgRating] = await Promise.all([
    totalPromise, byCategoryPromise, byStatusPromise, recentTrendPromise, avgRatingPromise,
  ]);

  return {
    total: total.rows[0].total,
    byCategory: byCategory.rows,
    byStatus: byStatus.rows,
    trend: recentTrend.rows,
    avgRating: avgRating.rows[0].avg_rating || null,
  };
}

module.exports = { create, findAll, getAnalyticsSummary };
