const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

process.env.API_ACCESS_KEY = 'open-sesame-test';
const app = require('../server');

let server;
let base;

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get(`${base}${path}`, { headers }, (res) => {
      res.resume();
      res.on('end', () => resolve(res));
    }).on('error', reject);
  });
}

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('API_ACCESS_KEY', () => {
  it('closes the API to strangers but not the health check', async () => {
    assert.equal((await get('/api/themes')).statusCode, 401);
    assert.equal((await get('/api/health')).statusCode, 200);
  });

  it('opens for scripts that send the key', async () => {
    assert.equal((await get('/api/themes', { 'x-api-key': 'open-sesame-test' })).statusCode, 200);
    assert.equal((await get('/api/themes', { 'x-api-key': 'open-sesame-tesT' })).statusCode, 401);
  });

  it('lets a person in with a link, then by cookie', async () => {
    assert.equal((await get('/?key=wrong')).statusCode, 401);
    const opened = await get('/?key=open-sesame-test');
    assert.equal(opened.statusCode, 302);
    const cookie = opened.headers['set-cookie'][0];
    assert.match(cookie, /HttpOnly/);
    const res = await get('/api/themes', { cookie: cookie.split(';')[0] });
    assert.equal(res.statusCode, 200);
  });
});
