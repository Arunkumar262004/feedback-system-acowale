process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

const mockFeedbackRow = {
  id: '11111111-1111-1111-1111-111111111111',
  category: 'Product',
  comment: 'Great app, loving it!',
  email: null,
  rating: 5,
  status: 'Received',
  created_at: new Date().toISOString(),
};

jest.mock('../src/config/db', () => ({
  pool: { query: jest.fn().mockResolvedValue({ rows: [] }), end: jest.fn() },
  query: jest.fn(),
}));

jest.mock('../src/models/feedback.model', () => ({
  create: jest.fn().mockResolvedValue(mockFeedbackRow),
  findAll: jest.fn().mockResolvedValue({ data: [mockFeedbackRow], total: 1, page: 1, limit: 20 }),
  getAnalyticsSummary: jest.fn(),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

function adminToken() {
  return jwt.sign({ sub: 'u1', email: 'admin@acowale.com', role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
}

describe('POST /api/feedback', () => {
  it('accepts a valid feedback submission', async () => {
    const res = await request(app).post('/api/feedback').send({
      category: 'Product',
      comment: 'Great app, loving it!',
      rating: 5,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category).toBe('Product');
  });

  it('rejects submission with invalid category', async () => {
    const res = await request(app).post('/api/feedback').send({
      category: 'NotACategory',
      comment: 'Test comment here',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects submission with too-short comment', async () => {
    const res = await request(app).post('/api/feedback').send({
      category: 'Product',
      comment: 'hi',
    });
    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/feedback', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/feedback');
    expect(res.statusCode).toBe(401);
  });

  it('returns feedback list for authenticated admin', async () => {
    const res = await request(app)
      .get('/api/feedback')
      .set('Authorization', `Bearer ${adminToken()}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
