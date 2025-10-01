#!/usr/bin/env node

/**
 * Script para generar imágenes locales y crear productos para restaurantes
 * Crea imágenes placeholder y productos sin depender de descargas externas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lista de restaurantes basada en el frontend
const RESTAURANTS = [
  { id: '1', name: 'Bella Italia', cuisine: ['Italiana', 'Pizza', 'Pasta'] },
  { id: '2', name: 'Sakura Sushi', cuisine: ['Japonesa', 'Sushi', 'Asiática'] },
  { id: '3', name: 'El Rincón Paisa', cuisine: ['Colombiana', 'Antioqueña', 'Tradicional'] },
  { id: '4', name: 'Green Garden', cuisine: ['Saludable', 'Vegetariana', 'Vegana'] },
  { id: '5', name: 'Burger Master', cuisine: ['Americana', 'Hamburguesas', 'Comida Rápida'] },
  { id: '6', name: 'Dragon Wok', cuisine: ['China', 'Asiática', 'Wok'] },
  { id: '7', name: 'La Noche Bar', cuisine: ['Cócteles', 'Tapas', 'Internacional'] }
];

// Productos por restaurante
const RESTAURANT_PRODUCTS = {
  'Bella Italia': [
    { name: 'Pizza Quattro Stagioni', category: 'Pizza', price: 32000, description: 'Pizza con jamón, champiñones, alcachofas y aceitunas' },
    { name: 'Fettuccine Alfredo', category: 'Pasta', price: 28000, description: 'Pasta casera con salsa Alfredo cremosa y parmesano' }
  ],
  'Sakura Sushi': [
    { name: 'Nigiri de Atún', category: 'Sushi', price: 18000, description: 'Arroz con atún fresco sobre alga nori' },
    { name: 'Miso Ramen', category: 'Sopa', price: 25000, description: 'Sopa de fideos con caldo de miso y vegetales' }
  ],
  'El Rincón Paisa': [
    { name: 'Mondongo', category: 'Sopa', price: 20000, description: 'Sopa tradicional de mondongo con guarnición' },
    { name: 'Chuleta Valluna', category: 'Carne', price: 35000, description: 'Chuleta de cerdo apanada con yuca y ensalada' }
  ],
  'Green Garden': [
    { name: 'Ensalada Caesar', category: 'Ensalada', price: 22000, description: 'Lechuga romana, crutones, parmesano y aderezo Caesar' },
    { name: 'Wrap de Pollo', category: 'Wrap', price: 26000, description: 'Wrap integral con pollo grillado y vegetales' }
  ],
  'Burger Master': [
    { name: 'Burger BBQ Bacon', category: 'Hamburguesa', price: 22000, description: 'Hamburguesa con bacon, queso cheddar y salsa BBQ' },
    { name: 'Chicken Crispy', category: 'Pollo', price: 19000, description: 'Pechuga de pollo crujiente con papas fritas' }
  ],
  'Dragon Wok': [
    { name: 'Wok de Pollo', category: 'Wok', price: 24000, description: 'Pollo salteado con vegetales y fideos chinos' },
    { name: 'Arroz Tres Delicias', category: 'Arroz', price: 18000, description: 'Arroz frito con huevo, jamón y camarones' }
  ],
  'La Noche Bar': [
    { name: 'Cóctel Mojito', category: 'Cóctel', price: 15000, description: 'Cóctel clásico con ron, menta y lima' },
    { name: 'Tabla de Quesos', category: 'Tapas', price: 28000, description: 'Selección de quesos artesanales con frutas y nueces' }
  ]
};

// Función para crear una imagen placeholder simple
function createPlaceholderImage(width, height, text, filename) {
  // Crear un SVG simple como imagen placeholder
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f0f0f0"/>
  <rect x="10" y="10" width="${width-20}" height="${height-20}" fill="#ffffff" stroke="#cccccc" stroke-width="2"/>
  <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="24" fill="#666666" text-anchor="middle" dominant-baseline="middle">${text}</text>
  <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="16" fill="#999999" text-anchor="middle" dominant-baseline="middle">${width}x${height}</text>
</svg>`;
  
  fs.writeFileSync(filename, svgContent);
  console.log(`✅ Imagen creada: ${filename}`);
}

// Función para crear directorios necesarios
function createDirectories() {
  const directories = [
    path.join(__dirname, '../uploads/images/restaurants'),
    path.join(__dirname, '../uploads/images/products'),
    path.join(__dirname, '../uploads/images/temp')
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Directorio creado: ${dir}`);
    }
  });
}

// Función para generar imagen de restaurante
function generateRestaurantImage(restaurantName, restaurantId) {
  const filename = `restaurant-${restaurantId}-${Date.now()}.svg`;
  const filepath = path.join(__dirname, '../uploads/images/restaurants', filename);
  const displayText = restaurantName.length > 20 ? restaurantName.substring(0, 20) + '...' : restaurantName;
  
  createPlaceholderImage(1200, 800, displayText, filepath);
  return `/uploads/images/restaurants/${filename}`;
}

// Función para generar imagen de producto
function generateProductImage(productName, category, restaurantId, productIndex) {
  const filename = `product-${restaurantId}-${productIndex}-${Date.now()}.svg`;
  const filepath = path.join(__dirname, '../uploads/images/products', filename);
  const displayText = productName.length > 15 ? productName.substring(0, 15) + '...' : productName;
  
  createPlaceholderImage(800, 800, `${displayText}\n${category}`, filepath);
  return `/uploads/images/products/${filename}`;
}

// Función para crear archivo JSON con datos de productos
function createProductsData() {
  const productsData = [];
  let productId = 1;
  
  RESTAURANTS.forEach(restaurant => {
    const products = RESTAURANT_PRODUCTS[restaurant.name] || [];
    
    products.forEach((product, index) => {
      const imageUrl = generateProductImage(
        product.name, 
        product.category, 
        restaurant.id, 
        index + 1
      );
      
      productsData.push({
        id: String(productId++),
        restaurantId: restaurant.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: imageUrl,
        category: product.category,
        isVegetarian: product.category.toLowerCase().includes('ensalada') || 
                     product.category.toLowerCase().includes('vegetal'),
        isAvailable: true,
        preparationTime: Math.floor(Math.random() * 20) + 10 // 10-30 minutos
      });
    });
  });
  
  return productsData;
}

// Función para crear archivo JSON con datos de restaurantes
function createRestaurantsData() {
  return RESTAURANTS.map(restaurant => ({
    ...restaurant,
    image: generateRestaurantImage(restaurant.name, restaurant.id),
    logo: generateRestaurantImage(`${restaurant.name} Logo`, restaurant.id),
    rating: 4.0 + Math.random() * 1.0, // 4.0-5.0
    reviewCount: Math.floor(Math.random() * 500) + 100,
    deliveryTime: '25-35 min',
    deliveryFee: Math.floor(Math.random() * 3000) + 3000,
    minOrder: Math.floor(Math.random() * 15000) + 15000,
    isOpen: true,
    isActive: true
  }));
}

// Función principal
function main() {
  console.log('🚀 Iniciando generación de imágenes locales y datos de productos...\n');
  
  try {
    // Crear directorios necesarios
    createDirectories();
    
    // Generar datos de restaurantes con imágenes
    console.log('🏪 Generando datos de restaurantes...');
    const restaurantsData = createRestaurantsData();
    
    // Generar datos de productos con imágenes
    console.log('\n🛍️ Generando datos de productos...');
    const productsData = createProductsData();
    
    // Guardar datos en archivos JSON
    const restaurantsJsonPath = path.join(__dirname, '../uploads/restaurants-with-images.json');
    const productsJsonPath = path.join(__dirname, '../uploads/products-with-images.json');
    
    fs.writeFileSync(restaurantsJsonPath, JSON.stringify(restaurantsData, null, 2));
    console.log(`✅ Datos de restaurantes guardados: ${restaurantsJsonPath}`);
    
    fs.writeFileSync(productsJsonPath, JSON.stringify(productsData, null, 2));
    console.log(`✅ Datos de productos guardados: ${productsJsonPath}`);
    
    // Mostrar resumen
    console.log('\n📈 RESUMEN:');
    console.log(`   ├─ Restaurantes procesados: ${restaurantsData.length}`);
    console.log(`   ├─ Productos creados: ${productsData.length}`);
    console.log(`   ├─ Imágenes de restaurantes: ${restaurantsData.length}`);
    console.log(`   ├─ Imágenes de productos: ${productsData.length}`);
    console.log(`   ├─ Archivos JSON creados: 2`);
    console.log(`   🎉 Proceso completado exitosamente!`);
    
    console.log('\n📋 INSTRUCCIONES:');
    console.log('   ├─ Las imágenes están en formato SVG (ligero y escalable)');
    console.log('   ├─ Los datos JSON pueden ser importados a la base de datos');
    console.log('   ├─ Las imágenes están organizadas por tipo (restaurants/products)');
    console.log('   └─ Puedes reemplazar los SVG con imágenes reales más tarde');
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
  }
}

// Ejecutar el script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateRestaurantImage, generateProductImage, createProductsData, createRestaurantsData };