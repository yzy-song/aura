// apps/api/src/tags/tags.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { ProfileId } from '../common/decorators/profile-id.decorator';
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators/api-common-responses.decorator';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post() // POST /tags
  @ApiHeader({
    name: 'x-profile-id',
    description: '当前用户的匿名身份ID',
    required: true,
  })
  @ApiOperation({ summary: '创建一个自定义标签' })
  @ApiResponse({ status: 201, description: '标签创建成功' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiCommonResponses()
  create(@ProfileId() profileId: string, @Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(profileId, createTagDto);
  }

  @Get() // GET /tags - 获取系统标签
  @ApiOperation({ summary: '获取所有系统预设标签' })
  @ApiResponse({ status: 200, description: '成功获取系统标签' })
  @ApiCommonResponses()
  findAllSystemTags() {
    return this.tagsService.findAllSystemTags();
  }

  @Get('mine') // GET /tags/mine - 获取我的自定义标签
  @ApiHeader({
    name: 'x-profile-id',
    description: '当前用户的匿名身份ID',
    required: true,
  })
  @ApiOperation({ summary: '获取当前用户的所有自定义标签' })
  @ApiResponse({ status: 200, description: '成功获取用户自定义标签' })
  @ApiCommonResponses()
  findAllMyTags(@ProfileId() profileId: string) {
    return this.tagsService.findAllCustomTagsByProfile(profileId);
  }
}
