import {
  ConflictException,
  Injectable,
  Logger,
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
  private readonly logger = new Logger(CategoryService.name);

  constructor(private readonly mongo: MongoService) {}

  /**
   * Create a new category
   */
  async create(
    dto: CreateCategoryDto,
    userId: string,
  ): Promise<Category> {
    this.logger.log(
      `Creating category. Name: ${dto.name}, User ID: ${userId}`,
    );

    const existingCategory =
      await this.mongo.models.category
        .findOne({
          name: dto.name,
        })
        .lean()
        .exec();

    if (existingCategory) {
      this.logger.warn(
        `Category already exists. Name: ${dto.name}`,
      );

      throw new ConflictException(
        'Category with this name already exists.',
      );
    }

    const createdBy = new Types.ObjectId(userId);

    const category = new this.mongo.models.category({
      name: dto.name,
      description: dto.description,
      isActive: true,
      createdBy,
    });

    const createdCategory = await category.save();

    this.logger.log(
      `Category created successfully. Category ID: ${createdCategory._id}`,
    );

    return createdCategory.toObject() as Category;
  }

  /**
   * Get all categories
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

    this.logger.log(
      `Fetching categories. Page: ${page}, Limit: ${limit}, Search: ${search || 'none'}`,
    );

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          description: {
            $regex: search,
            $options: 'i',
          },
        },
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

      this.mongo.models.category
        .countDocuments(filter),
    ]);

    this.logger.log(
      `Categories fetched successfully. Count: ${data.length}, Total: ${total}`,
    );

    return {
      data: data as Category[],
      total,
    };
  }

  /**
   * Get category by ID
   */
  async findById(id: string): Promise<Category> {
    this.logger.log(
      `Fetching category by ID: ${id}`,
    );

    if (!Types.ObjectId.isValid(id)) {
      this.logger.warn(
        `Invalid category ID: ${id}`,
      );

      throw new NotFoundException(
        'Invalid category id.',
      );
    }

    const category =
      await this.mongo.models.category
        .findOne({
          _id: id,
          isActive: true,
        })
        .lean()
        .exec();

    if (!category) {
      this.logger.warn(
        `Category not found. Category ID: ${id}`,
      );

      throw new NotFoundException(
        'Category not found.',
      );
    }

    this.logger.log(
      `Category fetched successfully. Category ID: ${id}`,
    );

    return category as Category;
  }

  /**
   * Get autocomplete suggestions for categories
   */
  async autocomplete(
    search?: string,
  ): Promise<Category[]> {
    this.logger.log(
      `Fetching category autocomplete. Search: ${search || 'none'}`,
    );

    const filter: Record<string, any> = {
      isActive: true,
    };

    if (search) {
      filter.name = {
        $regex: search,
        $options: 'i',
      };
    }

    const categories =
      await this.mongo.models.category
        .find(filter)
        .select('_id name')
        .sort({ name: 1 })
        .limit(20)
        .lean()
        .exec();

    this.logger.log(
      `Category autocomplete completed. Count: ${categories.length}`,
    );

    return categories as Category[];
  }

  /**
   * Update category
   */
  async update(
    id: string,
    dto: UpdateCategoryDto,
    userId: string,
  ): Promise<Category> {
    this.logger.log(
      `Updating category. Category ID: ${id}, User ID: ${userId}`,
    );

    if (!Types.ObjectId.isValid(id)) {
      this.logger.warn(
        `Invalid category ID: ${id}`,
      );

      throw new NotFoundException(
        'Invalid category id.',
      );
    }

    // Check duplicate category name
    if (dto.name) {
      const existingCategory =
        await this.mongo.models.category
          .findOne({
            name: dto.name,
            _id: {
              $ne: id,
            },
          })
          .lean()
          .exec();

      if (existingCategory) {
        this.logger.warn(
          `Duplicate category name found. Name: ${dto.name}`,
        );

        throw new ConflictException(
          'Category with this name already exists.',
        );
      }
    }

    const updatedBy = new Types.ObjectId(userId);

    const updateData: Record<string, any> = {
      ...dto,
      updatedBy,
    };

    const updatedCategory =
      await this.mongo.models.category
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
      this.logger.warn(
        `Category not found while updating. Category ID: ${id}`,
      );

      throw new NotFoundException(
        'Category not found.',
      );
    }

    this.logger.log(
      `Category updated successfully. Category ID: ${id}`,
    );

    return updatedCategory as Category;
  }

  /**
   * Activate or deactivate category
   */
  async updateStatus(
    id: string,
    isActive: boolean,
    userId: string,
  ): Promise<Category> {
    this.logger.log(
      `Updating category status. Category ID: ${id}, Active: ${isActive}, User ID: ${userId}`,
    );

    if (!Types.ObjectId.isValid(id)) {
      this.logger.warn(
        `Invalid category ID: ${id}`,
      );

      throw new NotFoundException(
        'Invalid category id.',
      );
    }

    const updatedBy = new Types.ObjectId(userId);

    const category =
      await this.mongo.models.category
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
      this.logger.warn(
        `Category not found while updating status. Category ID: ${id}`,
      );

      throw new NotFoundException(
        'Category not found.',
      );
    }

    this.logger.log(
      `Category status updated successfully. Category ID: ${id}, Active: ${isActive}`,
    );

    return category as Category;
  }
}