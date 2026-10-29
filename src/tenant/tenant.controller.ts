
import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateTenantStatusDto } from './dto/update-tenant-status.dto';
import { UserRole } from '../mongo/enums';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetTenantFilterDto, TenantKPIsDto } from './dto/get-tenant-filter.dto';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantController {
  constructor(
    private readonly tenantsService: TenantService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a tenant' })
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all tenants' })
  findAll(
    @Req() req: any,
    @Query() query: GetTenantFilterDto,
  ) {
    return this.tenantsService.findAll(req.user, query);
  }

  @Get('kpis')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get tenant KPIs',
    description: 'Returns total, active, and inactive tenant counts.',
  })
  getKpis(@Req() req: any, @Query() query: TenantKPIsDto,) {
    return this.tenantsService.getKpis(req.user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tenant by ID' })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Activate or deactivate a tenant' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTenantStatusDto,
    @Req() req: any,
  ) {
    return this.tenantsService.updateStatus(id, dto.isActive, req.user.userId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update tenant details' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
    @Req() req: any,
  ) {
    return this.tenantsService.update(id, dto, req.user.userId);
  }
}
