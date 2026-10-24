import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permission.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';
import { AuditLogService } from './audit-log.service';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs for the current tenant' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully.' })
  @Permissions(Permission.AUDIT_LOG_READ)
  async findAll(@Query() query: AuditLogFilterDto, @Req() req: any) {
    return this.auditLogService.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an audit log by ID' })
  @ApiParam({ name: 'id', description: 'Audit log ID' })
  @ApiResponse({ status: 200, description: 'Audit log retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Audit log not found.' })
  @Permissions(Permission.AUDIT_LOG_READ)
  async findById(@Param('id') id: string, @Req() req: any) {
    return this.auditLogService.findById(req.user.tenantId, id);
  }
}
