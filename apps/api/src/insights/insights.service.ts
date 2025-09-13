import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TagType } from '@prisma/client';

@Injectable()
export class InsightsService {
  constructor(private prisma: PrismaService) {}

  // --- 获取“我”的个人数据洞察 ---
  async getPersonalInsights(profileId: string) {
    // 1. 统计我的情绪标签分布
    const emotionCounts = await this.getTagCounts(profileId, TagType.EMOTION);

    // 2. 统计我的活动标签分布
    const activityCounts = await this.getTagCounts(profileId, TagType.ACTIVITY);

    // 未来可以增加更多个人洞察，比如情绪趋势图等
    console.log('个人数据洞察 - profileId:', profileId);
    return {
      emotionCounts,
      activityCounts,
    };
  }

  // --- 获取公开的社区数据洞察 ---
  async getPublicInsights() {
    // 1. 统计社区的情绪标签分布
    const emotionCounts = await this.getTagCounts(null, TagType.EMOTION);

    // 2. 统计社区的活动标签分布
    const activityCounts = await this.getTagCounts(null, TagType.ACTIVITY);

    // 3. 统计过去7天社区的情绪发布趋势
    const trend = await this.getPublicTrend(7);

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

    // 转换为前端需要的格式并排序
    return Array.from(tagCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * 内部辅助函数：获取过去N天的社区情绪发布趋势
   * @param days - 查询过去的天数
   */
  private async getPublicTrend(days: number) {
    const result: any[] = await this.prisma.$queryRaw`
      SELECT DATE(T."createdAt")::text as date, COUNT(T.id)::int as count
      FROM "MoodEntry" AS T
      WHERE T."createdAt" >= current_date - interval '1 day' * ${days}
      GROUP BY DATE(T."createdAt")
      ORDER BY date ASC;
    `;
    return result;
  }
}
