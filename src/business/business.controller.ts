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

import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { BusinessFilterDto } from './dto/get-business-filter.dto';

@Controller('businesses')
export class BusinessController {
  constructor(
    private readonly businessService: BusinessService,
  ) {}

  @Post()
  create(@Body() dto: CreateBusinessDto) {
    return this.businessService.create(dto);
  }

  @Get()
  findAll(@Query() query: BusinessFilterDto) {
    return this.businessService.findAll(query);
  }

  @Get('category/:categoryId')
  findByCategory(
    @Param('categoryId') categoryId: string,
  ) {
    return this.businessService.findByCategory(categoryId);
  }

  @Get('assigned/:userId')
  findByAssignedUser(
    @Param('userId') userId: string,
  ) {
    return this.businessService.findByAssignedUser(userId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.businessService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.businessService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.businessService.delete(id);
  }
}
