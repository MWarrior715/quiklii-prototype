#!/usr/bin/env node

/**
 * Script para descargar imágenes específicas de alta calidad desde Unsplash
 * Imágenes reales y optimizadas para productos de restaurantes
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Imágenes específicas de alta calidad desde Unsplash
const HIGH_QUALITY_IMAGES = [
  // Pizzas
  {
    name: 'pizza-margarita-real',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    category: 'products'
  },
  {
    name: 'pizza-pepperoni',
    url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    category: 'products'
  },
  // Sushi
  {
    name: 'sushi-atun-fresco',
    url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    category: 'products'
  },
  {
    name: 'sushi-variedad',
    url: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    category: 'products'
  },
  // Hamburguesas
  {
    name: 'hamburguesa-doble',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    category: 'products'
  },
  {
    name: 'hamburguesa-queso',
    url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    category: 'products'
  },
  // Comida colombiana
  {
    name: 'bandeja-paisa',
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    category: 'products'
  },
  {
    name: 'sancocho-gallina',
    url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    category: 'products'
  },
  // Ensaladas y saludable
  {
    name: 'ensalada-fresca-verduras',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    category: 'products'
  },
  {
    name: 'bowl-quinoa-vegetal',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    category: 'products'
  },
  // Bebidas y cócteles
  {
    name: 'mojito-coctel',
    url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    category: 'products'
  },
  {
    name: 'cerveza-artesanal',
    url: 'https://images.unsplash.com/photo-1436076863939-06870fe779c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    category: 'products'
  },
  // Restaurantes
  {
    name: 'restaurante-italiano-interior',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'restaurants'
  },
  {
    name: 'restaurante-japones-moderno',
    url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'restaurants'
  },
  {
    name: 'restaurante-elegante-ambiente',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'restaurants'
  }
];

// Función para descargar imagen
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          const stats = fs.statSync(filename);
          const sizeKB = (stats.size / 1024).toFixed(2);
          console.log(`✅ Descargado: ${path.basename(filename)} (${sizeKB} KB)`);
          resolve(filename);
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        // Seguir redirección
        if (response.headers.location) {
          file.close();
          fs.unlinkSync(filename);
          downloadImage(response.headers.location, filename)
            .then(resolve)
            .catch(reject);
        } else {
          file.close();
          fs.unlinkSync(filename);
          reject(new Error('Redirección sin ubicación'));
        }
      } else {
        file.close();
        fs.unlinkSync(filename);
        reject(new Error(`Error HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
      }
      reject(err);
    });
  });
}

// Función para crear directorios
function createDirectories() {
  const dirs = [
    path.join(__dirname, '../uploads/images/products'),
    path.join(__dirname, '../uploads/images/restaurants')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Directorio creado: ${dir}`);
    }
  });
}

// Función principal
async function downloadSpecificImages() {
  console.log('🚀 Descargando imágenes específicas de alta calidad...\n');
  
  try {
    createDirectories();
    
    const productsDir = path.join(__dirname, '../uploads/images/products');
    const restaurantsDir = path.join(__dirname, '../uploads/images/restaurants');
    
    let successCount = 0;
    let failCount = 0;
    
    // Descargar imágenes de productos
    console.log('🍽️ Descargando imágenes de productos...\n');
    
    const productImages = HIGH_QUALITY_IMAGES.filter(img => img.category === 'products');
    
    for (const product of productImages) {
      const filename = `${product.name}.jpg`;
      const filepath = path.join(productsDir, filename);
      
      // Verificar si ya existe
      if (fs.existsSync(filepath)) {
        console.log(`⏭️ Saltando: ${product.name} (ya existe)`);
        successCount++;
        continue;
      }
      
      try {
        console.log(`⏬ Descargando: ${product.name}`);
        await downloadImage(product.url, filepath);
        successCount++;
      } catch (error) {
        console.error(`❌ Error: ${product.name} - ${error.message}`);
        failCount++;
      }
    }
    
    // Descargar imágenes de restaurantes
    console.log('\n🏪 Descargando imágenes de restaurantes...\n');
    
    const restaurantImages = HIGH_QUALITY_IMAGES.filter(img => img.category === 'restaurants');
    
    for (const restaurant of restaurantImages) {
      const filename = `${restaurant.name}.jpg`;
      const filepath = path.join(restaurantsDir, filename);
      
      // Verificar si ya existe
      if (fs.existsSync(filepath)) {
        console.log(`⏭️ Saltando: ${restaurant.name} (ya existe)`);
        successCount++;
        continue;
      }
      
      try {
        console.log(`⏬ Descargando: ${restaurant.name}`);
        await downloadImage(restaurant.url, filepath);
        successCount++;
      } catch (error) {
        console.error(`❌ Error: ${restaurant.name} - ${error.message}`);
        failCount++;
      }
    }
    
    // Verificación final
    const productFiles = fs.readdirSync(productsDir).filter(f => f.endsWith('.jpg'));
    const restaurantFiles = fs.readdirSync(restaurantsDir).filter(f => f.endsWith('.jpg'));
    
    console.log('\n📊 Resumen final:');
    console.log(`✅ Imágenes descargadas exitosamente: ${successCount}`);
    console.log(`❌ Imágenes fallidas: ${failCount}`);
    console.log(`📸 Archivos productos (.jpg): ${productFiles.length}`);
    console.log(`🏪 Archivos restaurantes (.jpg): ${restaurantFiles.length}`);
    
    // Listar archivos descargados
    if (productFiles.length > 0) {
      console.log('\n📋 Productos descargados:');
      productFiles.forEach(file => console.log(`   📸 ${file}`));
    }
    
    if (restaurantFiles.length > 0) {
      console.log('\n📋 Restaurantes descargados:');
      restaurantFiles.forEach(file => console.log(`   🏪 ${file}`));
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadSpecificImages().catch(console.error);
}

export { downloadSpecificImages };