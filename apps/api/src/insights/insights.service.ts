import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TagType } from '@aura/database/prisma/client';

import { Logger } from '@nestjs/common';
@Injectable()
export class InsightsService {
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(InsightsService.name); // 注入日志
  // --- 获取“我”的个人数据洞察 ---
  async getPersonalInsights(profileId: string) {
    this.logger.log(`获取个人数据洞察: profileId=${profileId}`, InsightsService.name);

    // 1. 统计我的情绪标签分布
    const emotionCounts = await this.getTagCounts(profileId, TagType.EMOTION);

    // 2. 统计我的活动标签分布
    const activityCounts = await this.getTagCounts(profileId, TagType.ACTIVITY);

    this.logger.log(`个人数据洞察统计完成: profileId=${profileId}`, InsightsService.name);

    return {
      emotionCounts,
      activityCounts,
    };
  }

  // --- 获取公开的社区数据洞察 ---
  async getPublicInsights() {
    this.logger.log('获取社区公开数据洞察', InsightsService.name);

    // 1. 统计社区的情绪标签分布
    const emotionCounts = await this.getTagCounts(null, TagType.EMOTION);

    // 2. 统计社区的活动标签分布
    const activityCounts = await this.getTagCounts(null, TagType.ACTIVITY);

    // 3. 统计过去7天社区的情绪发布趋势
    const trend = await this.getPublicTrend(7);

    this.logger.log('社区公开数据洞察统计完成', InsightsService.name);

    return {
      emotionCounts,
      activityCounts,
      trend,
    };
  }

  /**
   * 内部辅助函数：根据 profileId 和标签类型统计标签数量
   * @param profileId - 如果为 null, 则统计所有用户 (公开)
   * @param tagType - EMOTION 或 ACTIVITY
   */
  private async getTagCounts(profileId: string | null, tagType: TagType) {
    this.logger.log(`统计标签数量: profileId=${profileId ?? 'ALL'}, tagType=${tagType}`, InsightsService.name);

    const whereClause: any = {
      tags: { some: { type: tagType } },
    };

    if (profileId) {
      whereClause.profileId = profileId;
    }

    const entriesWithTags = await this.prisma.moodEntry.findMany({
      where: whereClause,
      include: {
        tags: {
          where: { type: tagType },
        },
      },
    });

    const tagCountMap = new Map<string, number>();
    for (const entry of entriesWithTags) {
      for (const tag of entry.tags) {
        tagCountMap.set(tag.name, (tagCountMap.get(tag.name) || 0) + 1);
      }
    }

    const result = Array.from(tagCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    this.logger.log(
      `标签统计完成: profileId=${profileId ?? 'ALL'}, tagType=${tagType}, count=${result.length}`,
      InsightsService.name,
    );

    return result;
  }

  /**
   * 内部辅助函数：获取过去N天的社区情绪发布趋势
   * @param days - 查询过去的天数
   */
  private async getPublicTrend(days: number) {
    this.logger.log(`统计社区情绪趋势: days=${days}`, InsightsService.name);

    const result: any[] = await this.prisma.$queryRaw`
      SELECT DATE(T."createdAt")::text as date, COUNT(T.id)::int as count
      FROM "MoodEntry" AS T
      WHERE T."createdAt" >= current_date - interval '1 day' * ${days}
      GROUP BY DATE(T."createdAt")
      ORDER BY date ASC;
    `;

    this.logger.log(`社区情绪趋势统计完成: days=${days}, count=${result.length}`, InsightsService.name);

    return result;
  }
}
