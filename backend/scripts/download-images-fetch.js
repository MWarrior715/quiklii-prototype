#!/usr/bin/env node

/**
 * Script para descargar imágenes usando fetch (más moderno y confiable)
 * Descarga imágenes reales de Unsplash con URLs directas
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// URLs de imágenes de alta calidad con parámetros de optimización
const IMAGE_URLS = [
  // Pizza Margarita - La que mencionaste específicamente
  {
    name: 'pizza-margarita-destacada',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products'
  },
  // Sushi
  {
    name: 'sushi-atun-premium',
    url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products'
  },
  // Hamburguesa
  {
    name: 'hamburguesa-doble-queso',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products'
  },
  // Ensalada fresca
  {
    name: 'ensalada-mixta-fresca',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products'
  },
  // Ramen
  {
    name: 'ramen-caliente-japones',
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products'
  },
  // Wok
  {
    name: 'wok-vegetales-salteados',
    url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products'
  },
  // Comida colombiana
  {
    name: 'bandeja-paisa-completa',
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products'
  },
  // Pasta
  {
    name: 'pasta-alfredo-cremosa',
    url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products'
  },
  // Cóctel
  {
    name: 'mojito-cubano-autentico',
    url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products'
  },
  // Postre
  {
    name: 'helado-artesanal-vainilla',
    url: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products'
  },
  // Tabla de quesos
  {
    name: 'tabla-quesos-variedad-artesanal',
    url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products'
  },
  // Cerveza
  {
    name: 'cerveza-artesanal-rubia',
    url: 'https://images.unsplash.com/photo-1436076863939-06870fe779c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products'
  }
];

// Función para descargar imagen con fetch
async function downloadImageWithFetch(url, filename) {
  try {
    console.log(`📥 Descargando: ${path.basename(filename)}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.buffer();
    
    // Verificar que es una imagen válida
    if (buffer.length < 1000) { // Menos de 1KB probablemente no es una imagen
      throw new Error('Archivo demasiado pequeño para ser una imagen');
    }
    
    // Guardar el archivo
    fs.writeFileSync(filename, buffer);
    
    const stats = fs.statSync(filename);
    const sizeKB = (stats.size / 1024).toFixed(1);
    
    console.log(`✅ Guardado: ${path.basename(filename)} (${sizeKB} KB)`);
    return filename;
    
  } catch (error) {
    console.error(`❌ Error descargando ${path.basename(filename)}: ${error.message}`);
    throw error;
  }
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
async function downloadImagesWithFetch() {
  console.log('🚀 Iniciando descarga de imágenes reales con fetch...\n');
  
  try {
    // Verificar que node-fetch esté disponible
    try {
      await import('node-fetch');
    } catch (error) {
      console.log('📦 Instalando node-fetch...');
      const { execSync } = await import('child_process');
      execSync('npm install node-fetch@2', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    }
    
    createDirectories();
    
    const productsDir = path.join(__dirname, '../uploads/images/products');
    
    let successCount = 0;
    let failCount = 0;
    
    console.log('🍽️ Descargando imágenes de productos...\n');
    
    // Descargar cada imagen
    for (const image of IMAGE_URLS) {
      const filename = `${image.name}.jpg`;
      const filepath = path.join(productsDir, filename);
      
      // Verificar si ya existe
      if (fs.existsSync(filepath)) {
        console.log(`⏭️ Saltando: ${image.name} (ya existe)`);
        successCount++;
        continue;
      }
      
      try {
        await downloadImageWithFetch(image.url, filepath);
        successCount++;
        // Pequeña pausa para no sobrecargar el servidor
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        failCount++;
      }
    }
    
    // Verificación final
    const productFiles = fs.readdirSync(productsDir).filter(f => f.endsWith('.jpg'));
    
    console.log('\n📊 Resumen de descarga:');
    console.log(`✅ Imágenes descargadas exitosamente: ${successCount}`);
    console.log(`❌ Imágenes fallidas: ${failCount}`);
    console.log(`📸 Archivos productos (.jpg): ${productFiles.length}`);
    
    if (productFiles.length > 0) {
      console.log('\n📋 Productos descargados:');
      productFiles.forEach(file => console.log(`   📸 ${file}`));
    }
    
    console.log('\n✅ Proceso completado. Las imágenes están listas para usar.');
    console.log('📍 Ubicación:', productsDir);
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadImagesWithFetch().catch(console => {
    console.error('Error crítico:', console);
    process.exit(1);
  });
}

export { downloadImagesWithFetch };