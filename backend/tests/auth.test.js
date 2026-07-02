process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

const bcrypt = require('bcryptjs');

jest.mock('../src/config/db', () => ({
  pool: { query: jest.fn().mockResolvedValue({ rows: [] }), end: jest.fn() },
  query: jest.fn(),
}));

const mockUser = {
  id: 'u1',
  email: 'admin@acowale.com',
  password_hash: bcrypt.hashSync('CorrectPassword1', 10),
  role: 'admin',
};

jest.mock('../src/models/user.model', () => ({
  findByEmail: jest.fn((email) => (email === 'admin@acowale.com' ? mockUser : null)),
}));

const request = require('supertest');
const app = require('../src/app');

describe('POST /api/auth/login', () => {
  it('returns a token for correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@acowale.com',
      password: 'CorrectPassword1',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects incorrect password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@acowale.com',
      password: 'WrongPassword',
    });
    expect(res.statusCode).toBe(401);
  });

  it('rejects unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@acowale.com',
      password: 'WhateverPassword1',
    });
    expect(res.statusCode).toBe(401);
  });

  it('validates malformed email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'not-an-email',
      password: 'WhateverPassword1',
    });
    expect(res.statusCode).toBe(400);
  });
});
