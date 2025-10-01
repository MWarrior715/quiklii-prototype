#!/usr/bin/env node

/**
 * Script para verificar el estado actual de restaurantes y productos
 * Muestra información sobre imágenes y productos existentes
 */

import { sequelize } from '../src/config/database.js';
import { initRestaurant } from '../src/models/Restaurant.js';
import { initMenuItem } from '../src/models/MenuItem.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkRestaurantsStatus() {
  console.log('🔍 Verificando estado de restaurantes y productos...\n');
  
  try {
    // Inicializar modelos
    const Restaurant = initRestaurant(sequelize);
    const MenuItem = initMenuItem(sequelize);
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    
    // Obtener todos los restaurantes
    const restaurants = await Restaurant.findAll({
      order: [['name', 'ASC']]
    });
    
    console.log(`📊 Total de restaurantes: ${restaurants.length}\n`);
    
    // Verificar directorios de imágenes
    const imageDirs = [
      path.join(__dirname, '../uploads/images/restaurants'),
      path.join(__dirname, '../uploads/images/products')
    ];
    
    let totalRestaurantImages = 0;
    let totalProductImages = 0;
    
    imageDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(file => 
          file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.svg')
        );
        
        if (dir.includes('restaurants')) {
          totalRestaurantImages = files.length;
        } else {
          totalProductImages = files.length;
        }
      }
    });
    
    console.log(`📸 Imágenes de restaurantes: ${totalRestaurantImages}`);
    console.log(`🛍️ Imágenes de productos: ${totalProductImages}\n`);
    
    // Analizar cada restaurante
    for (const restaurant of restaurants) {
      const products = await MenuItem.findAll({
        where: { restaurantId: restaurant.id }
      });
      
      const hasImage = restaurant.imageUrl ? '✅' : '❌';
      const productCount = products.length;
      const productsWithImages = products.filter(p => p.image).length;
      
      console.log(`🏪 ${restaurant.name}`);
      console.log(`   ├─ ID: ${restaurant.id}`);
      console.log(`   ├─ Imagen: ${hasImage} ${restaurant.imageUrl || 'Sin imagen'}`);
      console.log(`   ├─ Productos: ${productCount} (${productsWithImages} con imagen)`);
      console.log(`   ├─ Categoría: ${restaurant.category}`);
      console.log(`   └─ Estado: ${restaurant.isActive ? 'Activo' : 'Inactivo'}\n`);
      
      // Mostrar productos si hay menos de 5
      if (products.length <= 5) {
        products.forEach(product => {
          const hasProductImage = product.image ? '✅' : '❌';
          console.log(`     🍽️  ${product.name} - $${product.price} ${hasProductImage}`);
        });
        console.log('');
      }
    }
    
    // Resumen general
    const allProducts = await MenuItem.findAll();
    const productsWithImages = allProducts.filter(p => p.image).length;
    const restaurantsWithImages = restaurants.filter(r => r.imageUrl).length;
    
    console.log('📈 RESUMEN GENERAL:');
    console.log(`   ├─ Restaurantes con imagen: ${restaurantsWithImages}/${restaurants.length}`);
    console.log(`   ├─ Productos totales: ${allProducts.length}`);
    console.log(`   ├─ Productos con imagen: ${productsWithImages}/${allProducts.length}`);
    console.log(`   ├─ Porcentaje restaurantes con imagen: ${((restaurantsWithImages / restaurants.length) * 100).toFixed(1)}%`);
    console.log(`   └─ Porcentaje productos con imagen: ${((productsWithImages / allProducts.length) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
if (import.meta.url === `file://${process.argv[1]}`) {
  checkRestaurantsStatus().catch(console.error);
}

export { checkRestaurantsStatus };