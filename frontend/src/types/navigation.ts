import { Restaurant } from '.';

export type Page = 'home' | 'restaurants' | 'restaurant' | 'login' | 'cart' | 'checkout' | 'orders' | 'profile' | 'subscription';

export type NavigationData = {
  restaurant?: Restaurant;
  items?: Array<{
    menuItemId: number;
    quantity: number;
    specialInstructions?: string;
    selectedModifiers?: Array<{
      modifierId: number;
      optionId: number;
    }>;
  }>;
  restaurantId?: number;
  total?: number;
  deliveryFee?: number;
};