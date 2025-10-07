// apps/api/src/tags/tags.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';
import { JwtOptionalGuard } from '../auth/guards/jwt-optional.guard';
import { ApiHeader, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators/api-common-responses.decorator';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post() // POST /tags
  @UseGuards(JwtOptionalGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-profile-id',
    description: '当前用户的匿名身份ID（可选，用于匿名用户）',
    required: false,
  })
  @ApiOperation({ summary: '创建一个自定义标签' })
  @ApiResponse({ status: 201, description: '标签创建成功' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiCommonResponses()
  create(@CurrentProfile() profile: any, @Body() createTagDto: CreateTagDto) {
    // 如果 profile 是对象（登录用户），取其 id；如果是字符串（匿名用户），直接使用
    const profileId = typeof profile === 'object' ? profile.id : profile;
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
  @UseGuards(JwtOptionalGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-profile-id',
    description: '当前用户的匿名身份ID（可选）',
    required: false,
  })
  @ApiOperation({ summary: '获取当前用户的所有自定义标签' })
  @ApiResponse({ status: 200, description: '成功获取用户自定义标签' })
  @ApiCommonResponses()
  findAllMyTags(@CurrentProfile() profile: any) {
    // 如果 profile 是对象（登录用户），取其 id；如果是字符串（匿名用户），直接使用
    const profileId = typeof profile === 'object' ? profile.id : profile;
    return this.tagsService.findAllCustomTagsByProfile(profileId);
  }
}
