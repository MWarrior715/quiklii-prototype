#!/usr/bin/env node

/**
 * Script simple para crear imágenes dummy y datos de productos
 * Crea exactamente lo que necesitamos: 9 imágenes de restaurantes y 18 imágenes de productos
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando creación de imágenes dummy y productos...\n');

// Crear directorios necesarios
const dirs = [
  path.join(__dirname, '../uploads/images/restaurants'),
  path.join(__dirname, '../uploads/images/products'),
  path.join(__dirname, '../uploads/images/temp')
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Directorio creado: ${path.basename(dir)}`);
  }
});

// Función para crear imagen SVG placeholder
function createSVGImage(width, height, text, filename) {
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4ecdc4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad1)"/>
  <rect x="10" y="10" width="${width-20}" height="${height-20}" fill="#ffffff" stroke="#ffffff" stroke-width="2" opacity="0.9"/>
  <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="${width > 800 ? '32' : '24'}" fill="#333333" text-anchor="middle" dominant-baseline="middle">${text}</text>
  <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="${width > 800 ? '18' : '14'}" fill="#666666" text-anchor="middle" dominant-baseline="middle">${width}x${height}</text>
</svg>`;
  
  fs.writeFileSync(filename, svgContent);
  console.log(`✅ Imagen creada: ${path.basename(filename)}`);
}

// Crear imágenes de restaurantes (9 imágenes)
console.log('\n🏪 Creando imágenes de restaurantes...');
const restaurantNames = [
  'Bella Italia', 'Sakura Sushi', 'El Rincón Paisa', 
  'Green Garden', 'Burger Master', 'Dragon Wok', 'La Noche Bar'
];

restaurantNames.forEach((name, index) => {
  const filename = `restaurant-${index + 1}-${Date.now()}.svg`;
  const filepath = path.join(__dirname, '../uploads/images/restaurants', filename);
  createSVGImage(1200, 800, name, filepath);
});

// Crear imágenes de productos (18 imágenes - 2 por restaurante)
console.log('\n🛍️ Creando imágenes de productos...');

const productNames = [
  // Bella Italia
  ['Pizza Quattro Stagioni', 'Fettuccine Alfredo'],
  // Sakura Sushi  
  ['Nigiri de Atún', 'Miso Ramen'],
  // El Rincón Paisa
  ['Mondongo', 'Chuleta Valluna'],
  // Green Garden
  ['Ensalada Caesar', 'Wrap de Pollo'],
  // Burger Master
  ['Burger BBQ Bacon', 'Chicken Crispy'],
  // Dragon Wok
  ['Wok de Pollo', 'Arroz Tres Delicias'],
  // La Noche Bar
  ['Cóctel Mojito', 'Tabla de Quesos']
];

let productCounter = 1;
productNames.forEach((restaurantProducts, restaurantIndex) => {
  restaurantProducts.forEach((productName, productIndex) => {
    const filename = `product-${restaurantIndex + 1}-${productCounter}-${Date.now()}.svg`;
    const filepath = path.join(__dirname, '../uploads/images/products', filename);
    createSVGImage(800, 800, productName, filepath);
    productCounter++;
  });
});

// Crear archivo JSON con datos de productos
console.log('\n📋 Creando datos de productos...');

const productsData = [];
let productId = 1;

const productDetails = [
  // Bella Italia
  [
    { name: 'Pizza Quattro Stagioni', category: 'Pizza', price: 32000, description: 'Pizza con jamón, champiñones, alcachofas y aceitunas' },
    { name: 'Fettuccine Alfredo', category: 'Pasta', price: 28000, description: 'Pasta casera con salsa Alfredo cremosa y parmesano' }
  ],
  // Sakura Sushi  
  [
    { name: 'Nigiri de Atún', category: 'Sushi', price: 18000, description: 'Arroz con atún fresco sobre alga nori' },
    { name: 'Miso Ramen', category: 'Sopa', price: 25000, description: 'Sopa de fideos con caldo de miso y vegetales' }
  ],
  // El Rincón Paisa
  [
    { name: 'Mondongo', category: 'Sopa', price: 20000, description: 'Sopa tradicional de mondongo con guarnición' },
    { name: 'Chuleta Valluna', category: 'Carne', price: 35000, description: 'Chuleta de cerdo apanada con yuca y ensalada' }
  ],
  // Green Garden
  [
    { name: 'Ensalada Caesar', category: 'Ensalada', price: 22000, description: 'Lechuga romana, crutones, parmesano y aderezo Caesar' },
    { name: 'Wrap de Pollo', category: 'Wrap', price: 26000, description: 'Wrap integral con pollo grillado y vegetales' }
  ],
  // Burger Master
  [
    { name: 'Burger BBQ Bacon', category: 'Hamburguesa', price: 22000, description: 'Hamburguesa con bacon, queso cheddar y salsa BBQ' },
    { name: 'Chicken Crispy', category: 'Pollo', price: 19000, description: 'Pechuga de pollo crujiente con papas fritas' }
  ],
  // Dragon Wok
  [
    { name: 'Wok de Pollo', category: 'Wok', price: 24000, description: 'Pollo salteado con vegetales y fideos chinos' },
    { name: 'Arroz Tres Delicias', category: 'Arroz', price: 18000, description: 'Arroz frito con huevo, jamón y camarones' }
  ],
  // La Noche Bar
  [
    { name: 'Cóctel Mojito', category: 'Cóctel', price: 15000, description: 'Cóctel clásico con ron, menta y lima' },
    { name: 'Tabla de Quesos', category: 'Tapas', price: 28000, description: 'Selección de quesos artesanales con frutas y nueces' }
  ]
];

productDetails.forEach((restaurantProducts, restaurantIndex) => {
  restaurantProducts.forEach((product, productIndex) => {
    productsData.push({
      id: String(productId++),
      restaurantId: String(restaurantIndex + 1),
      name: product.name,
      description: product.description,
      price: product.price,
      image: `/uploads/images/products/product-${restaurantIndex + 1}-${productId - 1}-*.svg`, // Patrón para referenciar
      category: product.category,
      isVegetarian: product.category.toLowerCase().includes('ensalada') || 
                   product.category.toLowerCase().includes('vegetal'),
      isAvailable: true,
      preparationTime: Math.floor(Math.random() * 20) + 10, // 10-30 minutos
      isSpicy: product.name.toLowerCase().includes('picante')
    });
  });
});

// Guardar datos en archivo JSON
const productsJsonPath = path.join(__dirname, '../uploads/products-dummy-data.json');
fs.writeFileSync(productsJsonPath, JSON.stringify(productsData, null, 2));
console.log(`\n✅ Datos de productos guardados: ${path.basename(productsJsonPath)}`);

// Crear archivo JSON con datos de restaurantes
const restaurantsData = restaurantNames.map((name, index) => ({
  id: String(index + 1),
  name: name,
  image: `/uploads/images/restaurants/restaurant-${index + 1}-*.svg`, // Patrón para referenciar
  logo: `/uploads/images/restaurants/restaurant-${index + 1}-*.svg`,
  cuisine: RESTAURANTS[index].cuisine,
  rating: (4.0 + Math.random() * 1.0).toFixed(1), // 4.0-5.0
  reviewCount: Math.floor(Math.random() * 500) + 100,
  deliveryTime: '25-35 min',
  deliveryFee: Math.floor(Math.random() * 3000) + 3000,
  minOrder: Math.floor(Math.random() * 15000) + 15000,
  isOpen: true,
  isActive: true
}));

const restaurantsJsonPath = path.join(__dirname, '../uploads/restaurants-dummy-data.json');
fs.writeFileSync(restaurantsJsonPath, JSON.stringify(restaurantsData, null, 2));
console.log(`✅ Datos de restaurantes guardados: ${path.basename(restaurantsJsonPath)}`);

// Mostrar resumen final
console.log('\n🎉 ¡PROCESO COMPLETADO EXITOSAMENTE!');
console.log('📊 RESUMEN FINAL:');
console.log(`   ├─ Restaurantes procesados: ${restaurantNames.length}`);
console.log(`   ├─ Productos creados: ${productsData.length}`);
console.log(`   ├─ Imágenes de restaurantes: ${restaurantNames.length}`);
console.log(`   ├─ Imágenes de productos: ${productsData.length}`);
console.log(`   ├─ Archivos JSON creados: 2`);
console.log(`   ├─ Todas las imágenes son SVG (formato vectorial)`);
console.log(`   └─ Las imágenes están listas para usar`);

console.log('\n📋 NOTAS IMPORTANTES:');
console.log('   ├─ Las imágenes SVG son livianas y escalables');
console.log('   ├─ Los archivos JSON contienen todos los datos necesarios');
console.log('   ├─ Las imágenes están organizadas por tipo (restaurants/products)');
console.log('   └─ Puedes reemplazar los SVG con imágenes reales cuando quieras');