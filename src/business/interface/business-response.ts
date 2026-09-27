import { Business, Category, User } from '../../mongo/interfaces';

export interface BusinessResponse
  extends Omit<Business, 'categoryId' | 'assignedTo'> {
  category: Category | null;
  assignee: User | null;
}