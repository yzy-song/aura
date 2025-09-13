import { PaginationDto } from 'src/common/dot/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMoodEntryDto } from './dto/create-mood-entry.dto';
import { paginate, PaginatedResult } from '../common/utils/pagination.util';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MoodEntry } from '@prisma/client';
@Injectable()
export class MoodEntriesService {
  constructor(private prisma: PrismaService) {}

  async create(profileId: string, createMoodEntryDto: CreateMoodEntryDto) {
    const { note, tagIds } = createMoodEntryDto;

    // 验证 profileId
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.moodEntry.create({
      data: {
        note,
        profileId: profileId,
        tags: {
          // 关键：通过 id 连接多个已存在的标签
          connect: tagIds.map((id) => ({ id })),
        },
      },
    });
  }

  // 获取“情绪广场”的公开信息流
  findAll() {
    return this.prisma.moodEntry.findMany({
      orderBy: {
        createdAt: 'desc', // 按创建时间倒序排列
      },
      // 关键：同时查询出关联的数据
      include: {
        profile: {
          select: {
            anonymousName: true, // 只选择需要的字段
            avatarId: true,
          },
        },
        tags: true, // 包含所有关联的标签
      },
    });
  }

  async findAllByProfile(profileId: string, paginationDto: PaginationDto): Promise<PaginatedResult<MoodEntry>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const whereClause = { where: { profileId } };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.moodEntry.count(whereClause),
      this.prisma.moodEntry.findMany({
        skip,
        take: limit,
        where: { profileId }, // 只查询属于当前用户的记录
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          // 在个人历史记录中，我们不需要再返回 profile 信息了
          tags: true,
        },
      }),
    ]);

    return paginate(data, total, page, limit);
  }

  async remove(profileId: string, moodEntryId: number) {
    // 1. 首先查找这条记录是否存在
    const moodEntry = await this.prisma.moodEntry.findUnique({
      where: { id: moodEntryId },
    });

    if (!moodEntry) {
      throw new NotFoundException(`Mood entry with ID ${moodEntryId} not found`);
    }

    // 2. 关键：验证这条记录是否属于当前操作的用户
    if (moodEntry.profileId !== profileId) {
      throw new ForbiddenException('You do not have permission to delete this entry');
    }

    // 3. 验证通过后，执行删除操作
    return this.prisma.moodEntry.delete({
      where: { id: moodEntryId },
    });
  }
}
