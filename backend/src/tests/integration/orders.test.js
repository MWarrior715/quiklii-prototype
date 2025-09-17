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

// Función helper para obtener un restaurant y menu item
const getTestData = async () => {
  const restaurantResponse = await request(app)
    .get('/api/v1/restaurants')
    .expect(200);

  const restaurant = restaurantResponse.body.data[0];

  const menuResponse = await request(app)
    .get('/api/v1/menu')
    .expect(200);

  const menuItem = menuResponse.body.data[0];

  return { restaurant, menuItem };
};

describe('Orders API', () => {
  let authToken;
  let testRestaurant;
  let testMenuItem;

  beforeAll(async () => {
    authToken = await getAuthToken();
    const testData = await getTestData();
    testRestaurant = testData.restaurant;
    testMenuItem = testData.menuItem;
  });

  describe('POST /api/v1/orders', () => {
    it('should create a new order', async () => {
      const orderData = {
        restaurant_id: testRestaurant.id,
        items: [
          {
            menu_item_id: testMenuItem.id,
            quantity: 2,
            notes: 'Sin cebolla'
          }
        ],
        delivery_address: {
          street: 'Carrera 15 #123-45',
          city: 'Bogotá',
          neighborhood: 'Zona Rosa'
        },
        payment_method: 'cash'
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('status', 'pending');
      expect(response.body.data).toHaveProperty('total_amount');
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const orderData = {
        restaurant_id: testRestaurant.id,
        items: [
          {
            menu_item_id: testMenuItem.id,
            quantity: 1
          }
        ],
        delivery_address: {
          street: 'Test Street',
          city: 'Bogotá',
          neighborhood: 'Test'
        },
        payment_method: 'cash'
      };

      await request(app)
        .post('/api/v1/orders')
        .send(orderData)
        .expect(401);
    });
  });

  describe('GET /api/v1/orders', () => {
    it('should return user orders', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      // Si hay pedidos, verificar estructura
      if (response.body.data.length > 0) {
        const order = response.body.data[0];
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('total_amount');
        expect(order).toHaveProperty('restaurant');
        expect(Array.isArray(order.items)).toBe(true);
      }
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/orders')
        .expect(401);
    });
  });

  describe('Entity Relationships', () => {
    it('should validate restaurant-menu relationship', async () => {
      // Obtener menú de un restaurante específico
      const menuResponse = await request(app)
        .get(`/api/v1/menu/restaurants/${testRestaurant.id}/menu`)
        .expect(200);

      expect(menuResponse.body).toHaveProperty('data');
      expect(Array.isArray(menuResponse.body.data)).toBe(true);

      // Verificar que todos los items pertenezcan al restaurante
      menuResponse.body.data.forEach(item => {
        expect(item.restaurant_id).toBe(testRestaurant.id);
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('price');
      });
    });

    it('should validate order-menu-restaurant relationships', async () => {
      // Crear una orden
      const orderData = {
        restaurant_id: testRestaurant.id,
        items: [
          {
            menu_item_id: testMenuItem.id,
            quantity: 1
          }
        ],
        delivery_address: {
          street: 'Test Address',
          city: 'Bogotá',
          neighborhood: 'Test'
        },
        payment_method: 'cash'
      };

      const createResponse = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      const orderId = createResponse.body.data.id;

      // Obtener la orden por ID
      const orderResponse = await request(app)
        .get(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const order = orderResponse.body.data;

      // Validar relaciones
      expect(order.restaurant.id).toBe(testRestaurant.id);
      expect(order.restaurant.name).toBe(testRestaurant.name);
      expect(Array.isArray(order.items)).toBe(true);
      expect(order.items.length).toBeGreaterThan(0);

      const orderItem = order.items[0];
      expect(orderItem.menu_item_id).toBe(testMenuItem.id);
      expect(orderItem.menu_item.name).toBe(testMenuItem.name);
      expect(orderItem.quantity).toBe(1);
    });
  });
});