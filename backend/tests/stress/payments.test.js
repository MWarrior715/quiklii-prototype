import http from 'http';
import { performance } from 'perf_hooks';

/**
 * Pruebas de estrés para el sistema de pagos
 * Simula carga real con múltiples usuarios concurrentes
 */

class StressTester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: []
    };
  }

  /**
   * Realizar una petición HTTP
   */
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();

      const req = http.request(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        timeout: 30000 // 30 segundos timeout
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          const responseTime = performance.now() - startTime;
          this.results.totalRequests++;
          this.results.responseTimes.push(responseTime);

          if (res.statusCode >= 200 && res.statusCode < 300) {
            this.results.successfulRequests++;
          } else {
            this.results.failedRequests++;
            this.results.errors.push({
              statusCode: res.statusCode,
              responseTime,
              url
            });
          }

          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(data || '{}'),
            responseTime
          });
        });
      });

      req.on('error', (error) => {
        const responseTime = performance.now() - startTime;
        this.results.totalRequests++;
        this.results.failedRequests++;
        this.results.errors.push({
          error: error.message,
          responseTime,
          url
        });
        reject(error);
      });

      req.on('timeout', () => {
        const responseTime = performance.now() - startTime;
        this.results.totalRequests++;
        this.results.failedRequests++;
        this.results.errors.push({
          error: 'Request timeout',
          responseTime,
          url
        });
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  /**
   * Simular login para obtener token de autenticación
   */
  async login() {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        body: {
          email: 'juan.perez@example.com',
          password: 'password123'
        }
      });

      if (response.data?.data?.token) {
        return response.data.data.token;
      } else {
        throw new Error('No se pudo obtener token de autenticación');
      }
    } catch (error) {
      console.error('Error en login:', error.message);
      throw error;
    }
  }

  /**
   * Obtener datos de prueba (restaurante y menú)
   */
  async getTestData(authToken) {
    try {
      const restaurantResponse = await this.makeRequest(`${this.baseUrl}/api/v1/restaurants`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      const menuResponse = await this.makeRequest(`${this.baseUrl}/api/v1/menu`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      return {
        restaurant: restaurantResponse.data?.data?.[0],
        menuItem: menuResponse.data?.data?.[0]
      };
    } catch (error) {
      console.error('Error obteniendo datos de prueba:', error.message);
      throw error;
    }
  }

  /**
   * Crear orden de prueba
   */
  async createTestOrder(authToken, restaurant, menuItem) {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/v1/orders`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          restaurant_id: restaurant.id,
          items: [{
            menu_item_id: menuItem.id,
            quantity: 1,
            notes: `Stress test order - ${Date.now()}`
          }],
          delivery_address: {
            street: 'Carrera 15 #123-45',
            city: 'Bogotá',
            neighborhood: 'Zona Rosa'
          },
          payment_method: 'card'
        }
      });

      return response.data?.data;
    } catch (error) {
      console.error('Error creando orden de prueba:', error.message);
      throw error;
    }
  }

  /**
   * Ejecutar prueba de estrés para creación de pagos
   */
  async stressTestPaymentCreation(concurrentUsers = 10, requestsPerUser = 5) {
    console.log(`🚀 Iniciando prueba de estrés: ${concurrentUsers} usuarios concurrentes, ${requestsPerUser} requests por usuario`);

    const startTime = performance.now();
    const promises = [];

    for (let user = 0; user < concurrentUsers; user++) {
      promises.push(this.simulateUserPaymentFlow(user, requestsPerUser));
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Error durante prueba de estrés:', error.message);
    }

    const totalTime = performance.now() - startTime;
    return this.generateReport('Payment Creation Stress Test', totalTime);
  }

  /**
   * Simular flujo completo de un usuario
   */
  async simulateUserPaymentFlow(userId, requestCount) {
    try {
      // 1. Login
      const authToken = await this.login();

      // 2. Obtener datos de prueba
      const { restaurant, menuItem } = await this.getTestData(authToken);

      if (!restaurant || !menuItem) {
        throw new Error(`Usuario ${userId}: No se pudieron obtener datos de prueba`);
      }

      // 3. Crear múltiples pagos
      for (let i = 0; i < requestCount; i++) {
        try {
          // Crear orden primero
          const order = await this.createTestOrder(authToken, restaurant, menuItem);

          // Crear pago
          await this.makeRequest(`${this.baseUrl}/api/v1/payments`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${authToken}` },
            body: {
              orderId: order.id,
              paymentMethod: 'card',
              provider: 'wompi'
            }
          });

          console.log(`✅ Usuario ${userId} - Request ${i + 1}/${requestCount} completado`);

          // Pequeña pausa entre requests para simular comportamiento real
          await this.sleep(Math.random() * 1000 + 500);

        } catch (error) {
          console.error(`❌ Usuario ${userId} - Request ${i + 1} falló:`, error.message);
        }
      }

    } catch (error) {
      console.error(`❌ Usuario ${userId} falló completamente:`, error.message);
    }
  }

  /**
   * Ejecutar prueba de estrés para consulta de pagos
   */
  async stressTestPaymentQueries(concurrentUsers = 20, queriesPerUser = 10) {
    console.log(`🔍 Iniciando prueba de estrés para consultas: ${concurrentUsers} usuarios, ${queriesPerUser} consultas por usuario`);

    const startTime = performance.now();
    const promises = [];

    for (let user = 0; user < concurrentUsers; user++) {
      promises.push(this.simulateUserQueries(user, queriesPerUser));
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Error durante prueba de consultas:', error.message);
    }

    const totalTime = performance.now() - startTime;
    return this.generateReport('Payment Queries Stress Test', totalTime);
  }

  /**
   * Simular consultas de un usuario
   */
  async simulateUserQueries(userId, queryCount) {
    try {
      const authToken = await this.login();

      for (let i = 0; i < queryCount; i++) {
        try {
          // Consulta paginada aleatoria
          const page = Math.floor(Math.random() * 3) + 1;
          const limit = Math.floor(Math.random() * 10) + 5;

          await this.makeRequest(`${this.baseUrl}/api/v1/payments?page=${page}&limit=${limit}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });

          console.log(`🔍 Usuario ${userId} - Consulta ${i + 1}/${queryCount} completada`);

          // Pausa entre consultas
          await this.sleep(Math.random() * 500 + 200);

        } catch (error) {
          console.error(`❌ Usuario ${userId} - Consulta ${i + 1} falló:`, error.message);
        }
      }

    } catch (error) {
      console.error(`❌ Usuario ${userId} falló en consultas:`, error.message);
    }
  }

  /**
   * Ejecutar prueba de estrés para webhooks
   */
  async stressTestWebhooks(webhookCount = 50) {
    console.log(`🪝 Iniciando prueba de estrés para webhooks: ${webhookCount} webhooks`);

    const startTime = performance.now();
    const promises = [];

    for (let i = 0; i < webhookCount; i++) {
      promises.push(this.simulateWebhook(i));
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Error durante prueba de webhooks:', error.message);
    }

    const totalTime = performance.now() - startTime;
    return this.generateReport('Webhook Stress Test', totalTime);
  }

  /**
   * Simular envío de webhook
   */
  async simulateWebhook(webhookId) {
    try {
      const webhookPayload = {
        transaction: {
          id: `stress-test-${webhookId}-${Date.now()}`,
          reference: `QUIKLII_stress_${webhookId}`,
          status: Math.random() > 0.3 ? 'APPROVED' : 'DECLINED',
          amount_in_cents: Math.floor(Math.random() * 100000) + 10000,
          currency: 'COP',
          payment_method: {
            type: ['CARD', 'NEQUI', 'BANCOLOMBIA_TRANSFER'][Math.floor(Math.random() * 3)]
          },
          customer_email: `stress-test-${webhookId}@example.com`,
          created_at: new Date().toISOString(),
          finalized_at: new Date().toISOString()
        },
        event: 'transaction.updated'
      };

      await this.makeRequest(`${this.baseUrl}/api/v1/payments/webhook/wompi`, {
        method: 'POST',
        body: webhookPayload
      });

      console.log(`🪝 Webhook ${webhookId} procesado`);

      // Pausa entre webhooks
      await this.sleep(Math.random() * 200 + 100);

    } catch (error) {
      console.error(`❌ Webhook ${webhookId} falló:`, error.message);
    }
  }

  /**
   * Generar reporte de resultados
   */
  generateReport(testName, totalTime) {
    const avgResponseTime = this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length;
    const minResponseTime = Math.min(...this.results.responseTimes);
    const maxResponseTime = Math.max(...this.results.responseTimes);

    const report = {
      testName,
      timestamp: new Date().toISOString(),
      duration: totalTime,
      summary: {
        totalRequests: this.results.totalRequests,
        successfulRequests: this.results.successfulRequests,
        failedRequests: this.results.failedRequests,
        successRate: ((this.results.successfulRequests / this.results.totalRequests) * 100).toFixed(2) + '%'
      },
      performance: {
        averageResponseTime: Math.round(avgResponseTime * 100) / 100 + 'ms',
        minResponseTime: Math.round(minResponseTime * 100) / 100 + 'ms',
        maxResponseTime: Math.round(maxResponseTime * 100) / 100 + 'ms',
        requestsPerSecond: Math.round((this.results.totalRequests / totalTime) * 1000 * 100) / 100
      },
      errors: this.results.errors.slice(0, 10) // Solo primeros 10 errores
    };

    console.log('\n📊 ' + '='.repeat(50));
    console.log(`📊 REPORTE DE PRUEBA: ${testName}`);
    console.log('📊 ' + '='.repeat(50));
    console.log(`⏱️  Duración total: ${Math.round(totalTime)}ms`);
    console.log(`📈 Requests totales: ${report.summary.totalRequests}`);
    console.log(`✅ Exitosos: ${report.summary.successfulRequests}`);
    console.log(`❌ Fallidos: ${report.summary.failedRequests}`);
    console.log(`🎯 Tasa de éxito: ${report.summary.successRate}`);
    console.log(`⚡ Tiempo promedio: ${report.performance.averageResponseTime}`);
    console.log(`🚀 Requests/segundo: ${report.performance.requestsPerSecond}`);
    console.log('📊 ' + '='.repeat(50) + '\n');

    return report;
  }

  /**
   * Utilidad para pausas
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
   * Función principal para ejecutar todas las pruebas
   */
async function runAllStressTests() {
  const tester = new StressTester();

  try {
    console.log('🚀 Iniciando suite completa de pruebas de estrés para pagos...\n');

    // Prueba 1: Creación de pagos con carga media
    const creationReport = await tester.stressTestPaymentCreation(5, 3);

    // Reset para nueva prueba
    tester.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: []
    };

    // Prueba 2: Consultas con alta concurrencia
    const queryReport = await tester.stressTestPaymentQueries(15, 8);

    // Reset para nueva prueba
    tester.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: []
    };

    // Prueba 3: Webhooks masivos
    const webhookReport = await tester.stressTestWebhooks(30);

    // Reporte consolidado
    const consolidatedReport = {
      timestamp: new Date().toISOString(),
      tests: {
        paymentCreation: creationReport,
        paymentQueries: queryReport,
        webhooks: webhookReport
      },
      overall: {
        totalRequests: creationReport.summary.totalRequests + queryReport.summary.totalRequests + webhookReport.summary.totalRequests,
        totalSuccessful: creationReport.summary.successfulRequests + queryReport.summary.successfulRequests + webhookReport.summary.successfulRequests,
        totalFailed: creationReport.summary.failedRequests + queryReport.summary.failedRequests + webhookReport.summary.failedRequests,
        overallSuccessRate: (((creationReport.summary.successfulRequests + queryReport.summary.successfulRequests + webhookReport.summary.successfulRequests) /
          (creationReport.summary.totalRequests + queryReport.summary.totalRequests + webhookReport.summary.totalRequests)) * 100).toFixed(2) + '%'
      }
    };

    console.log('🏆 REPORTE CONSOLIDADO');
    console.log('='.repeat(60));
    console.log(`📊 Tests ejecutados: 3`);
    console.log(`📈 Requests totales: ${consolidatedReport.overall.totalRequests}`);
    console.log(`✅ Total exitosos: ${consolidatedReport.overall.totalSuccessful}`);
    console.log(`❌ Total fallidos: ${consolidatedReport.overall.totalFailed}`);
    console.log(`🎯 Tasa de éxito general: ${consolidatedReport.overall.overallSuccessRate}`);
    console.log('='.repeat(60));

    return consolidatedReport;

  } catch (error) {
    console.error('❌ Error ejecutando pruebas de estrés:', error);
    throw error;
  }
}

/**
 * Ejecutar si es llamado directamente
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllStressTests()
    .then((report) => {
      console.log('✅ Pruebas de estrés completadas');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en pruebas de estrés:', error);
      process.exit(1);
    });
}

export default StressTester;
export { runAllStressTests };