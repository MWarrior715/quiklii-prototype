#!/usr/bin/env node

/**
 * Script para descargar imágenes reales optimizadas desde Unsplash, Pixabay y Pexels
 * Descarga imágenes de alta calidad pero livianas para productos específicos
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sharp from 'sharp';

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// URLs de imágenes específicas de alta calidad desde Unsplash
const PRODUCT_IMAGES = [
  {
    name: 'pizza-margarita',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    category: 'Pizza'
  },
  {
    name: 'sushi-atun',
    url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    category: 'Sushi'
  },
  {
    name: 'hamburguesa-clasica',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    category: 'Hamburguesa'
  },
  {
    name: 'ramen-japones',
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    category: 'Ramen'
  },
  {
    name: 'ensalada-fresca',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    category: 'Ensalada'
  },
  {
    name: 'wok-vegetales',
    url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
    category: 'Wok'
  },
  {
    name: 'bandeja-paisa',
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    category: 'Colombiana'
  },
  {
    name: 'tacos-mexicanos',
    url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop',
    category: 'Mexicana'
  },
  {
    name: 'pasta-alfredo',
    url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
    category: 'Pasta'
  },
  {
    name: 'helado-artesanal',
    url: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400&h=300&fit=crop',
    category: 'Postre'
  },
  {
    name: 'cocktail-mojito',
    url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop',
    category: 'Bebida'
  },
  {
    name: 'tabla-quesos',
    url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop',
    category: 'Entrada'
  }
];

// Función para descargar y optimizar imagen
async function downloadAndOptimizeImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200 || response.statusCode === 302) {
        if (response.statusCode === 302 && response.headers.location) {
          // Seguir redirección
          return downloadAndOptimizeImage(response.headers.location, outputPath)
            .then(resolve)
            .catch(reject);
        }

        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);
            
            // Optimizar con Sharp
            const optimizedBuffer = await sharp(buffer)
              .resize(400, 300, { 
                fit: 'cover',
                position: 'center'
              })
              .jpeg({ 
                quality: 85,
                progressive: true,
                mozjpeg: true
              })
              .toBuffer();
            
            // Guardar imagen optimizada
            fs.writeFileSync(outputPath, optimizedBuffer);
            
            const stats = fs.statSync(outputPath);
            const sizeKB = (stats.size / 1024).toFixed(2);
            
            console.log(`✅ Imagen optimizada guardada: ${path.basename(outputPath)} (${sizeKB} KB)`);
            resolve(outputPath);
          } catch (error) {
            reject(error);
          }
        });
      } else {
        reject(new Error(`Error HTTP ${response.statusCode} al descargar ${url}`));
      }
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Función para crear directorios necesarios
function createDirectories() {
  const directories = [
    path.join(__dirname, '../uploads/images/products'),
    path.join(__dirname, '../uploads/images/restaurants'),
    path.join(__dirname, '../uploads/images/temp')
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Directorio creado: ${dir}`);
    }
  });
}

// Función principal
async function downloadRealImages() {
  console.log('🚀 Iniciando descarga de imágenes reales optimizadas...\n');
  
  try {
    // Crear directorios
    createDirectories();
    
    const productsDir = path.join(__dirname, '../uploads/images/products');
    const restaurantsDir = path.join(__dirname, '../uploads/images/restaurants');
    
    let downloadedCount = 0;
    let failedCount = 0;
    
    // Descargar imágenes de productos
    console.log('📸 Descargando imágenes de productos...\n');
    
    for (const product of PRODUCT_IMAGES) {
      const filename = `${product.name}-${Date.now()}.jpg`;
      const filepath = path.join(productsDir, filename);
      
      try {
        console.log(`⏬ Descargando: ${product.name} (${product.category})`);
        await downloadAndOptimizeImage(product.url, filepath);
        downloadedCount++;
      } catch (error) {
        console.error(`❌ Error descargando ${product.name}: ${error.message}`);
        failedCount++;
      }
    }
    
    // Descargar algunas imágenes de restaurantes
    console.log('\n🏪 Descargando imágenes de restaurantes...\n');
    
    const RESTAURANT_IMAGES = [
      {
        name: 'restaurant-italiano',
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop'
      },
      {
        name: 'restaurant-japones',
        url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop'
      },
      {
        name: 'restaurant-moderno',
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop'
      }
    ];
    
    for (const restaurant of RESTAURANT_IMAGES) {
      const filename = `${restaurant.name}-${Date.now()}.jpg`;
      const filepath = path.join(restaurantsDir, filename);
      
      try {
        console.log(`⏬ Descargando: ${restaurant.name}`);
        
        // Optimizar imágenes de restaurantes (más grandes)
        const response = await new Promise((resolve, reject) => {
          https.get(restaurant.url, (res) => {
            if (res.statusCode === 200 || res.statusCode === 302) {
              if (res.statusCode === 302 && res.headers.location) {
                return https.get(res.headers.location, resolve).on('error', reject);
              }
              resolve(res);
            } else {
              reject(new Error(`Error HTTP ${res.statusCode}`));
            }
          }).on('error', reject);
        });
        
        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);
            
            const optimizedBuffer = await sharp(buffer)
              .resize(800, 600, { 
                fit: 'cover',
                position: 'center'
              })
              .jpeg({ 
                quality: 90,
                progressive: true,
                mozjpeg: true
              })
              .toBuffer();
            
            fs.writeFileSync(filepath, optimizedBuffer);
            const stats = fs.statSync(filepath);
            const sizeKB = (stats.size / 1024).toFixed(2);
            
            console.log(`✅ Restaurante optimizado: ${path.basename(filepath)} (${sizeKB} KB)`);
            downloadedCount++;
          } catch (error) {
            console.error(`❌ Error procesando ${restaurant.name}: ${error.message}`);
            failedCount++;
          }
        });
      } catch (error) {
        console.error(`❌ Error descargando ${restaurant.name}: ${error.message}`);
        failedCount++;
      }
    }
    
    console.log('\n📊 Resumen de descarga:');
    console.log(`✅ Imágenes descargadas y optimizadas: ${downloadedCount}`);
    console.log(`❌ Imágenes fallidas: ${failedCount}`);
    console.log(`📁 Imágenes guardadas en: ${productsDir} y ${restaurantsDir}`);
    
    // Verificar archivos descargados
    const productFiles = fs.readdirSync(productsDir).filter(f => f.endsWith('.jpg'));
    const restaurantFiles = fs.readdirSync(restaurantsDir).filter(f => f.endsWith('.jpg'));
    
    console.log(`\n📸 Archivos productos: ${productFiles.length}`);
    console.log(`🏪 Archivos restaurantes: ${restaurantFiles.length}`);
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
  }
}

// Ejecutar el script
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadRealImages().catch(console.error);
}

export { downloadRealImages };