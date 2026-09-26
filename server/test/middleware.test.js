const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const app = require('../app');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('API Standard - Health endpoint returns success structure', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.equal(typeof data.message, 'string');
  assert.ok(data.data);
  assert.ok(data.data.timestamp);
});

test('API Standard - 404 handler returns standardized error payload', async () => {
  const res = await fetch(`${baseUrl}/api/non-existent-route`);
  const data = await res.json();

  assert.equal(res.status, 404);
  assert.equal(data.success, false);
  assert.ok(data.message.includes('Endpoint not found'));
});

test('Validation Middleware - Register requires valid email and password', async () => {
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'invalid-email', password: '123' })
  });
  const data = await res.json();

  assert.equal(res.status, 400);
  assert.equal(data.success, false);
  assert.ok(data.message);
});

test('Validation Middleware - Login requires email and password', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'bad' })
  });
  const data = await res.json();

  assert.equal(res.status, 400);
  assert.equal(data.success, false);
});

test('Auth Middleware - Accessing protected route without token returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/auth/me`);
  const data = await res.json();

  assert.equal(res.status, 401);
  assert.equal(data.success, false);
  assert.ok(data.message.includes('Access denied'));
});

test('Auth Middleware - Accessing protected route with invalid token returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: 'Bearer invalid.token.value' }
  });
  const data = await res.json();

  assert.equal(res.status, 401);
  assert.equal(data.success, false);
  assert.ok(data.message.includes('Invalid authentication token'));
});
