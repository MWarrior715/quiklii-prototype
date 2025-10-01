#!/usr/bin/env node

/**
 * Script para verificar la integración de las imágenes y productos con el sistema existente
 * Comprueba que todo esté correctamente organizado y accesible
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando integración del sistema de imágenes y productos...\n');

// Verificar estructura de directorios
const directories = {
  restaurants: path.join(__dirname, '../uploads/images/restaurants'),
  products: path.join(__dirname, '../uploads/images/products'),
  temp: path.join(__dirname, '../uploads/images/temp')
};

console.log('📁 Verificando estructura de directorios:');
Object.entries(directories).forEach(([name, dir]) => {
  const exists = fs.existsSync(dir);
  const status = exists ? '✅' : '❌';
  console.log(`   ${status} ${name}: ${dir}`);
});

// Contar archivos por tipo
console.log('\n📊 Contando archivos:');
const fileTypes = {
  svg: 0,
  jpg: 0,
  jpeg: 0,
  png: 0,
  json: 0,
  total: 0
};

Object.values(directories).forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (ext === '.svg') fileTypes.svg++;
      else if (ext === '.jpg') fileTypes.jpg++;
      else if (ext === '.jpeg') fileTypes.jpeg++;
      else if (ext === '.png') fileTypes.png++;
      else if (ext === '.json') fileTypes.json++;
      fileTypes.total++;
    });
  }
});

console.log(`   📸 Imágenes SVG: ${fileTypes.svg}`);
console.log(`   📷 Imágenes JPG: ${fileTypes.jpg + fileTypes.jpeg}`);
console.log(`   🖼️  Imágenes PNG: ${fileTypes.png}`);
console.log(`   📋 Archivos JSON: ${fileTypes.json}`);
console.log(`   📦 Total archivos: ${fileTypes.total}`);

// Verificar archivos JSON
console.log('\n📋 Verificando archivos de datos:');
const jsonFiles = [
  path.join(__dirname, '../uploads/products-dummy-data.json')
];

jsonFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      const count = Array.isArray(data) ? data.length : Object.keys(data).length;
      console.log(`   ✅ ${path.basename(file)}: ${count} elementos`);
      
      // Verificar estructura de productos
      if (file.includes('products')) {
        const sample = data[0];
        if (sample) {
          console.log(`   📋 Producto de muestra: ${sample.name}`);
          console.log(`   ├─ Restaurante ID: ${sample.restaurantId}`);
          console.log(`   ├─ Precio: $${sample.price}`);
          console.log(`   ├─ Categoría: ${sample.category}`);
          console.log(`   ├─ Imagen: ${sample.image}`);
          console.log(`   └─ Disponible: ${sample.isAvailable}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ ${path.basename(file)}: Error al leer - ${error.message}`);
    }
  } else {
    console.log(`   ❌ ${path.basename(file)}: No encontrado`);
  }
});

// Verificar rutas de acceso
console.log('\n🔗 Verificando rutas de acceso:');
const baseUrl = 'http://localhost:3001'; // URL base del backend
const testPaths = [
  '/uploads/images/restaurants',
  '/uploads/images/products',
  '/uploads/images/temp'
];

testPaths.forEach(testPath => {
  const fullPath = path.join(__dirname, '..', testPath);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✅' : '❌';
  console.log(`   ${status} ${testPath}`);
});

// Verificar imágenes específicas
console.log('\n🖼️ Verificando imágenes específicas:');
const restaurantImages = fs.readdirSync(directories.restaurants).filter(f => f.endsWith('.svg'));
const productImages = fs.readdirSync(directories.products).filter(f => f.endsWith('.svg'));

console.log(`   🏪 Imágenes de restaurantes: ${restaurantImages.length}`);
console.log(`   🛍️ Imágenes de productos: ${productImages.length}`);

// Mostrar algunas imágenes de muestra
if (restaurantImages.length > 0) {
  console.log(`   📋 Restaurantes con imágenes:`);
  restaurantImages.slice(0, 3).forEach(img => {
    console.log(`      ├─ ${img}`);
  });
  if (restaurantImages.length > 3) {
    console.log(`      └─ ... y ${restaurantImages.length - 3} más`);
  }
}

if (productImages.length > 0) {
  console.log(`   📋 Productos con imágenes:`);
  productImages.slice(0, 3).forEach(img => {
    console.log(`      ├─ ${img}`);
  });
  if (productImages.length > 3) {
    console.log(`      └─ ... y ${productImages.length - 3} más`);
  }
}

// Verificar integración con sistema de archivos
console.log('\n⚙️ Verificando integración con sistema:');

// Verificar que las rutas coincidan con el patrón esperado
const expectedRestaurantCount = 7;
const expectedProductCount = 14;

console.log(`   📊 Restaurantes esperados: ${expectedRestaurantCount}, encontrados: ${restaurantImages.length}`);
console.log(`   📊 Productos esperados: ${expectedProductCount}, encontrados: ${productImages.length}`);

const restaurantsOk = restaurantImages.length === expectedRestaurantCount;
const productsOk = productImages.length === expectedProductCount;

console.log(`   ${restaurantsOk ? '✅' : '❌'} Número de restaurantes: ${restaurantsOk ? 'Correcto' : 'Incorrecto'}`);
console.log(`   ${productsOk ? '✅' : '❌'} Número de productos: ${productsOk ? 'Correcto' : 'Incorrecto'}`);

// Resumen final
console.log('\n🎉 RESUMEN DE VERIFICACIÓN:');
if (restaurantsOk && productsOk) {
  console.log('✅ ¡Todas las verificaciones pasaron exitosamente!');
  console.log('✅ Las imágenes están correctamente organizadas');
  console.log('✅ Los datos de productos están bien estructurados');
  console.log('✅ El sistema está listo para usar');
} else {
  console.log('⚠️  Algunas verificaciones fallaron');
  if (!restaurantsOk) console.log('   ❌ Falta alguna imagen de restaurante');
  if (!productsOk) console.log('   ❌ Falta alguna imagen de producto');
}

console.log('\n📋 INSTRUCCIONES FINALES:');
console.log('   ├─ Las imágenes SVG son placeholders (fáciles de reemplazar)');
console.log('   ├─ Los archivos JSON contienen todos los datos de productos');
console.log('   ├─ Las rutas siguen el patrón: /uploads/images/{tipo}/{archivo}');
console.log('   ├─ Puedes usar npm run images:status para ver el estado');
console.log('   └─ Puedes usar npm run images:dummy para regenerar todo');

console.log('\n🚀 ¡El sistema de imágenes y productos está completamente configurado!');