import request from 'supertest';
import app from '../../app-db.js';

// Función helper para obtener token de autenticación
const getAuthToken = async () => {
  const loginResponse = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'juan.perez@example.com',
      password: 'password123'
    });

  return loginResponse.body.data.token;
};

describe('Users API', () => {
  let authToken;

  beforeAll(async () => {
    authToken = await getAuthToken();
  });

  describe('GET /api/v1/users/profile', () => {
    it('should return user profile', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('email', 'juan.perez@example.com');
      expect(response.body.data).toHaveProperty('role', 'customer');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/users/profile')
        .expect(401);
    });
  });

  describe('GET /api/v1/users/addresses', () => {
    it('should return user addresses', async () => {
      const response = await request(app)
        .get('/api/v1/users/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/users/addresses')
        .expect(401);
    });
  });
});