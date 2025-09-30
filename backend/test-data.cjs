const path = require('path');
const { initRestaurant } = require('./src/models/Restaurant.js');
const { Sequelize } = require('sequelize');

// Usar la misma configuración que el backend
const dbPath = path.join(__dirname, 'src/data/database.sqlite');

async function seedData() {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  });

  try {
    // Inicializar modelos
    const Restaurant = initRestaurant(sequelize);

    // Sincronizar base de datos
    await sequelize.sync();

    // Crear datos de prueba
    const restaurants = [
      {
        name: 'Pizza Italia',
        address: 'Calle 123 #45-67, Bogotá',
        phone: '+57 1 2345678',
        category: 'Italiana',
        rating: 4.5,
        description: 'Las mejores pizzas artesanales de Bogotá',
        deliveryTime: 30,
        deliveryFee: 3.00,
        minOrder: 15.00,
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop'
      },
      {
        name: 'Sushi Master',
        address: 'Carrera 45 #123-45, Bogotá',
        phone: '+57 1 3456789',
        category: 'Japonesa',
        rating: 4.2,
        description: 'Sushi fresco preparado por chefs expertos',
        deliveryTime: 25,
        deliveryFee: 4.00,
        minOrder: 20.00,
        imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop'
      },
      {
        name: 'Tacos Express',
        address: 'Avenida 15 #34-56, Bogotá',
        phone: '+57 1 4567890',
        category: 'Mexicana',
        rating: 4.0,
        description: 'Auténticos tacos mexicanos con ingredientes frescos',
        deliveryTime: 20,
        deliveryFee: 2.50,
        minOrder: 10.00,
        imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop'
      },
      {
        name: 'Burger King',
        address: 'Centro Comercial Plaza Central, Bogotá',
        phone: '+57 1 5678901',
        category: 'Americana',
        rating: 4.3,
        description: 'Las mejores hamburguesas artesanales',
        deliveryTime: 35,
        deliveryFee: 3.50,
        minOrder: 12.00,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop'
      },
      {
        name: 'Café Paradiso',
        address: 'Carrera 7 #24-89, Bogotá',
        phone: '+57 1 6789012',
        category: 'Mediterránea',
        rating: 4.6,
        description: 'Café y comidas mediterráneas en un ambiente acogedor',
        deliveryTime: 15,
        deliveryFee: 1.50,
        minOrder: 8.00,
        imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
      },
      {
        name: 'Vegetarian Heaven',
        address: 'Calle 85 #13-45, Bogotá',
        phone: '+57 1 7890123',
        category: 'Vegetariana',
        rating: 4.4,
        description: 'Comida vegetariana orgánica y saludable',
        deliveryTime: 28,
        deliveryFee: 2.00,
        minOrder: 18.00,
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop'
      }
    ];

    // Insertar datos
    for (const restaurantData of restaurants) {
      const [restaurant, created] = await Restaurant.findOrCreate({
        where: { name: restaurantData.name },
        defaults: restaurantData
      });

      if (created) {
        console.log(`✅ Creado: ${restaurant.name}`);
      } else {
        console.log(`📝 Ya existe: ${restaurant.name}`);
      }
    }

    console.log('🎉 Datos de prueba creados exitosamente!');
    console.log('📊 Total de restaurantes en BD:', await Restaurant.count());

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedData();
}

module.exports = { seedData };