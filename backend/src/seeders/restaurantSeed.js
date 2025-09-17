import { Restaurant } from '../models/Restaurant.js';

// Datos de ejemplo para restaurantes
const restaurantSeedData = [
  {
    name: 'Bella Italia',
    address: 'Carrera 11 #93-07, Zona Rosa, Bogotá',
    phone: '+571234567890',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    category: 'Italiana',
    rating: 4.5,
    description: 'Auténtica cocina italiana con las mejores pastas y pizzas artesanales de la ciudad. Ambiente acogedor y familiar.',
    deliveryTime: 35,
    deliveryFee: 4500.00,
    minOrder: 25000.00,
    openingTime: '11:00:00',
    closingTime: '23:00:00'
  },
  {
    name: 'Sakura Sushi',
    address: 'Calle 79 #11-45, Zona T, Bogotá',
    phone: '+571234567891',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
    category: 'Japonesa',
    rating: 4.7,
    description: 'Sushi fresco y auténtica comida japonesa preparada por chefs especializados. Ingredientes importados de la más alta calidad.',
    deliveryTime: 40,
    deliveryFee: 5000.00,
    minOrder: 30000.00,
    openingTime: '12:00:00',
    closingTime: '22:30:00'
  },
  {
    name: 'El Sabor Criollo',
    address: 'Carrera 7 #72-35, Centro Histórico, Bogotá',
    phone: '+571234567892',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    category: 'Comida local',
    rating: 4.3,
    description: 'La mejor comida tradicional colombiana. Bandeja paisa, ajiaco, sancocho y más delicias de nuestra tierra.',
    deliveryTime: 25,
    deliveryFee: 3500.00,
    minOrder: 20000.00,
    openingTime: '10:00:00',
    closingTime: '21:00:00'
  }
];

// Función para poblar la base de datos con restaurantes de ejemplo
export const seedRestaurants = async () => {
  try {
    console.log('🌱 Iniciando seed de restaurantes...');
    
    // Verificar si ya existen restaurantes
    const existingRestaurants = await Restaurant.count();
    
    if (existingRestaurants > 0) {
      console.log(`⚠️  Ya existen ${existingRestaurants} restaurantes en la base de datos.`);
      console.log('💡 Para recrear los datos, elimina los restaurantes existentes primero.');
      return;
    }
    
    // Crear restaurantes de ejemplo
    const createdRestaurants = await Restaurant.bulkCreate(restaurantSeedData);
    
    console.log(`✅ ${createdRestaurants.length} restaurantes creados exitosamente:`);
    createdRestaurants.forEach((restaurant, index) => {
      console.log(`   ${index + 1}. ${restaurant.name} (${restaurant.category}) - ⭐${restaurant.rating}`);
    });
    
    return createdRestaurants;
    
  } catch (error) {
    console.error('❌ Error en seed de restaurantes:', error);
    throw error;
  }
};

// Función para limpiar todos los restaurantes (útil para desarrollo)
export const clearRestaurants = async () => {
  try {
    console.log('🗑️  Limpiando restaurantes existentes...');
    
    const deletedCount = await Restaurant.destroy({
      where: {},
      truncate: true
    });
    
    console.log(`✅ ${deletedCount} restaurantes eliminados.`);
    
  } catch (error) {
    console.error('❌ Error limpiando restaurantes:', error);
    throw error;
  }
};

// Función para recrear los datos (limpiar y crear de nuevo)
export const reseedRestaurants = async () => {
  try {
    await clearRestaurants();
    await seedRestaurants();
    console.log('🎉 Reseed de restaurantes completado!');
    
  } catch (error) {
    console.error('❌ Error en reseed de restaurantes:', error);
    throw error;
  }
};

// Si se ejecuta directamente el archivo
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRestaurants()
    .then(() => {
      console.log('✅ Seed completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en seed:', error);
      process.exit(1);
    });
}
