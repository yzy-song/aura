import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  Param,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { MoodEntriesService } from './mood-entries.service';
import { CreateMoodEntryDto } from './dto/create-mood-entry.dto';
import { ProfileId } from '../common/decorators/profile-id.decorator';
import { ApiHeader, ApiOperation } from '@nestjs/swagger';
import { ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators/api-common-responses.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtOptionalGuard } from 'src/auth/guards/jwt-optional.guard';
import { CurrentProfile } from 'src/auth/decorators/current-profile.decorator';
import type { Profile } from '@aura/database/prisma/client';
@Controller('mood-entries')
export class MoodEntriesController {
  constructor(private readonly moodEntriesService: MoodEntriesService) {}

  @Post()
  @UseGuards(JwtOptionalGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建一个情绪记录' })
  @ApiHeader({
    name: 'x-profile-id',
    description: '当前用户的匿名身份ID',
    required: true,
  })
  @ApiResponse({ status: 201, description: '情绪记录创建成功' })
  @ApiResponse({ status: 400, description: '请求参数或格式错误' })
  @ApiResponse({ status: 404, description: 'Profile 或 Tag 不存在' })
  @ApiCommonResponses()
  async create(@CurrentProfile() profile: Profile | string, @Body() dto: CreateMoodEntryDto) {
    // profile 可能是 Profile 或 profileId 字符串
    const profileId = typeof profile === 'string' ? profile : profile.id;
    return this.moodEntriesService.create(profileId, dto);
  }

  @Get()
  @ApiOperation({ summary: '获取情绪广场的公开信息流' })
  @ApiResponse({ status: 200, description: '成功获取情绪广场信息流' })
  @ApiCommonResponses()
  findAll() {
    return this.moodEntriesService.findAll();
  }

  @Get('mine')
  @UseGuards(JwtOptionalGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-profile-id',
    description: '当前用户的匿名身份ID',
    required: true,
  })
  @ApiOperation({ summary: '获取我自己的情绪记录 (分页)' })
  @ApiResponse({ status: 200, description: '成功获取我的情绪记录' })
  @ApiResponse({ status: 404, description: '情绪记录不存在' })
  @ApiCommonResponses()
  findAllMine(@CurrentProfile() profile: Profile | string, @Query() paginationDto: PaginationDto) {
    // profile 可能是 Profile 或 profileId 字符串
    const profileId = typeof profile === 'string' ? profile : profile.id;
    return this.moodEntriesService.findAllByProfile(profileId, paginationDto);
  }

  @Delete(':id')
  @UseGuards(JwtOptionalGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除我的一条情绪记录' })
  @ApiResponse({ status: 204, description: '情绪记录删除成功' })
  @ApiResponse({ status: 403, description: '没有权限删除此情绪记录' })
  @ApiResponse({ status: 404, description: '情绪记录不存在' })
  @ApiCommonResponses()
  @HttpCode(HttpStatus.NO_CONTENT) // 删除成功后返回 204 No Content 状态码
  remove(@CurrentProfile() profile: Profile | string, @Param('id', ParseIntPipe) id: number) {
    // profile 可能是 Profile 或 profileId 字符串
    const profileId = typeof profile === 'string' ? profile : profile.id;
    return this.moodEntriesService.remove(profileId, id);
  }
}
