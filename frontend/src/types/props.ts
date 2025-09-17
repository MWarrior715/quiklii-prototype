import { Page, NavigationData } from './navigation';
import { Restaurant } from '.';

export interface NavigationProps {
  onNavigate: (page: Page, data?: Restaurant | NavigationData) => void;
}

export interface PageProps extends NavigationProps {
  currentPage?: Page;
}

export interface RestaurantPageProps extends NavigationProps {
  restaurant?: Restaurant;
}