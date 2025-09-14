import { Controller, Get, Query, UnauthorizedException } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { ProfileId } from '../common/decorators/profile-id.decorator';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { ApiCommonResponses } from '../common/decorators/api-common-responses.decorator';

// 👇 定义总结报告周期类型
type SummaryPeriod = '3days' | 'week' | '2weeks' | 'month';
const DEFAULT_PERIOD: SummaryPeriod = 'week';

@ApiTags('Insights')
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('mine')
  @ApiOperation({ summary: '获取我自己的数据洞察' })
  @ApiHeader({
    name: 'x-profile-id',
    description: '当前用户的匿名身份ID',
    required: true,
  })
  @ApiCommonResponses()
  getPersonalInsights(@ProfileId() profileId: string) {
    if (!profileId) {
      throw new UnauthorizedException('x-profile-id header is required');
    }
    return this.insightsService.getPersonalInsights(profileId);
  }

  @Get('public')
  @ApiOperation({ summary: '获取社区的公开数据洞察' })
  @ApiCommonResponses()
  getPublicInsights() {
    return this.insightsService.getPublicInsights();
  }

  @Get('mine/summary')
  @ApiOperation({ summary: '获取“我”的 AI 周期总结报告' })
  @ApiHeader({ name: 'x-profile-id', required: true })
  @ApiCommonResponses()
  getPersonalSummary(@ProfileId() profileId: string, @Query('period') period: SummaryPeriod = DEFAULT_PERIOD) {
    if (!profileId) {
      throw new UnauthorizedException('x-profile-id header is required');
    }
    return this.insightsService.getPersonalSummary(profileId, period);
  }
}
