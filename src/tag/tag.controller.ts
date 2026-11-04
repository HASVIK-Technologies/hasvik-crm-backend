
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
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { QueryTagDto } from './dto/query-tag.dto';

import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('tags')
@ApiTags('tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)

export class TagController {
  constructor(private readonly tagService: TagService) {}

  /**
   * Create a new tag
   * POST /tags
   */
  @Post()
  async create(
    @Body() createTagDto: CreateTagDto,
    @Req() req: any,
  ) {
    const tenantId = req.user.tenantId;
    const userId = req.user._id;

    return this.tagService.create(
      createTagDto,
      tenantId,
      userId,
    );
  }

  /**
   * Get all tags for authenticated tenant
   * GET /tags?page=1&limit=10&search=hot&isActive=true
   */
  @Get()
  async findAll(
    @Query() query: QueryTagDto,
    @Req() req: any,
  ) {
    const tenantId = req.user.tenantId;

    return this.tagService.findAll(tenantId, query);
  }

  /**
   * Get tag details
   * GET /tags/:id
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const tenantId = req.user.tenantId;

    return this.tagService.findOne(id, tenantId);
  }

  /**
   * Update tag
   * PATCH /tags/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @Req() req: any,
  ) {
    const tenantId = req.user.tenantId;
    const userId = req.user._id;

    return this.tagService.update(
      id,
      updateTagDto,
      tenantId,
      userId,
    );
  }

  /**
   * Deactivate tag
   * DELETE /tags/:id
   */
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const tenantId = req.user.tenantId;
    const userId = req.user._id;

    return this.tagService.remove(id, tenantId, userId);
  }

  /**
   * Get entities associated with a tag
   * GET /tags/:tagId/entities?entityType=BUSINESS&page=1&limit=10
   */
  // @Get(':tagId/entities')
  // async findEntities(
  //   @Param('tagId') tagId: string,
  //   @Query() query: any,
  //   @Req() req: any,
  // ) {
  //   const tenantId = req.user.tenantId;

  //   return this.tagService.findEntities(
  //     tagId,
  //     tenantId,
  //     query,
  //   );
  // }
}
