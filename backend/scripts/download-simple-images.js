#!/usr/bin/env node

/**
 * Script simple para descargar imágenes reales de Unsplash
 * URLs directas sin redirecciones complejas
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// URLs directas de imágenes de alta calidad (sin parámetros de tracking)
const DIRECT_IMAGE_URLS = [
  // Pizza Margarita - URL directa que mencionaste
  {
    name: 'pizza-margarita',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
    category: 'products'
  },
  // Sushi
  {
    name: 'sushi-fresco',
    url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
    category: 'products'
  },
  // Hamburguesa
  {
    name: 'hamburguesa-clasica',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
    category: 'products'
  },
  // Ensalada
  {
    name: 'ensalada-fresca',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    category: 'products'
  },
  // Ramen
  {
    name: 'ramen-japones',
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624',
    category: 'products'
  },
  // Wok
  {
    name: 'wok-vegetales',
    url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b',
    category: 'products'
  },
  // Comida colombiana
  {
    name: 'bandeja-paisa-tipica',
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
    category: 'products'
  },
  // Pasta
  {
    name: 'pasta-alfredo',
    url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9',
    category: 'products'
  },
  // Cóctel
  {
    name: 'mojito-fresco',
    url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a',
    category: 'products'
  },
  // Postre
  {
    name: 'helado-artesanal',
    url: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f',
    category: 'products'
  },
  // Quesos
  {
    name: 'tabla-quesos-variedad',
    url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d',
    category: 'products'
  },
  // Cerveza
  {
    name: 'cerveza-artesanal-vaso',
    url: 'https://images.unsplash.com/photo-1436076863939-06870fe779c2',
    category: 'products'
  }
];

// Función para descargar imagen con URL construida
function downloadImageDirect(url, filename, width = 400, height = 300, quality = 80) {
  return new Promise((resolve, reject) => {
    // Construir URL con parámetros de optimización
    const optimizedUrl = `${url}?ixlib=rb-4.0.3&auto=format&fit=crop&w=${width}&h=${height}&q=${quality}`;
    
    console.log(`⏬ Descargando: ${path.basename(filename)}`);
    console.log(`   URL: ${optimizedUrl}`);
    
    const file = fs.createWriteStream(filename);
    
    https.get(optimizedUrl, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          const stats = fs.statSync(filename);
          const sizeKB = (stats.size / 1024).toFixed(1);
          console.log(`✅ Guardado: ${path.basename(filename)} (${sizeKB} KB)`);
          resolve(filename);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Manejar redirección simple
        if (response.headers.location) {
          file.close();
          fs.unlinkSync(filename);
          console.log(`   🔄 Redirigiendo a: ${response.headers.location}`);
          downloadImageDirect(response.headers.location, filename, width, height, quality)
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
async function downloadSimpleImages() {
  console.log('🚀 Descargando imágenes reales de alta calidad...\n');
  
  try {
    createDirectories();
    
    const productsDir = path.join(__dirname, '../uploads/images/products');
    const restaurantsDir = path.join(__dirname, '../uploads/images/restaurants');
    
    let successCount = 0;
    let failCount = 0;
    
    console.log('🍽️ Descargando imágenes de productos...\n');
    
    // Descargar imágenes de productos (400x300px, calidad 80)
    for (const image of DIRECT_IMAGE_URLS.filter(img => img.category === 'products')) {
      const filename = `${image.name}.jpg`;
      const filepath = path.join(productsDir, filename);
      
      // Verificar si ya existe
      if (fs.existsSync(filepath)) {
        console.log(`⏭️ Saltando: ${image.name} (ya existe)`);
        successCount++;
        continue;
      }
      
      try {
        await downloadImageDirect(image.url, filepath, 400, 300, 80);
        successCount++;
      } catch (error) {
        console.error(`❌ Error: ${image.name} - ${error.message}`);
        failCount++;
      }
    }
    
    console.log('\n📊 Resumen de descarga:');
    console.log(`✅ Imágenes descargadas exitosamente: ${successCount}`);
    console.log(`❌ Imágenes fallidas: ${failCount}`);
    
    // Verificar archivos descargados
    const productFiles = fs.readdirSync(productsDir).filter(f => f.endsWith('.jpg'));
    const restaurantFiles = fs.readdirSync(restaurantsDir).filter(f => f.endsWith('.jpg'));
    
    console.log(`\n📸 Archivos productos (.jpg): ${productFiles.length}`);
    console.log(`🏪 Archivos restaurantes (.jpg): ${restaurantFiles.length}`);
    
    if (productFiles.length > 0) {
      console.log('\n📋 Productos descargados:');
      productFiles.forEach(file => console.log(`   📸 ${file}`));
    }
    
    if (restaurantFiles.length > 0) {
      console.log('\n📋 Restaurantes descargados:');
      restaurantFiles.forEach(file => console.log(`   🏪 ${file}`));
    }
    
    console.log('\n✅ Proceso completado. Las imágenes están listas para usar.');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadSimpleImages().catch(console.error);
}

export { downloadSimpleImages };