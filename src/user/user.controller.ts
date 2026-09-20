import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/get-user-filter.dto';
import { UserAutocompleteDto } from './dto/user-autocomplete.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('autocomplete')
  @ApiOperation({
    summary: 'Autocomplete user',
    description: 'Returns users matching the search text.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully.',
  })
  async autocomplete(@Query() query: UserAutocompleteDto) {
    return await this.userService.autocomplete(query.search);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
  })
  @ApiResponse({
    status: 409,
    description: 'User with the email or phone number already exists.',
  })
  async create(@Body() dto: CreateUserDto) {
    return await this.userService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully.',
  })
  async findAll(@Query() query: UserFilterDto) {
    return await this.userService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async findById(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return await this.userService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft delete user',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async delete(@Param('id') id: string) {
    return await this.userService.deleteUser(id);
  }
}