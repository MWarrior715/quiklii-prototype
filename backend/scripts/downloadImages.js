import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_DIR = path.join(__dirname, "../uploads/images");

// 9 Restaurantes (incluye nueva imagen para Tacos Express)
const restaurants = {
  "sakura-sushi.jpg": "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop&q=80",
  "cafe-paradiso.jpg": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&q=80",
  "bella-italia.jpg": "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop&q=80",
  "pizza-italia.jpg": "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=400&h=300&fit=crop&q=80",
  "vegetarian-heaven.jpg": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop&q=80",
  "el-sabor-criollo.jpg": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop&q=80",
  "burger-king.jpg": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop&q=80",
  "sushi-master.jpg": "https://images.unsplash.com/photo-1562158070-622a3c27e43d?w=400&h=300&fit=crop&q=80",
  "tacos-express.jpg": "https://images.unsplash.com/photo-1608032720868-9f40d3c1f9ac?w=400&h=300&fit=crop&q=80" // nueva
};

// 18 Productos (2 por cada restaurante)
const products = {
  // Sakura Sushi
  "sakura-roll.jpg": "https://images.unsplash.com/photo-1606788075761-3dd3e7f3fdfb?w=400&h=300&fit=crop&q=80",
  "sakura-nigiri.jpg": "https://images.unsplash.com/photo-1562158070-622a3c27e43d?w=400&h=300&fit=crop&q=80",

  // Café Paradiso
  "cafe-latte.jpg": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&q=80",
  "cafe-brownie.jpg": "https://images.unsplash.com/photo-1548946526-f69e2424cf45?w=400&h=300&fit=crop&q=80",

  // Bella Italia
  "bella-lasagna.jpg": "https://images.unsplash.com/photo-1603133872878-684f1463c1f7?w=400&h=300&fit=crop&q=80",
  "bella-ravioli.jpg": "https://images.unsplash.com/photo-1603079842129-56d46a8c0c04?w=400&h=300&fit=crop&q=80",

  // Pizza Italia
  "pizza-pepperoni.jpg": "https://images.unsplash.com/photo-1601924928383-b6d0bb7698e8?w=400&h=300&fit=crop&q=80",
  "pizza-hawaiana.jpg": "https://images.unsplash.com/photo-1601924571720-6fef8f4d4a29?w=400&h=300&fit=crop&q=80",

  // Vegetarian Heaven
  "veg-smoothie.jpg": "https://images.unsplash.com/photo-1604908176917-43f46e1d52a5?w=400&h=300&fit=crop&q=80",
  "veg-tofu.jpg": "https://images.unsplash.com/photo-1574920162043-35f84e07f3ef?w=400&h=300&fit=crop&q=80",

  // El Sabor Criollo
  "criollo-arepa.jpg": "https://images.unsplash.com/photo-1633945274405-09a3f1ad7881?w=400&h=300&fit=crop&q=80",
  "criollo-arroz.jpg": "https://images.unsplash.com/photo-1625944524692-f3e1e046334d?w=400&h=300&fit=crop&q=80",

  // Burger King
  "burger-doble.jpg": "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop&q=80",
  "burger-papas.jpg": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop&q=80",

  // Sushi Master
  "sushi-master-sashimi.jpg": "https://images.unsplash.com/photo-1606788075761-3dd3e7f3fdfb?w=400&h=300&fit=crop&q=80",
  "sushi-master-tempura.jpg": "https://images.unsplash.com/photo-1603133872878-684f1463c1f7?w=400&h=300&fit=crop&q=80",

  // Tacos Express
  "taco-carne.jpg": "https://images.unsplash.com/photo-1608032720868-9f40d3c1f9ac?w=400&h=300&fit=crop&q=80",
  "taco-guacamole.jpg": "https://images.unsplash.com/photo-1617196039904-6ad419d6a28e?w=400&h=300&fit=crop&q=80"
};

async function downloadImage(url, filepath) {
  const writer = fs.createWriteStream(filepath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream"
  });

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function main() {
  fs.mkdirSync(path.join(BASE_DIR, "restaurants"), { recursive: true });
  fs.mkdirSync(path.join(BASE_DIR, "products"), { recursive: true });

  for (const [filename, url] of Object.entries(restaurants)) {
    const filepath = path.join(BASE_DIR, "restaurants", filename);
    console.log(`⬇️  Descargando restaurante: ${filename}`);
    await downloadImage(url, filepath);
  }

  for (const [filename, url] of Object.entries(products)) {
    const filepath = path.join(BASE_DIR, "products", filename);
    console.log(`⬇️  Descargando producto: ${filename}`);
    await downloadImage(url, filepath);
  }

  console.log("✅ Todas las imágenes fueron descargadas correctamente");
}

main().catch(console.error);
