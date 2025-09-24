import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMoodEntryDto } from './dto/create-mood-entry.dto';
import { paginate, PaginatedResult } from '../common/utils/pagination.util';
import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { MoodEntry } from '@aura/database/prisma/client';

@Injectable()
export class MoodEntriesService {
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(MoodEntriesService.name);
  async create(profileId: string, createMoodEntryDto: CreateMoodEntryDto) {
    const { note, tagIds } = createMoodEntryDto;

    this.logger.log(
      `创建情绪记录: profileId=${profileId}, note=${note}, tagIds=${JSON.stringify(tagIds)}`,
      MoodEntriesService.name,
    );

    // 验证 profileId
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) {
      this.logger.warn(`未找到用户: profileId=${profileId}`, MoodEntriesService.name);
      throw new NotFoundException('Profile not found');
    }

    const entry = await this.prisma.moodEntry.create({
      data: {
        note,
        profileId: profileId,
        tags: {
          // 关键：通过 id 连接多个已存在的标签
          connect: tagIds.map((id) => ({ id })),
        },
      },
    });

    this.logger.log(`情绪记录创建成功: id=${entry.id}`, MoodEntriesService.name);
    return entry;
  }

  // 获取“情绪广场”的公开信息流
  async findAll() {
    this.logger.log('查询情绪广场信息流', MoodEntriesService.name);
    return this.prisma.moodEntry.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        profile: {
          select: {
            anonymousName: true,
            avatarUrl: true,
          },
        },
        tags: true,
      },
    });
  }

  async findAllByProfile(profileId: string, paginationDto: PaginationDto): Promise<PaginatedResult<MoodEntry>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    this.logger.log(
      `查询用户历史情绪记录: profileId=${profileId}, page=${page}, limit=${limit}`,
      MoodEntriesService.name,
    );

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

    this.logger.log(`历史情绪记录查询完成: profileId=${profileId}, total=${total}`, MoodEntriesService.name);

    return paginate(data, total, page, limit);
  }

  async remove(profileId: string, moodEntryId: number) {
    this.logger.log(`尝试删除情绪记录: profileId=${profileId}, moodEntryId=${moodEntryId}`, MoodEntriesService.name);

    // 1. 首先查找这条记录是否存在
    const moodEntry = await this.prisma.moodEntry.findUnique({
      where: { id: moodEntryId },
    });

    if (!moodEntry) {
      this.logger.warn(`未找到情绪记录: moodEntryId=${moodEntryId}`, MoodEntriesService.name);
      throw new NotFoundException(`Mood entry with ID ${moodEntryId} not found`);
    }

    // 2. 验证这条记录是否属于当前操作的用户
    if (moodEntry.profileId !== profileId) {
      this.logger.warn(
        `无权限删除情绪记录: profileId=${profileId}, moodEntryId=${moodEntryId}`,
        MoodEntriesService.name,
      );
      throw new ForbiddenException('You do not have permission to delete this entry');
    }

    // 3. 验证通过后，执行删除操作
    const result = await this.prisma.moodEntry.delete({
      where: { id: moodEntryId },
    });

    this.logger.log(`情绪记录删除成功: moodEntryId=${moodEntryId}`, MoodEntriesService.name);
    return result;
  }
}
