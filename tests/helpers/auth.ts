import request from 'supertest';
import app from '../../src/server';

export async function registerAndLogin(userData = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'password123'
}) {
  await request(app).post('/api/v1/auth/register').send(userData);
  const res = await request(app).post('/api/v1/auth/login').send({
    email: userData.email,
    password: userData.password
  });
  return res.body.token;
}
