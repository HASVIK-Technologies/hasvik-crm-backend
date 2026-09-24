import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { BusinessFilterDto, BusinessKPIsDto } from './dto/get-business-filter.dto';
import { BusinessAutocompleteDto } from './dto/business-autocomplete.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permission.enum';

@ApiTags('Businesses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('businesses')
export class BusinessController {
  constructor(
    private readonly businessService: BusinessService,
  ) {}

  @Get('autocomplete')
  @Permissions(Permission.BUSINESS_READ)
  @ApiOperation({
    summary: 'Autocomplete businesses',
    description: 'Returns active businesses matching the search text.',
  })
  @ApiResponse({
    status: 200,
    description: 'Businesses retrieved successfully.',
  })
  async autocomplete(@Query() query: BusinessAutocompleteDto) {
    return await this.businessService.autocomplete(query.search);
  }
  
  @Get('status')
  @Permissions(Permission.BUSINESS_READ)
  @ApiOperation({
    summary: 'Get business status',
    description: 'Returns the status of a specific business.',
  })
  @ApiResponse({
    status: 200,
    description: 'Businesses retrieved successfully.',
  })
  async getStatus() {
    return this.businessService.getStatus();
  }

  @Get('city/autocomplete')
  @Permissions(Permission.BUSINESS_READ)
  @ApiOperation({
    summary: 'Autocomplete city',
    description: 'Returns city matching the search text.',
  })
  @ApiResponse({
    status: 200,
    description: 'City retrieved successfully.',
  })
  async getCity(@Query() query: BusinessAutocompleteDto) {
    return await this.businessService.getCityAutocomplete(query.search);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Post()
  // @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Post()
  @Permissions(Permission.BUSINESS_CREATE)
  create(@Body() dto: CreateBusinessDto, @Req() req: any) {
    // Replace with authenticated user ID
    const userId = req.user.userId;

    return this.businessService.create(dto, userId);
  }

  @Get()
  @Permissions(Permission.BUSINESS_READ)
  @ApiOperation({
    summary: 'Get businesses',  
    description: 'Returns a paginated list of businesses with optional filters.',
  })
  async findAll(@Query() query: BusinessFilterDto) {
    return await this.businessService.findAll(query);
  }

  @Get('kpis')
  @Permissions(Permission.BUSINESS_READ)
  @ApiOperation({
    summary: 'Get business KPIs',
    description: 'Returns key performance indicators for businesses.',
  })
  @ApiResponse({
    status: 200,
    description: 'Businesses retrieved successfully.',
  })
  async getKpis(@Query() query: BusinessKPIsDto) {
    return await this.businessService.getKpis(query);
  }


  @Get(':id')
  @Permissions(Permission.BUSINESS_READ)
  @ApiOperation({
    summary: 'Get business by ID',
    description: 'Returns a business using its ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Business retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found.',
  })
  async findById(@Param('id') id: string) {
    return await this.businessService.findById(id);
  }

  @Patch(':id')
  @Permissions(Permission.BUSINESS_UPDATE)
  @ApiOperation({
    summary: 'Update business',
    description: 'Updates a business with the provided details.',
  })
  @ApiResponse({
    status: 200,
    description: 'Business updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found.',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBusinessDto,
    @Req() req: any
  ) {
    // Replace with authenticated user ID
    const userId = req.user.userId;
    return await this.businessService.update(id, dto, userId);
  }

  @Delete(':id')
  @Permissions(Permission.BUSINESS_DELETE)
  async delete(@Param('id') id: string, @Req() req: any) {
    // Replace with authenticated user ID
    const userId = req.user.userId;
    return await this.businessService.delete(id, userId);
  }
}
