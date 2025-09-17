import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TagType } from '@aura/database/prisma/client';
import { subDays } from 'date-fns';
import { Logger } from '@nestjs/common';
import { AiService } from 'src/common/ai/ai.service';
import { format } from 'date-fns';
// 定义时间周期类型，与 Controller 中保持一致
type SummaryPeriod = '3days' | 'week' | '2weeks' | 'month';

@Injectable()
export class InsightsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

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

  // 👇 --- 带缓存的总结报告方法 --- 👇
  async getPersonalSummary(profileId: string, period: SummaryPeriod): Promise<{ summary: string }> {
    // 1. 创建一个从周期到天数的映射
    const periodToDaysMap: Record<SummaryPeriod, number> = {
      '3days': 3,
      week: 7,
      '2weeks': 14,
      month: 30,
    };
    const daysToSubtract = periodToDaysMap[period];

    // 2. 为“滚动窗口”生成一个基于当天日期的、唯一的缓存键
    // 这样，每天的“最近7天”都会是一个新的缓存
    const now = new Date();
    const periodKey = `${period}-ending-${format(now, 'yyyy-MM-dd')}`;

    // 3. 尝试从数据库中查找缓存
    const cachedSummary = await this.prisma.aiSummary.findUnique({
      where: { profileId_period: { profileId, period: periodKey } },
    });

    if (cachedSummary) {
      this.logger.log(`[Cache HIT] Found summary for ${profileId} for period ${periodKey}`);
      return { summary: cachedSummary.summary };
    }

    this.logger.log(`[Cache MISS] No summary for ${profileId}, period ${periodKey}. Generating new one...`);

    // 4. 如果没有缓存，则从数据库获取相应天数的数据
    const entries = await this.prisma.moodEntry.findMany({
      where: {
        profileId,
        createdAt: { gte: subDays(now, daysToSubtract) },
      },
      include: { tags: true },
      orderBy: { createdAt: 'asc' },
    });

    // 5. 调用 AI 服务生成新的总结
    const newSummaryText = await this.aiService.generateSummary(entries);

    // 6. 将新生成的总结存入数据库
    // 4. 只有有效 summary 才写入缓存
    if (newSummaryText && newSummaryText !== this.aiService.DEFAULT_SUMMARY) {
      await this.prisma.aiSummary.create({
        data: {
          profileId,
          period: periodKey,
          summary: newSummaryText,
        },
      });
    }

    return { summary: newSummaryText };
  }
}
