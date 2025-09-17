export * from './navigation';
export * from './props';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isPhoneVerified: boolean;
  address?: Address;
  favoriteRestaurants: string[];
  createdAt: Date;
}

export interface Address {
  street: string;
  city: string;
  neighborhood: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  instructions?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  logo?: string;
  cuisine: string[];
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  isOpen: boolean;
  openingHours: OpeningHours;
  description: string;
  address: Address;
  serviceTypes: ServiceType[];
  priceRange: 1 | 2 | 3 | 4; // $ to $$$$
  isPromoted: boolean;
  promotions?: Promotion[];
}

export interface OpeningHours {
  [key: string]: {
    open: string;
    close: string;
    isOpen: boolean;
  };
}

export type ServiceType = 'delivery' | 'dining' | 'nightlife';

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  isAvailable: boolean;
  modifiers?: MenuModifier[];
  preparationTime?: number;
}

export interface MenuModifier {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  restaurant: Restaurant;
  selectedModifiers: SelectedModifier[];
  specialInstructions?: string;
}

export interface SelectedModifier {
  modifierId: string;
  optionId: string;
  name: string;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  restaurant: Restaurant;
  total: number;
  deliveryFee: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryAddress: Address;
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date;
  createdAt: Date;
  riderId?: string;
  riderLocation?: {
    lat: number;
    lng: number;
  };
  trackingCode: string;
}

export interface OrderCreate {
  restaurantId: string;
  items: {
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
    selectedModifiers?: {
      modifierId: string;
      optionId: string;
    }[];
  }[];
  deliveryAddress: string;
  deliveryInstructions?: string;
  paymentMethod: PaymentMethod;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'picked_up' 
  | 'on_way' 
  | 'delivered' 
  | 'cancelled';

export type PaymentMethod = 
  | 'mercadopago' 
  | 'payu' 
  | 'pse' 
  | 'nequi' 
  | 'daviplata' 
  | 'cash';

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_delivery';
  discountValue: number;
  minOrderValue?: number;
  validUntil: Date;
  isActive: boolean;
}

export interface SearchFilters {
  serviceType: ServiceType | 'all';
  cuisine: string[];
  priceRange: number[];
  rating: number;
  openNow: boolean;
  hasPromotions: boolean;
  deliveryTime: number; // max minutes
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'general';
  isRead: boolean;
  createdAt: Date;
  orderId?: string;
}