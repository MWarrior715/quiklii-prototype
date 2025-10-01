#!/usr/bin/env node

/**
 * Script manual para descargar imágenes usando curl/wget o crear enlaces simbólicos
 * Como alternativa, descarga las imágenes manualmente desde las URLs proporcionadas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// URLs de imágenes específicas que deben descargarse
const MANUAL_DOWNLOAD_URLS = [
  {
    name: 'pizza-margarita-real',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products',
    description: 'Pizza Margarita - Imagen de alta calidad'
  },
  {
    name: 'sushi-atun-fresco',
    url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products',
    description: 'Sushi de atún fresco'
  },
  {
    name: 'hamburguesa-doble-queso',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products',
    description: 'Hamburguesa doble con queso'
  },
  {
    name: 'ensalada-fresca-verduras',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products',
    description: 'Ensalada fresca con vegetales'
  },
  {
    name: 'ramen-caliente-japones',
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products',
    description: 'Ramen japonés caliente'
  },
  {
    name: 'wok-vegetales-salteados',
    url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products',
    description: 'Wok con vegetales salteados'
  },
  {
    name: 'bandeja-paisa-completa',
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products',
    description: 'Bandeja paisa completa tradicional'
  },
  {
    name: 'pasta-alfredo-cremosa',
    url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products',
    description: 'Pasta Alfredo cremosa'
  },
  {
    name: 'mojito-cubano-autentico',
    url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products',
    description: 'Mojito cubano auténtico'
  },
  {
    name: 'helado-artesanal-vainilla',
    url: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products',
    description: 'Helado artesanal de vainilla'
  },
  {
    name: 'tabla-quesos-variedad-artesanal',
    url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products',
    description: 'Tabla de quesos variedad artesanal'
  },
  {
    name: 'cerveza-artesanal-rubia',
    url: 'https://images.unsplash.com/photo-1436076863939-06870fe779c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    category: 'products',
    description: 'Cerveza artesanal rubia'
  }
];

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

// Función para intentar descarga con curl
function downloadWithCurl(url, filename) {
  try {
    console.log(`🔄 Intentando descarga con curl: ${path.basename(filename)}`);
    
    // Intentar con curl (disponible en Windows 10+ y Unix)
    const curlCommand = `curl -L -s -o "${filename}" "${url}"`;
    execSync(curlCommand, { stdio: 'pipe' });
    
    // Verificar que se descargó algo
    if (fs.existsSync(filename) && fs.statSync(filename).size > 0) {
      const sizeKB = (fs.statSync(filename).size / 1024).toFixed(1);
      console.log(`✅ Descargado con curl: ${path.basename(filename)} (${sizeKB} KB)`);
      return true;
    }
    return false;
  } catch (error) {
    console.log(`❌ Curl falló: ${error.message}`);
    return false;
  }
}

// Función para intentar descarga con wget
function downloadWithWget(url, filename) {
  try {
    console.log(`🔄 Intentando descarga con wget: ${path.basename(filename)}`);
    
    // Intentar con wget
    const wgetCommand = `wget -q -O "${filename}" "${url}"`;
    execSync(wgetCommand, { stdio: 'pipe' });
    
    // Verificar que se descargó algo
    if (fs.existsSync(filename) && fs.statSync(filename).size > 0) {
      const sizeKB = (fs.statSync(filename).size / 1024).toFixed(1);
      console.log(`✅ Descargado con wget: ${path.basename(filename)} (${sizeKB} KB)`);
      return true;
    }
    return false;
  } catch (error) {
    console.log(`❌ Wget falló: ${error.message}`);
    return false;
  }
}

// Función para crear archivo de instrucciones manuales
function createManualInstructions(image) {
  const productsDir = path.join(__dirname, '../uploads/images/products');
  const instructionFile = path.join(productsDir, `DOWNLOAD_${image.name}.txt`);
  
  const instructions = `
INSTRUCCIONES PARA DESCARGAR LA IMAGEN:
=====================================

Nombre: ${image.name}
Descripción: ${image.description}
URL: ${image.url}

PASOS PARA DESCARGAR MANUALMENTE:
1. Abre la URL en tu navegador
2. Haz clic derecho en la imagen
3. Selecciona "Guardar imagen como..."
4. Guarda el archivo como: ${image.name}.jpg
5. Colócalo en la carpeta: ${productsDir}

O BIEN, usa estos comandos en la terminal:

# Opción 1 - curl:
curl -L -o "${path.join(productsDir, image.name + '.jpg')}" "${image.url}"

# Opción 2 - wget:
wget -O "${path.join(productsDir, image.name + '.jpg')}" "${image.url}"

# Opción 3 - PowerShell:
Invoke-WebRequest -Uri "${image.url}" -OutFile "${path.join(productsDir, image.name + '.jpg')}"

¡La imagen debe tener aproximadamente 20-50 KB y ser de 400x300 píxeles!
`;
  
  fs.writeFileSync(instructionFile, instructions.trim());
  console.log(`📝 Instrucciones creadas: ${path.basename(instructionFile)}`);
}

// Función principal
async function downloadManualImages() {
  console.log('🚀 Proceso de descarga manual de imágenes de alta calidad...\n');
  console.log('ℹ️  Si las descargas automáticas fallan, sigue las instrucciones creadas en los archivos .txt\n');
  
  try {
    createDirectories();
    
    const productsDir = path.join(__dirname, '../uploads/images/products');
    
    let successCount = 0;
    let manualCount = 0;
    
    console.log('🍽️ Procesando imágenes de productos...\n');
    
    for (const image of MANUAL_DOWNLOAD_URLS) {
      const filename = `${image.name}.jpg`;
      const filepath = path.join(productsDir, filename);
      
      // Verificar si ya existe
      if (fs.existsSync(filepath)) {
        console.log(`⏭️ Existe: ${image.name}`);
        successCount++;
        continue;
      }
      
      console.log(`\n📸 Procesando: ${image.name}`);
      console.log(`   📝 ${image.description}`);
      
      // Intentar descarga automática primero
      let downloaded = false;
      
      // Intentar con curl
      if (!downloaded) {
        downloaded = downloadWithCurl(image.url, filepath);
      }
      
      // Intentar con wget
      if (!downloaded) {
        downloaded = downloadWithWget(image.url, filepath);
      }
      
      if (downloaded) {
        successCount++;
      } else {
        // Crear instrucciones manuales
        createManualInstructions(image);
        manualCount++;
      }
    }
    
    // Verificación final
    const productFiles = fs.readdirSync(productsDir).filter(f => f.endsWith('.jpg'));
    const instructionFiles = fs.readdirSync(productsDir).filter(f => f.startsWith('DOWNLOAD_'));
    
    console.log('\n📊 Resumen final:');
    console.log(`✅ Imágenes descargadas automáticamente: ${successCount}`);
    console.log(`📝 Imágenes que requieren descarga manual: ${manualCount}`);
    console.log(`📸 Archivos .jpg en products: ${productFiles.length}`);
    console.log(`📋 Archivos de instrucción: ${instructionFiles.length}`);
    
    if (productFiles.length > 0) {
      console.log('\n📋 Productos descargados:');
      productFiles.forEach(file => console.log(`   📸 ${file}`));
    }
    
    if (instructionFiles.length > 0) {
      console.log('\n📋 Archivos de instrucciones (sigue estos para descargar manualmente):');
      instructionFiles.forEach(file => console.log(`   📝 ${file}`));
    }
    
    console.log('\n✅ Proceso completado.');
    console.log('💡 Si hay archivos de instrucción, ábrelos y sigue los pasos para descargar las imágenes manualmente.');
    console.log('📍 Las imágenes deben colocarse en:', productsDir);
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadManualImages().catch(console.error);
}

export { downloadManualImages };