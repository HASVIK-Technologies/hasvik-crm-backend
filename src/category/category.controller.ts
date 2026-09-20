import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryFilterDto } from './dto/category-filter.dto';
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto';
import { CategoryAutocompleteDto } from './dto/category-autocomplete.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permission } from '../auth/enums/permission.enum';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}
  
  @Get('autocomplete')
  @Permissions(Permission.CATEGORY_READ)
  @ApiOperation({
    summary: 'Autocomplete categories',
    description: 'Returns active categories matching the search text.',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully.',
  })
  async autocomplete(@Query() query: CategoryAutocompleteDto) {
    return await this.categoryService.autocomplete(query.search);
  }

  /**
   * Create a new category
   */
  @Post()
  @Permissions(Permission.CATEGORY_CREATE)
  @ApiOperation({
    summary: 'Create a new category',
    description: 'Creates a new business category.',
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully.',
  })
  @ApiResponse({
    status: 409,
    description: 'Category already exists.',
  })
  async create(
    @Body() dto: CreateCategoryDto,
  ) {
    // Replace with authenticated user ID
    const userId = '6a8f3be16f9d9afdbc79974f';

    return await this.categoryService.create(dto, userId);
  }

  /**
   * Get all categories
   */
  @Get()
  @Permissions(Permission.CATEGORY_READ)
  @ApiOperation({
    summary: 'Get categories',
    description: 'Returns a paginated list of categories.',
  })
  async findAll(@Query() query: CategoryFilterDto) {
    return await this.categoryService.findAll(query);
  }


  /**
   * Get category by ID
   */
  @Get(':id')
  @Permissions(Permission.CATEGORY_READ)
  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Returns a business category using its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '665c12345678901234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
  })
  async findById(
    @Param('id') id: string,
  ) {
    return await this.categoryService.findById(id);
  }

  /**
   * Update category
   */
  @Patch(':id')
  @Patch(':id')
  @ApiOperation({
    summary: 'Update category',
    description: 'Updates category name, description, or active status.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '665c12345678901234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Category with the same name already exists.',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    // Replace with authenticated user ID
    const userId = '6a8f3be16f9d9afdbc79974f';

    return await this.categoryService.update(id, dto, userId);
  }

  /**
   * Update category status
   */
  @Patch(':id/status')
  @Permissions(Permission.CATEGORY_UPDATE)
  @ApiOperation({
    summary: 'Update category status',
    description: 'Activates or deactivates a category.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '665c12345678901234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Category status updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
  })
  @Permissions(Permission.CATEGORY_UPDATE)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryStatusDto,
  ) {
    // Replace with authenticated user ID
    const userId = '6a8f3be16f9d9afdbc79974f';

    return await this.categoryService.updateStatus(
      id,
      dto.isDeleted,
      userId,
    );
  }

}