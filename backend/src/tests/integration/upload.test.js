// backend/src/tests/integration/upload.test.js
const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../../app-db.js');

describe('Upload Routes Integration Tests', () => {
  let server;
  let authToken;

  beforeAll(async () => {
    // Crear servidor de prueba
    server = app.listen(0); // Puerto aleatorio
    
    // Crear usuario de prueba y obtener token
    const userResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'testupload@example.com',
        password: 'Test123456',
        name: 'Test Upload User',
        phone: '+573001234567'
      });
    
    authToken = userResponse.body.data?.token;
  });

  afterAll(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
    
    // Limpiar archivos de prueba
    const testDirs = [
      path.join(__dirname, '../../../uploads/images/restaurants'),
      path.join(__dirname, '../../../uploads/images/products'),
      path.join(__dirname, '../../../uploads/images/temp')
    ];
    
    testDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          if (file.includes('test-') || file.includes('mock-')) {
            fs.unlinkSync(path.join(dir, file));
          }
        });
      }
    });
  });

  describe('POST /api/v1/upload/restaurant-image', () => {
    it('debe rechazar archivos sin imagen', async () => {
      const response = await request(app)
        .post('/api/v1/upload/restaurant-image')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('No se proporcionó imagen');
    });

    it('debe rechazar archivos con formato no permitido', async () => {
      const response = await request(app)
        .post('/api/v1/upload/restaurant-image')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', Buffer.from('fake pdf content'), {
          filename: 'test.pdf',
          contentType: 'application/pdf'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Tipo de archivo no permitido');
    });

    it('debe cargar y optimizar imagen de restaurante exitosamente', async () => {
      // Crear un buffer de imagen JPEG válida
      const validJpegBuffer = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
        0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
        0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
        0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
        0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xD9
      ]);

      const response = await request(app)
        .post('/api/v1/upload/restaurant-image')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', validJpegBuffer, {
          filename: 'test-restaurant.jpg',
          contentType: 'image/jpeg'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('urls');
      expect(response.body.data.urls).toHaveProperty('original');
      expect(response.body.data.urls).toHaveProperty('optimized');
      expect(response.body.data.urls).toHaveProperty('thumbnail');
      expect(response.body.data).toHaveProperty('mimetype', 'image/jpeg');
    });

    it('debe rechazar archivos muy grandes', async () => {
      // Crear un buffer de 6MB (más del límite de 5MB)
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
      
      const response = await request(app)
        .post('/api/v1/upload/restaurant-image')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', largeBuffer, {
          filename: 'large-test.jpg',
          contentType: 'image/jpeg'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/upload/product-image', () => {
    it('debe cargar y optimizar imagen de producto exitosamente', async () => {
      // Crear un buffer de imagen PNG válida
      const validPngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
        0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
        0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
        0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ]);

      const response = await request(app)
        .post('/api/v1/upload/product-image')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', validPngBuffer, {
          filename: 'test-product.png',
          contentType: 'image/png'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('urls');
      expect(response.body.data.urls).toHaveProperty('original');
      expect(response.body.data.urls).toHaveProperty('optimized');
      expect(response.body.data.urls).toHaveProperty('thumbnail');
      expect(response.body.data).toHaveProperty('mimetype', 'image/png');
    });
  });

  describe('GET /api/v1/upload/status', () => {
    it('debe retornar estado del servicio de upload', async () => {
      const response = await request(app)
        .get('/api/v1/upload/status')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Servicio de upload funcionando correctamente');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/v1/upload/images/:type', () => {
    it('debe listar imágenes de restaurantes', async () => {
      const response = await request(app)
        .get('/api/v1/upload/images/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
    });

    it('debe listar imágenes de productos', async () => {
      const response = await request(app)
        .get('/api/v1/upload/images/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
    });

    it('debe manejar tipo de imagen inválido', async () => {
      const response = await request(app)
        .get('/api/v1/upload/images/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Middleware de fallback de imágenes', () => {
    it('debe servir placeholder para imágenes que no existen', async () => {
      const response = await request(app)
        .get('/uploads/images/restaurants/nonexistent.jpg')
        .expect(200);

      expect(response.headers['content-type']).toBe('image/png');
    });

    it('debe servir imagen existente normalmente', async () => {
      // Primero subir una imagen
      const validJpegBuffer = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
        0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
        0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
        0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
        0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xD9
      ]);

      const uploadResponse = await request(app)
        .post('/api/v1/upload/restaurant-image')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', validJpegBuffer, {
          filename: 'existing-test.jpg',
          contentType: 'image/jpeg'
        })
        .expect(200);

      const imageUrl = uploadResponse.body.data.urls.original;

      // Verificar que la imagen existe y se sirve correctamente
      const response = await request(app)
        .get(imageUrl)
        .expect(200);

      expect(response.headers['content-type']).toMatch(/image/);
    });
  });
});