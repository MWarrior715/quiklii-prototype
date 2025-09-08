import { Restaurant, MenuItem, MenuModifier, Promotion } from '../types';

export const promotions: Promotion[] = [
  {
    id: '1',
    title: '20% OFF en tu primer pedido',
    description: 'Descuento del 20% en pedidos mayores a $25.000',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 25000,
    validUntil: new Date('2024-12-31'),
    isActive: true
  },
  {
    id: '2',
    title: 'Envío Gratis',
    description: 'Envío gratis en pedidos mayores a $30.000',
    discountType: 'free_delivery',
    discountValue: 0,
    minOrderValue: 30000,
    validUntil: new Date('2024-12-31'),
    isActive: true
  }
];

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Bella Italia',
    image: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg',
    logo: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg',
    cuisine: ['Italiana', 'Pizza', 'Pasta'],
    rating: 4.8,
    reviewCount: 324,
    deliveryTime: '25-35 min',
    deliveryFee: 4500,
    minOrder: 20000,
    isOpen: true,
    openingHours: {
      monday: { open: '11:00', close: '23:00', isOpen: true },
      tuesday: { open: '11:00', close: '23:00', isOpen: true },
      wednesday: { open: '11:00', close: '23:00', isOpen: true },
      thursday: { open: '11:00', close: '23:00', isOpen: true },
      friday: { open: '11:00', close: '24:00', isOpen: true },
      saturday: { open: '11:00', close: '24:00', isOpen: true },
      sunday: { open: '12:00', close: '22:00', isOpen: true }
    },
    description: 'Auténtica cocina italiana con ingredientes frescos y recetas tradicionales.',
    address: {
      street: 'Carrera 15 #93-47',
      city: 'Bogotá',
      neighborhood: 'Chapinero',
      coordinates: { lat: 4.6751, lng: -74.0621 }
    },
    serviceTypes: ['delivery', 'dining'],
    priceRange: 3,
    isPromoted: true,
    promotions: [promotions[0]]
  },
  {
    id: '2',
    name: 'Sakura Sushi',
    image: 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg',
    cuisine: ['Japonesa', 'Sushi', 'Asiática'],
    rating: 4.9,
    reviewCount: 567,
    deliveryTime: '30-45 min',
    deliveryFee: 5500,
    minOrder: 25000,
    isOpen: true,
    openingHours: {
      monday: { open: '12:00', close: '22:00', isOpen: true },
      tuesday: { open: '12:00', close: '22:00', isOpen: true },
      wednesday: { open: '12:00', close: '22:00', isOpen: true },
      thursday: { open: '12:00', close: '22:00', isOpen: true },
      friday: { open: '12:00', close: '23:00', isOpen: true },
      saturday: { open: '12:00', close: '23:00', isOpen: true },
      sunday: { open: '12:00', close: '21:00', isOpen: true }
    },
    description: 'Sushi premium y platos japoneses con los mejores ingredientes.',
    address: {
      street: 'Calle 85 #12-15',
      city: 'Bogotá',
      neighborhood: 'Zona Rosa'
    },
    serviceTypes: ['delivery', 'dining'],
    priceRange: 4,
    isPromoted: false
  },
  {
    id: '3',
    name: 'El Rincón Paisa',
    image: 'https://images.pexels.com/photos/1556698/pexels-photo-1556698.jpeg',
    cuisine: ['Colombiana', 'Antioqueña', 'Tradicional'],
    rating: 4.6,
    reviewCount: 892,
    deliveryTime: '35-50 min',
    deliveryFee: 3500,
    minOrder: 15000,
    isOpen: true,
    openingHours: {
      monday: { open: '06:00', close: '22:00', isOpen: true },
      tuesday: { open: '06:00', close: '22:00', isOpen: true },
      wednesday: { open: '06:00', close: '22:00', isOpen: true },
      thursday: { open: '06:00', close: '22:00', isOpen: true },
      friday: { open: '06:00', close: '23:00', isOpen: true },
      saturday: { open: '06:00', close: '23:00', isOpen: true },
      sunday: { open: '07:00', close: '21:00', isOpen: true }
    },
    description: 'Comida tradicional antioqueña con el sabor de casa.',
    address: {
      street: 'Carrera 7 #45-23',
      city: 'Bogotá',
      neighborhood: 'La Candelaria'
    },
    serviceTypes: ['delivery', 'dining'],
    priceRange: 2,
    isPromoted: false
  },
  {
    id: '4',
    name: 'Green Garden',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    cuisine: ['Saludable', 'Vegetariana', 'Vegana'],
    rating: 4.7,
    reviewCount: 234,
    deliveryTime: '20-30 min',
    deliveryFee: 4000,
    minOrder: 18000,
    isOpen: true,
    openingHours: {
      monday: { open: '07:00', close: '21:00', isOpen: true },
      tuesday: { open: '07:00', close: '21:00', isOpen: true },
      wednesday: { open: '07:00', close: '21:00', isOpen: true },
      thursday: { open: '07:00', close: '21:00', isOpen: true },
      friday: { open: '07:00', close: '21:00', isOpen: true },
      saturday: { open: '08:00', close: '20:00', isOpen: true },
      sunday: { open: '08:00', close: '20:00', isOpen: true }
    },
    description: 'Comida fresca y saludable con ingredientes orgánicos y superalimentos.',
    address: {
      street: 'Calle 70 #11-30',
      city: 'Bogotá',
      neighborhood: 'Zona Rosa'
    },
    serviceTypes: ['delivery'],
    priceRange: 3,
    isPromoted: true,
    promotions: [promotions[1]]
  },
  {
    id: '5',
    name: 'Burger Master',
    image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg',
    cuisine: ['Americana', 'Hamburguesas', 'Comida Rápida'],
    rating: 4.5,
    reviewCount: 1205,
    deliveryTime: '15-25 min',
    deliveryFee: 3000,
    minOrder: 12000,
    isOpen: false,
    openingHours: {
      monday: { open: '11:00', close: '23:00', isOpen: false },
      tuesday: { open: '11:00', close: '23:00', isOpen: false },
      wednesday: { open: '11:00', close: '23:00', isOpen: false },
      thursday: { open: '11:00', close: '23:00', isOpen: false },
      friday: { open: '11:00', close: '24:00', isOpen: false },
      saturday: { open: '11:00', close: '24:00', isOpen: false },
      sunday: { open: '12:00', close: '22:00', isOpen: false }
    },
    description: 'Hamburguesas gourmet y papas fritas con carne premium y ingredientes frescos.',
    address: {
      street: 'Avenida 19 #104-35',
      city: 'Bogotá',
      neighborhood: 'Usaquén'
    },
    serviceTypes: ['delivery', 'dining'],
    priceRange: 2,
    isPromoted: false
  },
  {
    id: '6',
    name: 'Dragon Wok',
    image: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg',
    cuisine: ['China', 'Asiática', 'Wok'],
    rating: 4.4,
    reviewCount: 678,
    deliveryTime: '25-40 min',
    deliveryFee: 4200,
    minOrder: 22000,
    isOpen: true,
    openingHours: {
      monday: { open: '11:30', close: '22:30', isOpen: true },
      tuesday: { open: '11:30', close: '22:30', isOpen: true },
      wednesday: { open: '11:30', close: '22:30', isOpen: true },
      thursday: { open: '11:30', close: '22:30', isOpen: true },
      friday: { open: '11:30', close: '23:30', isOpen: true },
      saturday: { open: '11:30', close: '23:30', isOpen: true },
      sunday: { open: '12:00', close: '22:00', isOpen: true }
    },
    description: 'Platos chinos tradicionales con auténticos sabores del wok.',
    address: {
      street: 'Carrera 13 #67-45',
      city: 'Bogotá',
      neighborhood: 'Chapinero'
    },
    serviceTypes: ['delivery', 'dining'],
    priceRange: 2,
    isPromoted: false
  },
  {
    id: '7',
    name: 'La Noche Bar',
    image: 'https://images.pexels.com/photos/274192/pexels-photo-274192.jpeg',
    cuisine: ['Cócteles', 'Tapas', 'Internacional'],
    rating: 4.3,
    reviewCount: 445,
    deliveryTime: '40-60 min',
    deliveryFee: 6000,
    minOrder: 35000,
    isOpen: true,
    openingHours: {
      monday: { open: '18:00', close: '02:00', isOpen: false },
      tuesday: { open: '18:00', close: '02:00', isOpen: false },
      wednesday: { open: '18:00', close: '02:00', isOpen: true },
      thursday: { open: '18:00', close: '02:00', isOpen: true },
      friday: { open: '18:00', close: '03:00', isOpen: true },
      saturday: { open: '18:00', close: '03:00', isOpen: true },
      sunday: { open: '18:00', close: '24:00', isOpen: true }
    },
    description: 'Bar nocturno con cócteles premium y ambiente exclusivo.',
    address: {
      street: 'Calle 82 #12-50',
      city: 'Bogotá',
      neighborhood: 'Zona Rosa'
    },
    serviceTypes: ['nightlife', 'delivery'],
    priceRange: 4,
    isPromoted: false
  }
];

