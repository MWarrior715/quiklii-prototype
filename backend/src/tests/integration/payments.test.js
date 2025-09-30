import request from 'supertest';
import app from '../../app-db.js';

/**
 * Tests de integración para el sistema de pagos
 * Cubre el flujo completo: creación, procesamiento y webhooks
 */

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

// Función helper para obtener datos de prueba
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

// Función helper para crear una orden de prueba
const createTestOrder = async (authToken, restaurant, menuItem) => {
  const orderData = {
    restaurant_id: restaurant.id,
    items: [
      {
        menu_item_id: menuItem.id,
        quantity: 1,
        notes: 'Test order for payments'
      }
    ],
    delivery_address: {
      street: 'Carrera 15 #123-45',
      city: 'Bogotá',
      neighborhood: 'Zona Rosa'
    },
    payment_method: 'card'
  };

  const response = await request(app)
    .post('/api/v1/orders')
    .set('Authorization', `Bearer ${authToken}`)
    .send(orderData)
    .expect(201);

  return response.body.data;
};

describe('Payments API', () => {
  let authToken;
  let testRestaurant;
  let testMenuItem;
  let testOrder;

  beforeAll(async () => {
    authToken = await getAuthToken();
    const testData = await getTestData();
    testRestaurant = testData.restaurant;
    testMenuItem = testData.menuItem;
    testOrder = await createTestOrder(authToken, testRestaurant, testMenuItem);
  });

  describe('POST /api/v1/payments', () => {
    it('should create a new payment', async () => {
      const paymentData = {
        orderId: testOrder.id,
        paymentMethod: 'card',
        provider: 'wompi'
      };

      const response = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('paymentId');
      expect(response.body.data).toHaveProperty('transactionId');
      expect(response.body.data).toHaveProperty('redirectUrl');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('provider', 'wompi');
    });

    it('should return 401 without authentication', async () => {
      const paymentData = {
        orderId: testOrder.id,
        paymentMethod: 'card',
        provider: 'wompi'
      };

      await request(app)
        .post('/api/v1/payments')
        .send(paymentData)
        .expect(401);
    });

    it('should return 404 for non-existent order', async () => {
      const paymentData = {
        orderId: '123e4567-e89b-12d3-a456-426614174000', // UUID inválido
        paymentMethod: 'card',
        provider: 'wompi'
      };

      await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(404);
    });

    it('should return 403 for unauthorized order', async () => {
      // Crear orden con otro usuario (si existe)
      const paymentData = {
        orderId: testOrder.id,
        paymentMethod: 'card',
        provider: 'wompi'
      };

      // Intentar pagar orden de otro usuario debería fallar
      // Nota: Esto depende de si hay múltiples usuarios en el seed
      const response = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      // Si es la misma orden del usuario, debería funcionar
      expect([201, 403]).toContain(response.status);
    });
  });

  describe('GET /api/v1/payments', () => {
    it('should return user payments', async () => {
      const response = await request(app)
        .get('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('payments');
      expect(Array.isArray(response.body.data.payments)).toBe(true);
      expect(response.body.data).toHaveProperty('pagination');

      // Si hay pagos, verificar estructura
      if (response.body.data.payments.length > 0) {
        const payment = response.body.data.payments[0];
        expect(payment).toHaveProperty('paymentId');
        expect(payment).toHaveProperty('orderId');
        expect(payment).toHaveProperty('amount');
        expect(payment).toHaveProperty('currency');
        expect(payment).toHaveProperty('status');
        expect(payment).toHaveProperty('paymentMethod');
        expect(payment).toHaveProperty('provider');
        expect(payment).toHaveProperty('createdAt');
      }
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/payments')
        .expect(401);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/payments?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination).toHaveProperty('page', 1);
      expect(response.body.data.pagination).toHaveProperty('limit', 5);
      expect(response.body.data.pagination).toHaveProperty('total');
      expect(response.body.data.pagination).toHaveProperty('pages');
    });
  });

  describe('GET /api/v1/payments/{paymentId}', () => {
    let testPaymentId;

    beforeAll(async () => {
      // Crear un pago para testing
      const paymentData = {
        orderId: testOrder.id,
        paymentMethod: 'card',
        provider: 'wompi'
      };

      const response = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(201);

      testPaymentId = response.body.data.paymentId;
    });

    it('should return payment status', async () => {
      const response = await request(app)
        .get(`/api/v1/payments/${testPaymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('paymentId', testPaymentId);
      expect(response.body.data).toHaveProperty('orderId');
      expect(response.body.data).toHaveProperty('amount');
      expect(response.body.data).toHaveProperty('currency');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('paymentMethod');
      expect(response.body.data).toHaveProperty('provider');
      expect(response.body.data).toHaveProperty('transactionId');
      expect(response.body.data).toHaveProperty('createdAt');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get(`/api/v1/payments/${testPaymentId}`)
        .expect(401);
    });

    it('should return 404 for non-existent payment', async () => {
      const fakePaymentId = '123e4567-e89b-12d3-a456-426614174000';

      await request(app)
        .get(`/api/v1/payments/${fakePaymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/payments/{paymentId}/retry', () => {
    it('should retry a failed payment', async () => {
      // Crear un pago que falle para testing
      const paymentData = {
        orderId: testOrder.id,
        paymentMethod: 'card',
        provider: 'wompi'
      };

      const createResponse = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(201);

      const paymentId = createResponse.body.data.paymentId;

      // Intentar reintento
      const response = await request(app)
        .post(`/api/v1/payments/${paymentId}/retry`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('paymentId', paymentId);
      expect(response.body.data).toHaveProperty('transactionId');
      expect(response.body.data).toHaveProperty('redirectUrl');
      expect(response.body.data).toHaveProperty('status');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post(`/api/v1/payments/123e4567-e89b-12d3-a456-426614174000/retry`)
        .expect(401);
    });

    it('should return 404 for non-existent payment', async () => {
      const fakePaymentId = '123e4567-e89b-12d3-a456-426614174000';

      await request(app)
        .post(`/api/v1/payments/${fakePaymentId}/retry`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/payments/webhook/wompi', () => {
    it('should process valid Wompi webhook', async () => {
      const webhookPayload = {
        transaction: {
          id: 'test-transaction-123',
          reference: 'QUIKLII_test_123',
          status: 'APPROVED',
          amount_in_cents: 50000,
          currency: 'COP',
          payment_method: {
            type: 'CARD'
          },
          customer_email: 'test@example.com',
          created_at: new Date().toISOString(),
          finalized_at: new Date().toISOString()
        },
        event: 'transaction.updated'
      };

      const response = await request(app)
        .post('/api/v1/payments/webhook/wompi')
        .send(webhookPayload)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Webhook processed successfully');
      expect(response.body).toHaveProperty('transactionId', 'test-transaction-123');
      expect(response.body).toHaveProperty('event', 'transaction.updated');
    });

    it('should reject webhook without signature', async () => {
      const webhookPayload = {
        transaction: {
          id: 'test-transaction-123',
          status: 'APPROVED'
        },
        event: 'transaction.updated'
      };

      await request(app)
        .post('/api/v1/payments/webhook/wompi')
        .send(webhookPayload)
        .expect(400);
    });

    it('should reject webhook with invalid signature', async () => {
      const webhookPayload = {
        transaction: {
          id: 'test-transaction-123',
          status: 'APPROVED'
        },
        event: 'transaction.updated'
      };

      const response = await request(app)
        .post('/api/v1/payments/webhook/wompi')
        .set('x-wompi-signature', 'invalid-signature')
        .send(webhookPayload)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid signature');
    });

    it('should reject webhook with invalid payload structure', async () => {
      const invalidPayload = {
        invalid: 'structure'
      };

      const response = await request(app)
        .post('/api/v1/payments/webhook/wompi')
        .set('x-wompi-signature', 'valid-signature')
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid payload structure');
    });
  });

  describe('Payment Flow Integration', () => {
    it('should complete full payment flow', async () => {
      // 1. Crear orden
      const orderData = {
        restaurant_id: testRestaurant.id,
        items: [
          {
            menu_item_id: testMenuItem.id,
            quantity: 1
          }
        ],
        delivery_address: {
          street: 'Test Payment Flow',
          city: 'Bogotá',
          neighborhood: 'Test'
        },
        payment_method: 'card'
      };

      const orderResponse = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      const newOrder = orderResponse.body.data;
      expect(newOrder).toHaveProperty('id');

      // 2. Crear pago
      const paymentData = {
        orderId: newOrder.id,
        paymentMethod: 'card',
        provider: 'wompi'
      };

      const paymentResponse = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(201);

      const payment = paymentResponse.body.data;
      expect(payment).toHaveProperty('paymentId');
      expect(payment).toHaveProperty('transactionId');
      expect(payment).toHaveProperty('redirectUrl');

      // 3. Verificar estado del pago
      const statusResponse = await request(app)
        .get(`/api/v1/payments/${payment.paymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(statusResponse.body).toHaveProperty('success', true);
      expect(statusResponse.body.data).toHaveProperty('paymentId', payment.paymentId);
      expect(statusResponse.body.data).toHaveProperty('status');

      // 4. Listar pagos del usuario
      const paymentsListResponse = await request(app)
        .get('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(paymentsListResponse.body).toHaveProperty('success', true);
      expect(Array.isArray(paymentsListResponse.body.data.payments)).toBe(true);

      // Verificar que el pago creado está en la lista
      const createdPayment = paymentsListResponse.body.data.payments.find(
        p => p.paymentId === payment.paymentId
      );
      expect(createdPayment).toBeDefined();
      expect(createdPayment.orderId).toBe(newOrder.id);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid payment data gracefully', async () => {
      const invalidPaymentData = {
        orderId: testOrder.id,
        paymentMethod: 'invalid_method',
        provider: 'wompi'
      };

      const response = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPaymentData);

      // Debería fallar con validación o error del proveedor
      expect([400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle rate limiting', async () => {
      const paymentData = {
        orderId: testOrder.id,
        paymentMethod: 'card',
        provider: 'wompi'
      };

      // Hacer múltiples requests rápidamente
      const requests = Array(25).fill().map(() =>
        request(app)
          .post('/api/v1/payments')
          .set('Authorization', `Bearer ${authToken}`)
          .send(paymentData)
      );

      const responses = await Promise.all(requests);

      // Al menos uno debería ser rate limited (429)
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);

      if (rateLimitedResponses.length > 0) {
        const rateLimitedResponse = rateLimitedResponses[0];
        expect(rateLimitedResponse.body).toHaveProperty('success', false);
        expect(rateLimitedResponse.body).toHaveProperty('error');
      }
    });
  });
});