import request from 'supertest';
import app from '../../app-db.js';

describe('Restaurants API', () => {
  describe('GET /api/v1/restaurants', () => {
    it('should return a list of restaurants', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Verificar estructura de restaurante
      const restaurant = response.body.data[0];
      expect(restaurant).toHaveProperty('id');
      expect(restaurant).toHaveProperty('name');
      expect(restaurant).toHaveProperty('address');
      expect(restaurant).toHaveProperty('category');
      expect(restaurant).toHaveProperty('rating');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants?page=1&limit=2')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/v1/restaurants?category=Italiana')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      // Si hay resultados, verificar que todos sean de la categoría
      if (response.body.data.length > 0) {
        response.body.data.forEach(restaurant => {
          expect(restaurant.category).toBe('Italiana');
        });
      }
    });
  });

  describe('GET /api/v1/restaurants/:id', () => {
    it('should return a specific restaurant by ID', async () => {
      // Primero obtener un restaurante existente
      const listResponse = await request(app)
        .get('/api/v1/restaurants')
        .expect(200);

      const restaurantId = listResponse.body.data[0].id;

      const response = await request(app)
        .get(`/api/v1/restaurants/${restaurantId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(restaurantId);
    });

    it('should return 404 for non-existent restaurant', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .get(`/api/v1/restaurants/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});