const modifiers: MenuModifier[] = [
  {
    id: 'size',
    name: 'Tamaño',
    type: 'single',
    required: true,
    options: [
      { id: 'small', name: 'Personal', price: 0 },
      { id: 'medium', name: 'Mediana', price: 5000 },
      { id: 'large', name: 'Grande', price: 8000 }
    ]
  },
  {
    id: 'extras',
    name: 'Extras',
    type: 'multiple',
    required: false,
    options: [
      { id: 'extra_cheese', name: 'Queso extra', price: 3000 },
      { id: 'no_onion', name: 'Sin cebolla', price: 0 },
      { id: 'extra_meat', name: 'Carne extra', price: 5000 },
      { id: 'spicy', name: 'Picante', price: 0 }
    ]
  },
  {
    id: 'cooking',
    name: 'Término de cocción',
    type: 'single',
    required: false,
    options: [
      { id: 'rare', name: 'Poco cocido', price: 0 },
      { id: 'medium', name: 'Término medio', price: 0 },
      { id: 'well_done', name: 'Bien cocido', price: 0 }
    ]
  }
];

export const menuItems: MenuItem[] = [
  // Bella Italia
  {
    id: '1',
    restaurantId: '1',
    name: 'Pizza Margherita',
    description: 'Pizza clásica con salsa de tomate, mozzarella y albahaca fresca',
    price: 28000,
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
    category: 'Pizzas',
    isVegetarian: true,
    isAvailable: true,
    modifiers: [modifiers[0], modifiers[1]],
    preparationTime: 20
  },
  {
    id: '2',
    restaurantId: '1',
    name: 'Spaghetti Carbonara',
    description: 'Pasta tradicional con huevos, queso, panceta y pimienta negra',
    price: 32000,
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    category: 'Pastas',
    isAvailable: true,
    modifiers: [modifiers[1]],
    preparationTime: 15
  },
  {
    id: '3',
    restaurantId: '1',
    name: 'Tiramisu',
    description: 'Postre italiano clásico con café, mascarpone y cacao',
    price: 15000,
    image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg',
    category: 'Postres',
    isVegetarian: true,
    isAvailable: true,
    preparationTime: 5
  },
  // Sakura Sushi
  {
    id: '4',
    restaurantId: '2',
    name: 'Sashimi de Salmón',
    description: 'Láminas frescas de salmón servidas con wasabi y jengibre encurtido',
    price: 35000,
    image: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg',
    category: 'Sashimi',
    isAvailable: true,
    preparationTime: 10
  },
  {
    id: '5',
    restaurantId: '2',
    name: 'California Roll',
    description: 'Cangrejo, aguacate y pepino enrollado en alga nori y arroz',
    price: 22000,
    image: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg',
    category: 'Rolls',
    isAvailable: true,
    preparationTime: 12
  },
  // El Rincón Paisa
  {
    id: '6',
    restaurantId: '3',
    name: 'Bandeja Paisa',
    description: 'Frijoles, arroz, carne molida, chicharrón, chorizo, huevo, plátano y arepa',
    price: 25000,
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    category: 'Platos Principales',
    isAvailable: true,
    preparationTime: 25
  },
  {
    id: '7',
    restaurantId: '3',
    name: 'Arepa con Queso',
    description: 'Arepa de maíz rellena con queso campesino derretido',
    price: 8000,
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
    category: 'Arepas',
    isVegetarian: true,
    isAvailable: true,
    modifiers: [modifiers[1]],
    preparationTime: 8
  },
  // Green Garden
  {
    id: '8',
    restaurantId: '4',
    name: 'Bowl de Quinoa',
    description: 'Quinoa con vegetales asados, aguacate y aderezo de tahini',
    price: 24000,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    category: 'Bowls',
    isVegetarian: true,
    isAvailable: true,
    preparationTime: 15
  },
  {
    id: '9',
    restaurantId: '4',
    name: 'Smoothie Verde',
    description: 'Espinaca, plátano, mango y agua de coco',
    price: 12000,
    image: 'https://images.pexels.com/photos/616833/pexels-photo-616833.jpeg',
    category: 'Bebidas',
    isVegetarian: true,
    isAvailable: true,
    preparationTime: 5
  },
  // Burger Master
  {
    id: '10',
    restaurantId: '5',
    name: 'Burger Clásica',
    description: 'Carne de res, lechuga, tomate, cebolla y salsa especial',
    price: 18000,
    image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg',
    category: 'Hamburguesas',
    isAvailable: false,
    modifiers: [modifiers[1], modifiers[2]],
    preparationTime: 12
  }
];