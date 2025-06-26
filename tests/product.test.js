import request from 'supertest';
import app from '../server.js'; // Correct if using ES Modules
import mongoose from 'mongoose';

describe('GET /api/product', () => {
  it('should return all products', async () => {
    const res = await request(app).get('/api/product');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// Optional cleanup (only needed if DB opened during test)
afterAll(async () => {
  await mongoose.connection.close();
});
