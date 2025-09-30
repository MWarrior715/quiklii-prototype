// backend/src/seeders/menuSeed.js

import { fileURLToPath } from "url"; // ✅ Import necesario
import path from "path";
import { sequelize } from "../config/database.js";
import { Restaurant, MenuItem } from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedMenuItems = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a la base de datos");

    // 🔄 Limpiar la tabla antes de insertar (para actualizar URLs de imágenes)
    await MenuItem.destroy({ where: {} });
    console.log("🧹 Tabla MenuItems vaciada para actualizar URLs de imágenes");

    // Buscar restaurantes existentes
    const bellaItalia = await Restaurant.findOne({ where: { name: "Bella Italia" } });
    const sakuraSushi = await Restaurant.findOne({ where: { name: "Sakura Sushi" } });
    const saborCriollo = await Restaurant.findOne({ where: { name: "El Sabor Criollo" } });
    const pizzaItalia = await Restaurant.findOne({ where: { name: "Pizza Italia" } });
    const sushiMaster = await Restaurant.findOne({ where: { name: "Sushi Master" } });
    const tacosExpress = await Restaurant.findOne({ where: { name: "Tacos Express" } });
    const burgerKing = await Restaurant.findOne({ where: { name: "Burger King" } });
    const cafeParadiso = await Restaurant.findOne({ where: { name: "Café Paradiso" } });
    const vegetarianHeaven = await Restaurant.findOne({ where: { name: "Vegetarian Heaven" } });

    if (!bellaItalia || !sakuraSushi || !saborCriollo) {
      throw new Error("❌ No se encontraron los restaurantes iniciales. Ejecuta primero el seeder de restaurantes.");
    }

    const menuItems = [
      // 🍝 Bella Italia
      {
        name: "Pizza Margarita",
        description: "Clásica pizza italiana con tomate, mozzarella y albahaca.",
        price: 25000,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
        category: "Italiana",
        preparationTime: 20,
        isVegetarian: true,
        restaurantId: bellaItalia.id,
      },
      {
        name: "Pasta Carbonara",
        description: "Pasta con salsa cremosa de huevo, panceta y queso parmesano.",
        price: 28000,
        image: "https://images.unsplash.com/photo-1551892376-b28f40a0ca4b?w=400&h=300&fit=crop",
        category: "Italiana",
        preparationTime: 25,
        restaurantId: bellaItalia.id,
      },

      // 🍣 Sakura Sushi
      {
        name: "Sushi Roll",
        description: "Roll clásico de salmón, aguacate y alga nori.",
        price: 22000,
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop",
        category: "Japonesa",
        preparationTime: 15,
        restaurantId: sakuraSushi.id,
      },
      {
        name: "Ramen",
        description: "Sopa japonesa con fideos, cerdo, huevo y vegetales.",
        price: 30000,
        image: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400&h=300&fit=crop",
        category: "Japonesa",
        preparationTime: 30,
        restaurantId: sakuraSushi.id,
      },

      // 🇨🇴 El Sabor Criollo
      {
        name: "Bandeja Paisa",
        description: "Plato típico colombiano con frijoles, arroz, chicharrón, huevo y aguacate.",
        price: 35000,
        image: "https://images.unsplash.com/photo-1551782450-17144efb5723?w=400&h=300&fit=crop",
        category: "Comida típica",
        preparationTime: 40,
        restaurantId: saborCriollo.id,
      },
      {
        name: "Arepa Rellena",
        description: "Arepa de maíz rellena de queso y pollo desmechado.",
        price: 12000,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
        category: "Comida típica",
        preparationTime: 15,
        isVegetarian: false,
        restaurantId: saborCriollo.id,
      },

      // 🍕 Pizza Italia
      {
        name: "Pizza Pepperoni",
        description: "Pizza con pepperoni, queso mozzarella y salsa de tomate.",
        price: 27000,
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop",
        category: "Italiana",
        preparationTime: 18,
        isVegetarian: false,
        restaurantId: pizzaItalia?.id || bellaItalia.id,
      },

      // 🌮 Tacos Express
      {
        name: "Tacos al Pastor",
        description: "Tacos de cerdo marinado con piña, cebolla y cilantro.",
        price: 15000,
        image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop",
        category: "Mexicana",
        preparationTime: 12,
        isVegetarian: false,
        restaurantId: tacosExpress?.id || saborCriollo.id,
      },

      // 🍔 Burger King
      {
        name: "Hamburguesa Clásica",
        description: "Hamburguesa con queso, lechuga, tomate y salsa especial.",
        price: 22000,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
        category: "Americana",
        preparationTime: 15,
        isVegetarian: false,
        restaurantId: burgerKing?.id || bellaItalia.id,
      },

      // 🥗 Vegetarian Heaven
      {
        name: "Ensalada Mediterránea",
        description: "Ensalada fresca con vegetales orgánicos, queso feta y aderezo de oliva.",
        price: 18000,
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
        category: "Vegetariana",
        preparationTime: 10,
        isVegetarian: true,
        restaurantId: vegetarianHeaven?.id || bellaItalia.id,
      },
    ];

    await MenuItem.bulkCreate(menuItems);
    console.log("✅ Menús insertados correctamente");
  } catch (error) {
    console.error("❌ Error al ejecutar el seeder:", error);
  } finally {
    await sequelize.close();
    console.log("🔒 Conexión cerrada");
  }
};

// Permitir ejecución directa con `node backend/src/seeders/menuSeed.js`
if (process.argv[1] === __filename) {
  seedMenuItems();
}
