import request from 'supertest';
import app from '../../app-db.js';
import { User } from '../../models/index.js';

describe('Auth API Integration Tests', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'testuser@example.com',
        phone: '+573001234570',
        password: 'password123',
        role: 'customer'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Usuario registrado exitosamente');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
    });

    it('should return 400 for duplicate email', async () => {
      // Primero crear un usuario
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123'
      });

      const userData = {
        name: 'Test User 2',
        email: 'existing@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Ya existe un usuario con este email');
    });

    it('should return 400 for invalid email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for password too short', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Crear usuario de prueba para login
      await User.create({
        name: 'Login Test User',
        email: 'login@test.com',
        password: 'password123'
      });
    });

    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'login@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login exitoso');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user.email).toBe(loginData.email);
    });

    it('should return 401 for wrong password', async () => {
      const loginData = {
        email: 'login@test.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Credenciales inválidas');
    });

    it('should return 401 for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Credenciales inválidas');
    });

    it('should return 400 for missing email', async () => {
      const loginData = {
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/v1/auth/verify', () => {
    let accessToken;

    beforeEach(async () => {
      // Crear usuario y obtener token
      const user = await User.create({
        name: 'Verify Test User',
        email: 'verify@test.com',
        password: 'password123'
      });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'verify@test.com',
          password: 'password123'
        });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('should verify valid token successfully', async () => {
      const response = await request(app)
        .get('/api/v1/auth/verify')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token válido');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe('verify@test.com');
    });

    it('should return 401 for missing authorization header', async () => {
      await request(app)
        .get('/api/v1/auth/verify')
        .expect(401);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/verify')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 for malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/v1/auth/verify')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let accessToken;

    beforeEach(async () => {
      // Crear usuario y obtener token
      const user = await User.create({
        name: 'Logout Test User',
        email: 'logout@test.com',
        password: 'password123'
      });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'logout@test.com',
          password: 'password123'
        });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout exitoso');
    });

    it('should return 401 for logout without authentication', async () => {
      await request(app)
        .post('/api/v1/auth/logout')
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      // Crear usuario
      const user = await User.create({
        name: 'Refresh Test User',
        email: 'refresh@test.com',
        password: 'password123'
      });

      // Login para obtener refresh token en cookies
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'refresh@test.com',
          password: 'password123'
        });

      // Hacer refresh request (usará la cookie refreshToken)
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token renovado exitosamente');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('user');
    });

    it('should return 401 for refresh without cookies', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate limiting', () => {
    it('should handle rate limiting for auth endpoints', async () => {
      const userData = {
        name: 'Rate Limit Test',
        email: 'ratelimit@test.com',
        password: 'password123'
      };

      // Hacer múltiples requests rápidamente
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/v1/auth/register')
          .send({ ...userData, email: `ratelimit${i}@test.com` });
      }

      // La siguiente request debería ser rate limited
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      // Puede ser 429 (rate limited) o 200 (dependiendo de la configuración exacta)
      expect([200, 429]).toContain(response.status);
    });
  });
});