import { Business, Category } from '../../mongo/interfaces';

export interface BusinessResponse
  extends Omit<Business, 'categoryId'> {
  category: Category | null;
}