import { Restaurant, MenuItem } from '../src/models/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapeo de restaurantes con sus imágenes locales
const restaurantImageMap = {
  'Sakura Sushi': '/uploads/images/restaurants/sakura-sushi.jpg',
  'Café Paradiso': '/uploads/images/restaurants/cafe-paradiso.jpg',
  'Bella Italia': '/uploads/images/restaurants/bella-italia.jpg',
  'Pizza Italia': '/uploads/images/restaurants/pizza-italia.jpg',
  'Vegetarian Heaven': '/uploads/images/restaurants/vegetarian-heaven.jpg',
  'El Sabor Criollo': '/uploads/images/restaurants/el-sabor-criollo.jpg',
  'Burger King': '/uploads/images/restaurants/burger-king.jpg',
  'Sushi Master': '/uploads/images/restaurants/sushi-master.jpg',
  'Tacos Express': '/uploads/images/restaurants/taco-express.jpeg'
};

// Mapeo de productos con sus imágenes locales (2 por restaurante)
const productImageMap = {
  // Sakura Sushi
  'Sakura Roll': '/uploads/images/products/sushi-variado.jpeg',
  'Nigiri de Salmón': '/uploads/images/products/sushi-atun-fresco.jpg',
  
  // Café Paradiso
  'Café Latte': '/uploads/images/products/cafe-con-croissant.jpeg',
  'Brownie de Chocolate': '/uploads/images/products/cafe-con-croissant.jpeg',
  
  // Bella Italia
  'Lasagna Clásica': '/uploads/images/products/pasta-carbonera.jpeg',
  'Ravioli de Queso': '/uploads/images/products/pasta-alfredo-cremosa.jpg',
  
  // Pizza Italia
  'Pizza Pepperoni': '/uploads/images/products/pizza-margarita-real.jpg',
  'Pizza Hawaiana': '/uploads/images/products/pizza-margarita-real.jpg',
  
  // Vegetarian Heaven
  'Smoothie Verde': '/uploads/images/products/ensalada-natural.jpeg',
  'Tofu Salteado': '/uploads/images/products/wok-vegetales-salteados.jpg',
  
  // El Sabor Criollo
  'Arepa de Queso': '/uploads/images/products/tacos-al-pastor.jpeg',
  'Arroz con Pollo': '/uploads/images/products/bandeja-paisa-completa.jpg',
  
  // Burger King
  'Hamburguesa Doble Queso': '/uploads/images/products/hamburguesa-doble-queso.jpg',
  'Papas Fritas': '/uploads/images/products/hamburguesa-clasica.jpeg',
  
  // Sushi Master
  'Sashimi de Atún': '/uploads/images/products/sushi-atun-fresco.jpg',
  'Tempura de Camarón': '/uploads/images/products/sushi-variado.jpeg',
  
  // Tacos Express
  'Taco de Carne': '/uploads/images/products/tacos-al-pastor.jpeg',
  'Taco con Guacamole': '/uploads/images/products/tacos-al-pastor.jpeg'
};

async function updateRestaurantImages() {
  console.log('🔄 Actualizando imágenes de restaurantes...');
  
  for (const [restaurantName, localImagePath] of Object.entries(restaurantImageMap)) {
    try {
      const [updatedRows] = await Restaurant.update(
        { imageUrl: localImagePath },
        { where: { name: restaurantName } }
      );
      
      if (updatedRows > 0) {
        console.log(`✅ Restaurant "${restaurantName}" actualizado con imagen local: ${localImagePath}`);
      } else {
        console.log(`⚠️ No se encontró el restaurante "${restaurantName}"`);
      }
    } catch (error) {
      console.error(`❌ Error actualizando restaurante "${restaurantName}":`, error.message);
    }
  }
}

async function updateProductImages() {
  console.log('🔄 Actualizando imágenes de productos...');
  
  for (const [productName, localImagePath] of Object.entries(productImageMap)) {
    try {
      const [updatedRows] = await MenuItem.update(
        { image: localImagePath },
        { where: { name: productName } }
      );
      
      if (updatedRows > 0) {
        console.log(`✅ Producto "${productName}" actualizado con imagen local: ${localImagePath}`);
      } else {
        console.log(`⚠️ No se encontró el producto "${productName}"`);
      }
    } catch (error) {
      console.error(`❌ Error actualizando producto "${productName}":`, error.message);
    }
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando actualización de imágenes a rutas locales...');
    
    await updateRestaurantImages();
    await updateProductImages();
    
    console.log('✅ Actualización de imágenes completada!');
    
    // Verificar actualizaciones
    console.log('\n🔍 Verificando actualizaciones:');
    const restaurants = await Restaurant.findAll({ attributes: ['name', 'imageUrl'] });
    const products = await MenuItem.findAll({ attributes: ['name', 'image'] });
    
    console.log('\nRestaurantes con imágenes locales:');
    restaurants.forEach(r => {
      console.log(`  - ${r.name}: ${r.imageUrl}`);
    });
    
    console.log('\nProductos con imágenes locales:');
    products.forEach(p => {
      console.log(`  - ${p.name}: ${p.image}`);
    });
    
  } catch (error) {
    console.error('❌ Error en la actualización:', error);
  } finally {
    process.exit(0);
  }
}

main();