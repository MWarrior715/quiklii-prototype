// backend/src/seeders/menuSeed.js

import { fileURLToPath } from "url"; // ✅ Import necesario
import path from "path";
import { sequelize } from "../models/index.js";
import { Restaurant } from "../models/Restaurant.js";
import { MenuItem } from "../models/MenuItem.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedMenuItems = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a la base de datos");

    // 🔄 Limpiar la tabla antes de insertar (solo para desarrollo)
    await MenuItem.destroy({ where: {} });
    console.log("🧹 Tabla MenuItems vaciada (modo desarrollo)");

    // Buscar restaurantes existentes
    const bellaItalia = await Restaurant.findOne({ where: { name: "Bella Italia" } });
    const sakuraSushi = await Restaurant.findOne({ where: { name: "Sakura Sushi" } });
    const saborCriollo = await Restaurant.findOne({ where: { name: "El Sabor Criollo" } });

    if (!bellaItalia || !sakuraSushi || !saborCriollo) {
      throw new Error("❌ No se encontraron los restaurantes iniciales. Ejecuta primero el seeder de restaurantes.");
    }

    const menuItems = [
      // 🍝 Bella Italia
      {
        name: "Pizza Margarita",
        description: "Clásica pizza italiana con tomate, mozzarella y albahaca.",
        price: 25000,
        image: "/images/menu/pizza-margarita.jpg",
        category: "Italiana",
        preparationTime: 20,
        isVegetarian: true,
        restaurantId: bellaItalia.id,
      },
      {
        name: "Pasta Carbonara",
        description: "Pasta con salsa cremosa de huevo, panceta y queso parmesano.",
        price: 28000,
        image: "/images/menu/pasta-carbonara.jpg",
        category: "Italiana",
        preparationTime: 25,
        restaurantId: bellaItalia.id,
      },

      // 🍣 Sakura Sushi
      {
        name: "Sushi Roll",
        description: "Roll clásico de salmón, aguacate y alga nori.",
        price: 22000,
        image: "/images/menu/sushi-roll.jpg",
        category: "Japonesa",
        preparationTime: 15,
        restaurantId: sakuraSushi.id,
      },
      {
        name: "Ramen",
        description: "Sopa japonesa con fideos, cerdo, huevo y vegetales.",
        price: 30000,
        image: "/images/menu/ramen.jpg",
        category: "Japonesa",
        preparationTime: 30,
        restaurantId: sakuraSushi.id,
      },

      // 🇨🇴 El Sabor Criollo
      {
        name: "Bandeja Paisa",
        description: "Plato típico colombiano con frijoles, arroz, chicharrón, huevo y aguacate.",
        price: 35000,
        image: "/images/menu/bandeja-paisa.jpg",
        category: "Comida típica",
        preparationTime: 40,
        restaurantId: saborCriollo.id,
      },
      {
        name: "Arepa Rellena",
        description: "Arepa de maíz rellena de queso y pollo desmechado.",
        price: 12000,
        image: "/images/menu/arepa-rellena.jpg",
        category: "Comida típica",
        preparationTime: 15,
        isVegetarian: false,
        restaurantId: saborCriollo.id,
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
