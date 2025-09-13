import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';

import { Logger } from '@nestjs/common';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(TagsService.name);
  // 创建一个自定义标签
  async create(profileId: string, createTagDto: CreateTagDto) {
    this.logger.log(`创建标签: ${JSON.stringify(createTagDto)}`, TagsService.name);

    // 验证 profileId 是否存在
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.tag.create({
      data: {
        name: createTagDto.name,
        type: createTagDto.type,
        profileId: profileId, // 关联到当前用户
      },
    });
  }

  // 获取所有系统预设标签
  async findAllSystemTags() {
    this.logger.log('查询所有系统标签', TagsService.name);

    return this.prisma.tag.findMany({
      where: { profileId: null },
    });
  }

  // 获取某个用户的所有自定义标签
  findAllCustomTagsByProfile(profileId: string) {
    return this.prisma.tag.findMany({
      where: { profileId: profileId },
    });
  }
}
