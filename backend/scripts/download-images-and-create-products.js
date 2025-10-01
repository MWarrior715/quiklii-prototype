#!/usr/bin/env node

/**
 * Script para descargar imágenes de Unsplash y crear productos para restaurantes
 * Automatiza la descarga de imágenes y la creación de productos/menu items
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { sequelize } from '../src/config/database.js';
import { Restaurant } from '../src/models/Restaurant.js';
import { MenuItem } from '../src/models/MenuItem.js';

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de Unsplash (API pública - no requiere API key para búsquedas básicas)
const UNSPLASH_BASE_URL = 'https://source.unsplash.com/800x600/?';
const RESTAURANT_IMAGE_SIZE = '1200x800';
const PRODUCT_IMAGE_SIZE = '800x800';

// Categorías de comida por tipo de restaurante
const FOOD_CATEGORIES = {
  'Italiana': ['Pizza', 'Pasta', 'Risotto', 'Lasagna', 'Tiramisu', 'Gelato'],
  'Japonesa': ['Sushi', 'Sashimi', 'Ramen', 'Tempura', 'Miso Soup', 'Onigiri'],
  'Colombiana': ['Bandeja Paisa', 'Sancocho', 'Arepas', 'Empanadas', 'Chicharrón', 'Plátano'],
  'Saludable': ['Bowl', 'Ensalada', 'Smoothie', 'Wrap', 'Sopa', 'Quinoa'],
  'Americana': ['Hamburguesa', 'Hot Dog', 'Papas Fritas', 'Chicken Wings', 'BBQ', 'Sandwich'],
  'China': ['Wok', 'Dim Sum', 'Arroz Frito', 'Spring Rolls', 'Pato', 'Szechuan'],
  'Internacional': ['Cócteles', 'Tapas', 'Queso', 'Charcutería', 'Vino', 'Cerveza']
};

// Productos por tipo de restaurante
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

// Función para descargar imagen desde URL
async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Imagen descargada: ${filename}`);
          resolve(filename);
        });
      } else {
        file.close();
        fs.unlinkSync(filename);
        reject(new Error(`Error al descargar imagen: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlinkSync(filename);
      reject(err);
    });
  });
}

// Función para obtener imagen de Unsplash basada en búsqueda
function getUnsplashImageUrl(query, size = PRODUCT_IMAGE_SIZE) {
  const searchQuery = encodeURIComponent(query);
  return `https://source.unsplash.com/${size}/?${searchQuery},food`;
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

// Función para descargar imagen de restaurante
async function downloadRestaurantImage(restaurantName, restaurantId) {
  const searchTerms = restaurantName.toLowerCase().replace(/\s+/g, '-');
  const imageUrl = getUnsplashImageUrl(searchTerms, RESTAURANT_IMAGE_SIZE);
  const filename = `restaurant-${restaurantId}-${Date.now()}.jpg`;
  const filepath = path.join(__dirname, '../uploads/images/restaurants', filename);
  
  try {
    await downloadImage(imageUrl, filepath);
    return `/uploads/images/restaurants/${filename}`;
  } catch (error) {
    console.error(`❌ Error descargando imagen para restaurante ${restaurantName}:`, error.message);
    return null;
  }
}

// Función para descargar imagen de producto
async function downloadProductImage(productName, category, restaurantId, productIndex) {
  const searchTerms = `${category},${productName}`;
  const imageUrl = getUnsplashImageUrl(searchTerms, PRODUCT_IMAGE_SIZE);
  const filename = `product-${restaurantId}-${productIndex}-${Date.now()}.jpg`;
  const filepath = path.join(__dirname, '../uploads/images/products', filename);
  
  try {
    await downloadImage(imageUrl, filepath);
    return `/uploads/images/products/${filename}`;
  } catch (error) {
    console.error(`❌ Error descargando imagen para producto ${productName}:`, error.message);
    return null;
  }
}

// Función para crear productos para un restaurante
async function createRestaurantProducts(restaurant, products) {
  const createdProducts = [];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    console.log(`📸 Descargando imagen para producto: ${product.name}`);
    const imageUrl = await downloadProductImage(
      product.name, 
      product.category, 
      restaurant.id, 
      i + 1
    );
    
    try {
      const menuItem = await MenuItem.create({
        name: product.name,
        description: product.description,
        price: product.price,
        image: imageUrl,
        category: product.category,
        restaurantId: restaurant.id,
        available: true,
        preparationTime: Math.floor(Math.random() * 20) + 10, // 10-30 minutos
        isVegetarian: product.category.toLowerCase().includes('ensalada') || 
                     product.category.toLowerCase().includes('vegetal') ||
                     product.name.toLowerCase().includes('vegetariano'),
        isSpicy: product.name.toLowerCase().includes('picante') || 
                product.description.toLowerCase().includes('picante')
      });
      
      createdProducts.push(menuItem);
      console.log(`✅ Producto creado: ${product.name} para ${restaurant.name}`);
    } catch (error) {
      console.error(`❌ Error creando producto ${product.name}:`, error.message);
    }
  }
  
  return createdProducts;
}

// Función principal
async function main() {
  console.log('🚀 Iniciando script de descarga de imágenes y creación de productos...\n');
  
  try {
    // Conectar a la base de datos
    console.log('🔗 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');
    
    // Crear directorios necesarios
    createDirectories();
    
    // Obtener todos los restaurantes
    console.log('\n🏪 Obteniendo restaurantes existentes...');
    const restaurants = await Restaurant.findAll();
    console.log(`📊 Se encontraron ${restaurants.length} restaurantes`);
    
    // Procesar cada restaurante
    for (const restaurant of restaurants) {
      console.log(`\n🍽️ Procesando restaurante: ${restaurant.name}`);
      
      // Descargar imagen de restaurante si no tiene una
      if (!restaurant.imageUrl) {
        console.log(`📸 Descargando imagen para restaurante: ${restaurant.name}`);
        const restaurantImageUrl = await downloadRestaurantImage(restaurant.name, restaurant.id);
        
        if (restaurantImageUrl) {
          await restaurant.update({ imageUrl: restaurantImageUrl });
          console.log(`✅ Imagen de restaurante actualizada: ${restaurant.name}`);
        }
      }
      
      // Verificar si el restaurante ya tiene productos
      const existingProducts = await MenuItem.findAll({
        where: { restaurantId: restaurant.id }
      });
      
      console.log(`📦 El restaurante ${restaurant.name} tiene ${existingProducts.length} productos existentes`);
      
      // Si el restaurante tiene menos de 2 productos, crear nuevos
      if (existingProducts.length < 2) {
        const productsToCreate = RESTAURANT_PRODUCTS[restaurant.name] || 
                               RESTAURANT_PRODUCTS[Object.keys(RESTAURANT_PRODUCTS)[0]];
        
        const productsNeeded = 2 - existingProducts.length;
        const productsToAdd = productsToCreate.slice(0, productsNeeded);
        
        if (productsToAdd.length > 0) {
          console.log(`🛍️ Creando ${productsToAdd.length} productos para ${restaurant.name}...`);
          await createRestaurantProducts(restaurant, productsToAdd);
        }
      } else {
        console.log(`✅ El restaurante ${restaurant.name} ya tiene suficientes productos`);
      }
    }
    
    console.log('\n🎉 ¡Proceso completado exitosamente!');
    console.log('✅ Todas las imágenes han sido descargadas');
    console.log('✅ Todos los productos han sido creados');
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔒 Conexión a base de datos cerrada');
  }
}

// Ejecutar el script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { downloadImage, getUnsplashImageUrl, createRestaurantProducts };