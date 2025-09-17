import request from 'supertest';
import app from '../../app-db.js';

describe('Menu API', () => {
  describe('GET /api/v1/menu', () => {
    it('should return a list of menu items', async () => {
      const response = await request(app)
        .get('/api/v1/menu')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      // Si hay datos, verificar estructura
      if (response.body.data.length > 0) {
        const menuItem = response.body.data[0];
        expect(menuItem).toHaveProperty('id');
        expect(menuItem).toHaveProperty('name');
        expect(menuItem).toHaveProperty('price');
        expect(menuItem).toHaveProperty('category');
        expect(menuItem).toHaveProperty('restaurant_id');
      }
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/menu?page=1&limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/v1/menu/category/Pizza')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      // Verificar que todos los items sean de la categoría si hay resultados
      if (response.body.data.length > 0) {
        response.body.data.forEach(item => {
          expect(item.category).toBe('Pizza');
        });
      }
    });

    it('should return only available items', async () => {
      const response = await request(app)
        .get('/api/v1/menu/available')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      // Verificar que todos los items estén disponibles
      response.body.data.forEach(item => {
        expect(item.is_available).toBe(true);
      });
    });
  });

  describe('GET /api/v1/menu/:id', () => {
    it('should return a specific menu item by ID', async () => {
      // Primero obtener un item existente
      const listResponse = await request(app)
        .get('/api/v1/menu')
        .expect(200);

      if (listResponse.body.data.length > 0) {
        const menuItemId = listResponse.body.data[0].id;

        const response = await request(app)
          .get(`/api/v1/menu/${menuItemId}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data.id).toBe(menuItemId);
      }
    });

    it('should return 404 for non-existent menu item', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .get(`/api/v1/menu/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});