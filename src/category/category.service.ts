import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { MongoService } from '../mongo/mongo.service';
import { Category } from '../mongo/interfaces/category.interface';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryFilterDto } from './dto/category-filter.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly mongo: MongoService) {}

  /**
   * Create a new category
   */
  async create(
    dto: CreateCategoryDto,
    userId: string,
  ): Promise<Category> {
    const existingCategory = await this.mongo.models.category
      .findOne({
        name: dto.name,
      })
      .lean()
      .exec();

    if (existingCategory) {
      throw new ConflictException(
        'Category with this name already exists.',
      );
    }

    // to-do: Implement logic to set the createdBy field
    const createdBy = new Types.ObjectId(userId);
    const category = new this.mongo.models.category({
      name: dto.name,
      description: dto.description,
      isActive: true,
      createdBy,
    });

    return await category.save();
  }

  /**
   * Get all active categories
   */
  async findAll(
    query: CategoryFilterDto,
  ): Promise<{
    data: Category[];
    total: number;
  }> {
    const {
      search,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const skip = (page - 1) * limit;

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [data, total] = await Promise.all([
      this.mongo.models.category
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),

      this.mongo.models.category.countDocuments(filter),
    ]);

    return {
      data,
      total
    };
  }

  /**
   * Get category by ID
   */
  async findById(id: string): Promise<Category> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid category id.');
    }

    const category = await this.mongo.models.category
      .findOne({
        _id: id,
        isActive: true,
      })
      .lean()
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    return category;
  }

  /**
   * Get autocomplete suggestions for categories
   * @param search 
   * @returns 
   */
  async autocomplete(search?: string): Promise<Category[]> {
    const filter: Record<string, any> = {
      isActive: true,
    };

    if (search) {
      filter.name = {
        $regex: search,
        $options: 'i',
      };
    }

    return this.mongo.models.category
      .find(filter)
      .select('_id name')
      .sort({ name: 1 })
      .limit(20)
      .lean()
      .exec();
  }

  /**
   * Update category
   */
  async update(
    id: string,
    dto: UpdateCategoryDto,
    userId: string,
  ): Promise<Category> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid category id.');
    }

    // Check duplicate category name
    if (dto.name) {
      const existingCategory = await this.mongo.models.category
        .findOne({
          name: dto.name,
          _id: { $ne: id },
        })
        .lean()
        .exec();

      if (existingCategory) {
        throw new ConflictException(
          'Category with this name already exists.',
        );
      }
    }

    // to-do: Implement logic to set the updatedBy field
    const updatedBy = new Types.ObjectId(userId);

    const updateData: Record<string, any> = {
      ...dto,
      updatedBy,
    };

    const updatedCategory = await this.mongo.models.category
      .findOneAndUpdate(
        {
          _id: id,
          isActive: true,
        },
        updateData,
        {
          new: true,
          runValidators: true,
        },
      )
      .lean()
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException('Category not found.');
    }

    return updatedCategory;
  }

  /**
   * Activate or deactivate category
   */
  async updateStatus(
    id: string,
    isActive: boolean,
    userId: string,
  ): Promise<Category> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid category id.');
    }

    // to-do: Implement logic to set the updatedBy field
    const updatedBy = new Types.ObjectId(userId);

    const category = await this.mongo.models.category
      .findOneAndUpdate(
        { _id: id },
        {
          isActive,
          updatedBy,
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .lean()
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    return category;
  }
}