import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto, UserKPIsDto } from './dto/get-user-filter.dto';
import { UserAutocompleteDto } from './dto/user-autocomplete.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permission.enum';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
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
  //@Permissions(Permission.USER_READ)
  async autocomplete(@Query() query: UserAutocompleteDto, @Req() req: any) {
    const tenantId = req.user.tenantId;
    return await this.userService.autocomplete(tenantId, query.search);
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
  //@Permissions(Permission.USER_CREATE)
  async create(
    @Body() dto: CreateUserDto,
    @Req() req: any
  ) {
    const tenantId = req.user.tenantId;
    return await this.userService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully.',
  })
  //@Permissions(Permission.USER_READ)
  async findAll(@Query() query: UserFilterDto, @Req() req: any) {
    return await this.userService.findAll(req.user, query);
  }

  @Get('kpis')
  @ApiOperation({
    summary: 'Get user KPIs',
    description: 'Returns total, active, and inactive user counts.',
  })
  @ApiResponse({
    status: 200,
    description: 'User KPIs retrieved successfully.',
  })
  async getKpis(@Query() query: UserKPIsDto, @Req() req: any) {
    return await this.userService.getKpis(req.user, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
  })
  //@Permissions(Permission.USER_READ)
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  //@Permmission.USER_READ)
  async findById(@Param('id') id: string, @Req() req: any) {
    //const tenantId = req.user.tenantId;
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
  //@Permissions(Permission.USER_UPDATE)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: any
  ) {
    const tenantId = req.user.tenantId;
    return await this.userService.update(tenantId, id, dto);
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
  //@Permissions(Permission.USER_DELETE)
  async delete(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId;
    return await this.userService.deleteUser(tenantId, id);
  }
}