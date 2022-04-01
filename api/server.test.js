// Write your tests here
const db = require('../data/dbConfig');
const Users = require('./users/users-model');

const request = require('supertest');
const server = require('./server');

// -------------------------- //

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db('users').truncate();
});

// -------------------------- //

test('sanity', () => {
  expect(true).toBe(true);
});

describe('Test users model', () => {
  test('Table starts empty', async () => {
    const users = await db('users');

    expect(users).toHaveLength(0);
  });

  test('Can insert new user', async () => {
    let result = await Users.insert({ username: 'test', password: 'beep' });
    expect(result).toEqual({ id: 1, username: 'test', password: 'beep' });

    let users = await db('users');
    expect(users).toHaveLength(1);

    await Users.insert({ username: 'beep', password: 'boop' });
    users = await db('users');
    expect(users).toHaveLength(2);
  });

  test('Can get user by ID', async () => {
    const [id] = await db('users').insert({ username: 'beep', password: 'boop' });
    let result = await Users.getById(id);

    expect(result).toHaveProperty('username', 'beep');
  });

  test('Can update user', async () => {
    const [id] = await db('users').insert({ username: 'test', password: 'beep' });
    let result = await Users.update(id, { username: 'test' });

    expect(result).toEqual({ id: 1, username: 'test', password: 'beep' });
    result = await Users.getById(id);
    expect(result).toEqual({ id: 1, username: 'test', password: 'beep' });
  });

  test('Can delete a user', async () => {
    let result = await Users.insert({ username: 'beep', password: 'boop' });
    result = await Users.getById(result.id);
    expect(result).toHaveProperty('username', 'beep');

    result = await Users.remove(result.id);
    expect(result).toEqual({ id: 1, username: 'beep', password: 'boop' });

    result = await Users.getById(result.id);
    expect(result).not.toBeDefined();
  });
});

describe('Testing server endpoints', () => {
  test('[POST] /auth/register - Can register', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'foo', password: 'bar' });
    
      const result = await db('users')
        .where('username', 'foo')
        .first()

      expect(result).toMatchObject({ username: 'foo' });
  });

  test('[POST] /auth/register - Password is hashed', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'foo', password: 'bar' });
    
      const result = await db('users')
        .where('username', 'foo')
        .first()

      expect(result).not.toHaveProperty('password', 'bar');
  });
  // -------------------------- //
  test('[POST] /auth/login - Welcomes on successful login', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'foo', password: 'bar' });

    const res = await request(server)
      .post('/api/auth/login')
      .send({ username: 'foo', password: 'bar' });

    expect(res.text).toMatch(/welcome, foo/i);
  });

  test('[POST] /auth/login - No login if invalid credentials', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'foo', password: 'bar' });

    const res = await request(server)
      .post('/api/auth/login')
      .send({ username: 'beep', password: 'bar' });

    expect(res.text).toMatch(/invalid credentials/i);
  });
  // -------------------------- //
  test('[GET] /api/jokes - No token returns proper message', async () => {
    const res = await request(server).get('/api/jokes');

    expect(res.text).toMatch(/token required/i);
  });

  test('[GET] /api/jokes - Invalid token returns proper message', async () => {
    const res = await request(server).get('/api/jokes').set('Authorization', 'lol');

    expect(res.text).toMatch(/token invalid/i);
  });
});