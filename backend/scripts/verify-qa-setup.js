import fs from 'fs';
import path from 'path';

/**
 * Script de verificación para el setup de QA
 * Verifica que todos los archivos estén en su lugar y las dependencias instaladas
 */

class QASetupVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
  }

  /**
   * Verificar estructura de archivos
   */
  verifyFileStructure() {
    console.log('📁 Verificando estructura de archivos...');

    // Verificar archivos principales de QA
    const requiredFiles = [
      'package.json',
      'jest.config.js',
      'tests/stress/payments.test.js',
      'tests/stress/websockets.test.js',
      'scripts/qa-report.js'
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        this.success.push(`✅ Archivo encontrado: ${file}`);
      } else {
        this.errors.push(`❌ Archivo faltante: ${file}`);
      }
    });

    // Verificar directorios
    const requiredDirs = [
      'tests',
      'tests/stress',
      'scripts',
      'src/tests'
    ];

    requiredDirs.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      if (fs.existsSync(dirPath)) {
        this.success.push(`✅ Directorio encontrado: ${dir}`);
      } else {
        this.errors.push(`❌ Directorio faltante: ${dir}`);
      }
    });
  }

  /**
   * Verificar configuración de package.json
   */
  verifyPackageJson() {
    console.log('📦 Verificando configuración de package.json...');

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

      // Verificar scripts de QA
      const requiredScripts = [
        'test',
        'stress:payments',
        'stress:websockets',
        'qa'
      ];

      requiredScripts.forEach(script => {
        if (packageJson.scripts && packageJson.scripts[script]) {
          this.success.push(`✅ Script encontrado: ${script}`);
        } else {
          this.errors.push(`❌ Script faltante: ${script}`);
        }
      });

      // Verificar dependencias críticas
      const criticalDeps = [
        'jest',
        'socket.io-client',
        'autocannon'
      ];

      if (packageJson.devDependencies) {
        criticalDeps.forEach(dep => {
          if (packageJson.devDependencies[dep]) {
            this.success.push(`✅ Dependencia encontrada: ${dep}`);
          } else {
            this.warnings.push(`⚠️  Dependencia faltante: ${dep} (puede requerir instalación manual)`);
          }
        });
      }

    } catch (error) {
      this.errors.push(`❌ Error leyendo package.json: ${error.message}`);
    }
  }

  /**
   * Verificar contenido de archivos críticos
   */
  verifyFileContents() {
    console.log('📄 Verificando contenido de archivos...');

    // Verificar que los archivos de estrés tengan contenido básico
    const stressFiles = [
      'tests/stress/payments.test.js',
      'tests/stress/websockets.test.js'
    ];

    stressFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.length > 100) { // Verificar que tenga contenido mínimo
          this.success.push(`✅ Archivo válido: ${file}`);
        } else {
          this.errors.push(`❌ Archivo vacío o muy pequeño: ${file}`);
        }
      } catch (error) {
        this.errors.push(`❌ Error leyendo archivo ${file}: ${error.message}`);
      }
    });

    // Verificar que el reporte tenga funciones críticas
    try {
      const reportContent = fs.readFileSync('scripts/qa-report.js', 'utf8');
      if (reportContent.includes('generateFullReport') && reportContent.includes('runJestTests')) {
        this.success.push('✅ Generador de reporte válido');
      } else {
        this.errors.push('❌ Generador de reporte incompleto');
      }
    } catch (error) {
      this.errors.push(`❌ Error leyendo generador de reporte: ${error.message}`);
    }
  }

  /**
   * Verificar permisos de ejecución
   */
  verifyPermissions() {
    console.log('🔐 Verificando permisos...');

    const executableFiles = [
      'scripts/qa-report.js',
      'tests/stress/payments.test.js',
      'tests/stress/websockets.test.js'
    ];

    executableFiles.forEach(file => {
      try {
        fs.accessSync(file, fs.constants.R_OK);
        this.success.push(`✅ Permisos de lectura OK: ${file}`);
      } catch (error) {
        this.errors.push(`❌ Sin permisos de lectura: ${file}`);
      }
    });
  }

  /**
   * Ejecutar todas las verificaciones
   */
  runAllChecks() {
    console.log('🚀 Iniciando verificación completa del setup de QA...\n');

    this.verifyFileStructure();
    this.verifyPackageJson();
    this.verifyFileContents();
    this.verifyPermissions();

    this.printResults();
  }

  /**
   * Imprimir resultados de verificación
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESULTADOS DE VERIFICACIÓN');
    console.log('='.repeat(60));

    if (this.success.length > 0) {
      console.log('\n✅ ÉXITOS:');
      this.success.forEach(msg => console.log(`  ${msg}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  ADVERTENCIAS:');
      this.warnings.forEach(msg => console.log(`  ${msg}`));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORES:');
      this.errors.forEach(msg => console.log(`  ${msg}`));
    }

    console.log('\n' + '='.repeat(60));

    // Resumen
    const totalChecks = this.success.length + this.warnings.length + this.errors.length;
    const successRate = ((this.success.length + this.warnings.length) / totalChecks * 100).toFixed(1);

    console.log(`📊 Resumen: ${successRate}% éxito (${this.success.length + this.warnings.length}/${totalChecks} checks)`);

    if (this.errors.length === 0) {
      console.log('🎉 ¡Setup de QA verificado exitosamente!');
      console.log('\n📚 Comandos disponibles:');
      console.log('  npm run test              # Ejecutar pruebas con cobertura');
      console.log('  npm run stress:payments   # Pruebas de estrés para pagos');
      console.log('  npm run stress:websockets # Pruebas de estrés para WebSockets');
      console.log('  npm run qa               # Ejecutar suite completa de QA');
    } else {
      console.log('⚠️  Se encontraron errores que deben ser corregidos antes de usar el sistema de QA');
    }

    console.log('='.repeat(60));
  }
}

/**
 * Función principal
 */
function main() {
  const verifier = new QASetupVerifier();
  verifier.runAllChecks();
}

/**
 * Ejecutar si es llamado directamente
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default QASetupVerifier;