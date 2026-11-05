import { Types } from 'mongoose';
import { Business, Category, Tag, User } from '../../mongo/interfaces';

export interface BusinessResponse
  extends Omit<Business, 'categoryId' | 'assignedTo'> {
  category: Category | null;
  assignee: User | null;
  tags: Tag[];
}