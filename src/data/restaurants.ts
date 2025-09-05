import { Restaurant, MenuItem } from '../types';

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Bella Italia',
    image: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg',
    cuisine: 'Italian',
    rating: 4.8,
    deliveryTime: '25-35 min',
    deliveryFee: 2.99,
    minOrder: 15,
    isOpen: true,
    description: 'Authentic Italian cuisine with fresh ingredients and traditional recipes.'
  },
  {
    id: '2',
    name: 'Sakura Sushi',
    image: 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg',
    cuisine: 'Japanese',
    rating: 4.9,
    deliveryTime: '30-45 min',
    deliveryFee: 3.49,
    minOrder: 20,
    isOpen: true,
    description: 'Premium sushi and Japanese dishes made with the finest ingredients.'
  },
  {
    id: '3',
    name: 'Spice Palace',
    image: 'https://images.pexels.com/photos/1556698/pexels-photo-1556698.jpeg',
    cuisine: 'Indian',
    rating: 4.6,
    deliveryTime: '35-50 min',
    deliveryFee: 2.49,
    minOrder: 12,
    isOpen: true,
    description: 'Aromatic Indian curries and tandoor specialties bursting with flavor.'
  },
  {
    id: '4',
    name: 'Green Garden',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    cuisine: 'Healthy',
    rating: 4.7,
    deliveryTime: '20-30 min',
    deliveryFee: 1.99,
    minOrder: 10,
    isOpen: true,
    description: 'Fresh, healthy meals made with organic ingredients and superfoods.'
  },
  {
    id: '5',
    name: 'Burger Master',
    image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg',
    cuisine: 'American',
    rating: 4.5,
    deliveryTime: '15-25 min',
    deliveryFee: 2.99,
    minOrder: 8,
    isOpen: false,
    description: 'Gourmet burgers and fries made with premium beef and fresh toppings.'
  },
  {
    id: '6',
    name: 'Dragon Wok',
    image: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg',
    cuisine: 'Chinese',
    rating: 4.4,
    deliveryTime: '25-40 min',
    deliveryFee: 2.49,
    minOrder: 15,
    isOpen: true,
    description: 'Traditional Chinese dishes with authentic wok-cooked flavors.'
  }
];

export const menuItems: MenuItem[] = [
  // Bella Italia
  {
    id: '1',
    restaurantId: '1',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
    price: 12.99,
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
    category: 'Pizza',
    isVegetarian: true
  },
  {
    id: '2',
    restaurantId: '1',
    name: 'Spaghetti Carbonara',
    description: 'Traditional pasta with eggs, cheese, pancetta, and black pepper',
    price: 14.99,
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    category: 'Pasta'
  },
  {
    id: '3',
    restaurantId: '1',
    name: 'Tiramisu',
    description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
    price: 6.99,
    image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg',
    category: 'Dessert',
    isVegetarian: true
  },
  // Sakura Sushi
  {
    id: '4',
    restaurantId: '2',
    name: 'Salmon Sashimi',
    description: 'Fresh salmon slices served with wasabi and pickled ginger',
    price: 16.99,
    image: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg',
    category: 'Sashimi'
  },
  {
    id: '5',
    restaurantId: '2',
    name: 'California Roll',
    description: 'Crab, avocado, and cucumber rolled in seaweed and rice',
    price: 8.99,
    image: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg',
    category: 'Rolls'
  },
  // Spice Palace
  {
    id: '6',
    restaurantId: '3',
    name: 'Butter Chicken',
    description: 'Tender chicken in a rich, creamy tomato-based curry sauce',
    price: 15.99,
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    category: 'Curry',
    isSpicy: true
  },
  {
    id: '7',
    restaurantId: '3',
    name: 'Vegetable Biryani',
    description: 'Aromatic basmati rice with mixed vegetables and Indian spices',
    price: 12.99,
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
    category: 'Rice',
    isVegetarian: true
  },
  // Green Garden
  {
    id: '8',
    restaurantId: '4',
    name: 'Quinoa Buddha Bowl',
    description: 'Quinoa with roasted vegetables, avocado, and tahini dressing',
    price: 11.99,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    category: 'Bowls',
    isVegetarian: true
  },
  {
    id: '9',
    restaurantId: '4',
    name: 'Green Smoothie',
    description: 'Spinach, banana, mango, and coconut water blend',
    price: 6.99,
    image: 'https://images.pexels.com/photos/616833/pexels-photo-616833.jpeg',
    category: 'Beverages',
    isVegetarian: true
  }
];