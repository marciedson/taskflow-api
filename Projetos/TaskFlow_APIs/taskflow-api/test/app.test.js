const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { after, before, test } = require('node:test');
const app = require('../server');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
  }
});

test('API root reports that the service is running', async () => {
  const response = await fetch(`${baseUrl}/`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { mensagem: 'TaskFlow API funcionando!' });
});

test('Swagger document is available as JSON and UI', async () => {
  const specResponse = await fetch(`${baseUrl}/api-docs.json`);
  const spec = await specResponse.json();
  const uiResponse = await fetch(`${baseUrl}/api-docs/`);

  assert.equal(specResponse.status, 200);
  assert.equal(spec.openapi, '3.0.3');
  assert.ok(spec.paths['/auth/login']);
  assert.equal(uiResponse.status, 200);
  assert.match(uiResponse.headers.get('content-type'), /text\/html/);
});

test('protected project routes reject requests without a token', async () => {
  const response = await fetch(`${baseUrl}/projetos`);

  assert.equal(response.status, 401);
});

test('shared user directory requires an authenticated account', async () => {
  const response = await fetch(`${baseUrl}/usuarios`);

  assert.equal(response.status, 401);
});

test('an account cannot delete another user', async () => {
  const token = jwt.sign(
    { id: 1 },
    process.env.JWT_SECRET || 'taskflow-local-secret'
  );
  const response = await fetch(`${baseUrl}/usuarios/2`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(response.status, 403);
});

test('login validates required credentials without querying the database', async () => {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  assert.equal(response.status, 400);
});
