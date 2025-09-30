import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Generador de reporte QA consolidado
 * Ejecuta pruebas de unidad, integración, estrés y genera reportes
 */

class QAReporter {
  constructor() {
    this.startTime = new Date();
    this.reportDir = 'qa-reports';
    this.coverageDir = 'coverage';

    // Crear directorio de reportes si no existe
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  /**
   * Ejecutar pruebas de Jest con cobertura
   */
  async runJestTests() {
    console.log('🧪 Ejecutando pruebas de Jest con cobertura...');

    try {
      // Ejecutar pruebas con cobertura
      execSync('npm run test:coverage', {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      // Leer archivo de cobertura generado
      const coverageSummaryPath = path.join(this.coverageDir, 'coverage-summary.json');

      if (fs.existsSync(coverageSummaryPath)) {
        const coverageData = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
        return this.parseCoverageData(coverageData);
      } else {
        console.warn('⚠️  Archivo de cobertura no encontrado');
        return null;
      }

    } catch (error) {
      console.error('❌ Error ejecutando pruebas de Jest:', error.message);
      return null;
    }
  }

  /**
   * Parsear datos de cobertura de Jest
   */
  parseCoverageData(coverageData) {
    const total = coverageData.total;

    return {
      lines: {
        covered: total.lines.covered,
        total: total.lines.total,
        percentage: total.lines.pct
      },
      functions: {
        covered: total.functions.covered,
        total: total.functions.total,
        percentage: total.functions.pct
      },
      branches: {
        covered: total.branches.covered,
        total: total.branches.total,
        percentage: total.branches.pct
      },
      statements: {
        covered: total.statements.covered,
        total: total.statements.total,
        percentage: total.statements.pct
      }
    };
  }

  /**
   * Ejecutar pruebas de estrés para pagos
   */
  async runPaymentStressTests() {
    console.log('💳 Ejecutando pruebas de estrés para pagos...');

    try {
      const stressTestPath = path.join('tests', 'stress', 'payments.test.js');

      // Ejecutar pruebas de estrés
      const output = execSync(`node ${stressTestPath}`, {
        encoding: 'utf8',
        cwd: process.cwd()
      });

      // Parsear salida JSON del reporte
      const reportMatch = output.match(/📊 REPORTE CONSOLIDADO([\s\S]*?)(?=\n\n|$)/);

      if (reportMatch) {
        try {
          // Intentar parsear como JSON si está disponible
          const jsonMatch = output.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          // Si no se puede parsear como JSON, devolver datos básicos
          return {
            summary: {
              totalRequests: 'N/A',
              successfulRequests: 'N/A',
              failedRequests: 'N/A',
              successRate: 'N/A'
            },
            performance: {
              averageResponseTime: 'N/A',
              requestsPerSecond: 'N/A'
            }
          };
        }
      }

      return null;

    } catch (error) {
      console.error('❌ Error ejecutando pruebas de estrés de pagos:', error.message);
      return null;
    }
  }

  /**
   * Ejecutar pruebas de estrés para WebSockets
   */
  async runWebSocketStressTests() {
    console.log('🔗 Ejecutando pruebas de estrés para WebSockets...');

    try {
      const stressTestPath = path.join('tests', 'stress', 'websockets.test.js');

      // Ejecutar pruebas de estrés
      const output = execSync(`node ${stressTestPath}`, {
        encoding: 'utf8',
        cwd: process.cwd()
      });

      // Parsear salida JSON del reporte
      const reportMatch = output.match(/🏆 REPORTE CONSOLIDADO DE WEBSOCKETS([\s\S]*?)(?=\n\n|$)/);

      if (reportMatch) {
        try {
          // Intentar parsear como JSON si está disponible
          const jsonMatch = output.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          // Si no se puede parsear como JSON, devolver datos básicos
          return {
            overall: {
              totalConnections: 'N/A',
              totalSuccessful: 'N/A',
              totalFailed: 'N/A',
              totalEvents: 'N/A',
              overallConnectionSuccessRate: 'N/A',
              overallEventSuccessRate: 'N/A'
            }
          };
        }
      }

      return null;

    } catch (error) {
      console.error('❌ Error ejecutando pruebas de estrés de WebSockets:', error.message);
      return null;
    }
  }

  /**
   * Obtener métricas del sistema
   */
  async getSystemMetrics() {
    console.log('📊 Obteniendo métricas del sistema...');

    try {
      // Obtener estadísticas básicas del proyecto
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

      // Contar archivos de prueba
      const testFiles = this.countTestFiles();

      // Obtener tamaño del proyecto
      const projectSize = await this.getProjectSize();

      return {
        project: {
          name: packageJson.name,
          version: packageJson.version,
          dependencies: Object.keys(packageJson.dependencies || {}).length,
          devDependencies: Object.keys(packageJson.devDependencies || {}).length
        },
        tests: {
          totalFiles: testFiles.total,
          integration: testFiles.integration,
          unit: testFiles.unit,
          stress: testFiles.stress
        },
        size: projectSize
      };

    } catch (error) {
      console.error('❌ Error obteniendo métricas del sistema:', error.message);
      return null;
    }
  }

  /**
   * Contar archivos de prueba
   */
  countTestFiles() {
    const count = {
      total: 0,
      integration: 0,
      unit: 0,
      stress: 0
    };

    try {
      // Buscar archivos de prueba en src/tests
      const testDir = path.join('src', 'tests');

      if (fs.existsSync(testDir)) {
        const files = fs.readdirSync(testDir, { recursive: true });

        files.forEach(file => {
          if (typeof file === 'string' && file.endsWith('.js')) {
            count.total++;

            if (file.includes('integration')) {
              count.integration++;
            } else if (file.includes('stress')) {
              count.stress++;
            } else {
              count.unit++;
            }
          }
        });
      }

      // Contar archivos de estrés en tests/stress
      const stressDir = path.join('tests', 'stress');
      if (fs.existsSync(stressDir)) {
        const stressFiles = fs.readdirSync(stressDir);
        count.stress += stressFiles.filter(file => file.endsWith('.js')).length;
      }

    } catch (error) {
      console.error('Error contando archivos de prueba:', error.message);
    }

    return count;
  }

  /**
   * Obtener tamaño del proyecto
   */
  async getProjectSize() {
    try {
      const { execSync } = await import('child_process');

      // Usar comando du para obtener tamaño (Unix/Linux/Mac)
      try {
        const sizeOutput = execSync('du -sb .', { encoding: 'utf8' });
        const size = parseInt(sizeOutput.split('\t')[0]);
        return {
          bytes: size,
          human: this.formatBytes(size)
        };
      } catch (error) {
        // Si falla du, calcular manualmente
        return this.calculateSizeManually();
      }

    } catch (error) {
      return this.calculateSizeManually();
    }
  }

  /**
   * Calcular tamaño manualmente
   */
  calculateSizeManually() {
    try {
      const size = {
        bytes: 0,
        files: 0,
        directories: 0
      };

      const calculateDirSize = (dirPath) => {
        if (!fs.existsSync(dirPath)) return;

        const items = fs.readdirSync(dirPath);

        items.forEach(item => {
          const itemPath = path.join(dirPath, item);
          const stats = fs.statSync(itemPath);

          if (stats.isDirectory()) {
            size.directories++;
            calculateDirSize(itemPath);
          } else if (stats.isFile()) {
            size.bytes += stats.size;
            size.files++;
          }
        });
      };

      calculateDirSize('.');

      return {
        bytes: size.bytes,
        files: size.files,
        directories: size.directories,
        human: this.formatBytes(size.bytes)
      };

    } catch (error) {
      return {
        bytes: 0,
        human: 'Desconocido'
      };
    }
  }

  /**
   * Formatear bytes a formato legible
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Generar reporte JSON
   */
  generateJSONReport(reportData) {
    const reportPath = path.join(this.reportDir, `qa-report-${Date.now()}.json`);

    const fullReport = {
      metadata: {
        generatedAt: new Date().toISOString(),
        duration: Date.now() - this.startTime.getTime(),
        version: '1.0.0'
      },
      ...reportData
    };

    fs.writeFileSync(reportPath, JSON.stringify(fullReport, null, 2));
    console.log(`📄 Reporte JSON generado: ${reportPath}`);

    return reportPath;
  }

  /**
   * Generar reporte HTML
   */
  generateHTMLReport(reportData) {
    const reportPath = path.join(this.reportDir, `qa-report-${Date.now()}.html`);

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte QA - Quiklii</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 30px;
        }
        .section {
            background: white;
            margin: 20px 0;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .metric {
            display: inline-block;
            margin: 10px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
            border-left: 4px solid #667eea;
            min-width: 150px;
        }
        .metric-label {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 5px;
        }
        .metric-value {
            font-size: 1.5em;
            font-weight: bold;
            color: #333;
        }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
        .status-good { background-color: #d4edda; border-color: #28a745; }
        .status-warning { background-color: #fff3cd; border-color: #ffc107; }
        .status-poor { background-color: #f8d7da; border-color: #dc3545; }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .chart-placeholder {
            height: 200px;
            background: #e9ecef;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c757d;
        }
        .timestamp {
            color: #6c757d;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Reporte QA - Quiklii</h1>
        <p class="timestamp">Generado el: ${new Date().toLocaleString('es-CO')}</p>
        <p>Duración del análisis: ${Math.round((Date.now() - this.startTime.getTime()) / 1000)} segundos</p>
    </div>

    ${this.generateCoverageSection(reportData.coverage)}
    ${this.generateStressTestSection(reportData.stressTests)}
    ${this.generateSystemMetricsSection(reportData.systemMetrics)}
    ${this.generateRecommendationsSection(reportData)}

    <div class="section">
        <h2>📈 Resumen Ejecutivo</h2>
        <div class="grid">
            <div class="metric ${this.getStatusClass(reportData.coverage?.statements?.percentage || 0)}">
                <div class="metric-label">Cobertura de Código</div>
                <div class="metric-value">${reportData.coverage?.statements?.percentage?.toFixed(1) || 'N/A'}%</div>
            </div>
            <div class="metric ${this.getStatusClass(reportData.stressTests?.payments?.summary?.successRate || 0)}">
                <div class="metric-label">Éxito en Pagos</div>
                <div class="metric-value">${reportData.stressTests?.payments?.summary?.successRate || 'N/A'}</div>
            </div>
            <div class="metric ${this.getStatusClass(reportData.stressTests?.websockets?.overall?.overallConnectionSuccessRate || 0)}">
                <div class="metric-label">Éxito en WebSockets</div>
                <div class="metric-value">${reportData.stressTests?.websockets?.overall?.overallConnectionSuccessRate || 'N/A'}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Archivos de Prueba</div>
                <div class="metric-value">${reportData.systemMetrics?.tests?.total || 0}</div>
            </div>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(reportPath, html);
    console.log(`🌐 Reporte HTML generado: ${reportPath}`);

    return reportPath;
  }

  /**
   * Generar sección de cobertura
   */
  generateCoverageSection(coverage) {
    if (!coverage) return '';

    return `
    <div class="section">
        <h2>🧪 Cobertura de Código</h2>
        <div class="grid">
            <div class="metric ${this.getStatusClass(coverage.lines.percentage)}">
                <div class="metric-label">Líneas</div>
                <div class="metric-value">${coverage.lines.covered}/${coverage.lines.total} (${coverage.lines.percentage}%)</div>
            </div>
            <div class="metric ${this.getStatusClass(coverage.functions.percentage)}">
                <div class="metric-label">Funciones</div>
                <div class="metric-value">${coverage.functions.covered}/${coverage.functions.total} (${coverage.functions.percentage}%)</div>
            </div>
            <div class="metric ${this.getStatusClass(coverage.branches.percentage)}">
                <div class="metric-label">Ramas</div>
                <div class="metric-value">${coverage.branches.covered}/${coverage.branches.total} (${coverage.branches.percentage}%)</div>
            </div>
            <div class="metric ${this.getStatusClass(coverage.statements.percentage)}">
                <div class="metric-label">Declaraciones</div>
                <div class="metric-value">${coverage.statements.covered}/${coverage.statements.total} (${coverage.statements.percentage}%)</div>
            </div>
        </div>
        <div class="chart-placeholder">
            Gráfico de cobertura (sería generado por herramienta de visualización)
        </div>
    </div>`;
  }

  /**
   * Generar sección de pruebas de estrés
   */
  generateStressTestSection(stressTests) {
    if (!stressTests) return '';

    return `
    <div class="section">
        <h2>⚡ Pruebas de Estrés</h2>

        <h3>💳 Sistema de Pagos</h3>
        <div class="grid">
            <div class="metric ${this.getStatusClass(stressTests.payments?.summary?.successRate)}">
                <div class="metric-label">Tasa de Éxito</div>
                <div class="metric-value">${stressTests.payments?.summary?.successRate || 'N/A'}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Requests Totales</div>
                <div class="metric-value">${stressTests.payments?.summary?.totalRequests || 'N/A'}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Tiempo Promedio</div>
                <div class="metric-value">${stressTests.payments?.performance?.averageResponseTime || 'N/A'}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Requests/Segundo</div>
                <div class="metric-value">${stressTests.payments?.performance?.requestsPerSecond || 'N/A'}</div>
            </div>
        </div>

        <h3>🔗 Sistema de WebSockets</h3>
        <div class="grid">
            <div class="metric ${this.getStatusClass(stressTests.websockets?.overall?.overallConnectionSuccessRate)}">
                <div class="metric-label">Éxito Conexiones</div>
                <div class="metric-value">${stressTests.websockets?.overall?.overallConnectionSuccessRate || 'N/A'}</div>
            </div>
            <div class="metric ${this.getStatusClass(stressTests.websockets?.overall?.overallEventSuccessRate)}">
                <div class="metric-label">Éxito Eventos</div>
                <div class="metric-value">${stressTests.websockets?.overall?.overallEventSuccessRate || 'N/A'}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Conexiones Totales</div>
                <div class="metric-value">${stressTests.websockets?.overall?.totalConnections || 'N/A'}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Eventos Totales</div>
                <div class="metric-value">${stressTests.websockets?.overall?.totalEvents || 'N/A'}</div>
            </div>
        </div>
    </div>`;
  }

  /**
   * Generar sección de métricas del sistema
   */
  generateSystemMetricsSection(systemMetrics) {
    if (!systemMetrics) return '';

    return `
    <div class="section">
        <h2>📊 Métricas del Sistema</h2>
        <div class="grid">
            <div class="metric">
                <div class="metric-label">Proyecto</div>
                <div class="metric-value">${systemMetrics.project?.name || 'N/A'}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Versión</div>
                <div class="metric-value">${systemMetrics.project?.version || 'N/A'}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Dependencias</div>
                <div class="metric-value">${systemMetrics.project?.dependencies || 0}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Dev Dependencies</div>
                <div class="metric-value">${systemMetrics.project?.devDependencies || 0}</div>
            </div>
        </div>

        <h3>📁 Archivos de Prueba</h3>
        <div class="grid">
            <div class="metric">
                <div class="metric-label">Total</div>
                <div class="metric-value">${systemMetrics.tests?.total || 0}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Integración</div>
                <div class="metric-value">${systemMetrics.tests?.integration || 0}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Unidad</div>
                <div class="metric-value">${systemMetrics.tests?.unit || 0}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Estrés</div>
                <div class="metric-value">${systemMetrics.tests?.stress || 0}</div>
            </div>
        </div>

        <h3>💾 Tamaño del Proyecto</h3>
        <div class="grid">
            <div class="metric">
                <div class="metric-label">Tamaño Total</div>
                <div class="metric-value">${systemMetrics.size?.human || 'N/A'}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Archivos</div>
                <div class="metric-value">${systemMetrics.size?.files || 0}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Directorios</div>
                <div class="metric-value">${systemMetrics.size?.directories || 0}</div>
            </div>
        </div>
    </div>`;
  }

  /**
   * Generar sección de recomendaciones
   */
  generateRecommendationsSection(reportData) {
    const recommendations = [];

    // Recomendaciones basadas en cobertura
    if (reportData.coverage?.statements?.percentage < 80) {
      recommendations.push("🔍 Considerar aumentar cobertura de código agregando más pruebas unitarias");
    }

    // Recomendaciones basadas en pruebas de estrés
    if (reportData.stressTests?.payments?.summary?.successRate < 95) {
      recommendations.push("⚡ Revisar rendimiento del sistema de pagos bajo carga alta");
    }

    if (reportData.stressTests?.websockets?.overall?.overallConnectionSuccessRate < 95) {
      recommendations.push("🔗 Mejorar estabilidad de conexiones WebSocket");
    }

    // Recomendaciones generales
    if (reportData.systemMetrics?.tests?.total < 10) {
      recommendations.push("📝 Considerar agregar más casos de prueba para mejor cobertura");
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ ¡Excelente trabajo! Todas las métricas están dentro de parámetros aceptables");
    }

    return `
    <div class="section">
        <h2>💡 Recomendaciones</h2>
        <ul>
            ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>`;
  }

  /**
   * Obtener clase de estado basada en porcentaje
   */
  getStatusClass(percentage) {
    if (typeof percentage === 'string') {
      if (percentage.includes('%')) {
        percentage = parseFloat(percentage);
      } else {
        return '';
      }
    }

    if (percentage >= 90) return 'status-good';
    if (percentage >= 70) return 'status-warning';
    return 'status-poor';
  }

  /**
   * Ejecutar reporte completo
   */
  async generateFullReport() {
    console.log('🚀 Iniciando generación de reporte QA completo...\n');

    // Ejecutar todas las pruebas y recopilar datos
    const [coverage, paymentStress, websocketStress, systemMetrics] = await Promise.all([
      this.runJestTests(),
      this.runPaymentStressTests(),
      this.runWebSocketStressTests(),
      this.getSystemMetrics()
    ]);

    // Crear reporte consolidado
    const reportData = {
      coverage,
      stressTests: {
        payments: paymentStress,
        websockets: websocketStress
      },
      systemMetrics
    };

    // Generar archivos de reporte
    const jsonReportPath = this.generateJSONReport(reportData);
    const htmlReportPath = this.generateHTMLReport(reportData);

    console.log('\n🎉 ¡Reporte QA generado exitosamente!');
    console.log(`📄 JSON: ${jsonReportPath}`);
    console.log(`🌐 HTML: ${htmlReportPath}`);

    return {
      jsonPath: jsonReportPath,
      htmlPath: htmlReportPath,
      data: reportData
    };
  }
}

/**
 * Función principal
 */
async function main() {
  try {
    const reporter = new QAReporter();
    const result = await reporter.generateFullReport();

    console.log('\n📋 Resumen del reporte generado:');
    console.log(`- Cobertura de código: ${result.data.coverage?.statements?.percentage?.toFixed(1) || 'N/A'}%`);
    console.log(`- Éxito en pruebas de pagos: ${result.data.stressTests?.payments?.summary?.successRate || 'N/A'}`);
    console.log(`- Éxito en pruebas de WebSockets: ${result.data.stressTests?.websockets?.overall?.overallConnectionSuccessRate || 'N/A'}`);
    console.log(`- Total de archivos de prueba: ${result.data.systemMetrics?.tests?.total || 0}`);

    return result;

  } catch (error) {
    console.error('❌ Error generando reporte QA:', error);
    process.exit(1);
  }
}

/**
 * Ejecutar si es llamado directamente
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => {
      console.log('✅ Reporte QA completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en reporte QA:', error);
      process.exit(1);
    });
}

export default QAReporter;
export { main as generateQAReport };