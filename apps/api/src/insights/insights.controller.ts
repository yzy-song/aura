import { Controller, Get, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { ApiHeader, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';
import { ApiCommonResponses } from '../common/decorators/api-common-responses.decorator';
import type { Profile } from '@aura/database/prisma/client';
import { JwtOptionalGuard } from 'src/auth/guards/jwt-optional.guard';

type SummaryPeriod = '3days' | 'week' | '2weeks' | 'month';
const DEFAULT_PERIOD: SummaryPeriod = 'week';

@ApiTags('Insights')
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('mine') // 新增的个人洞察接口
  @UseGuards(JwtOptionalGuard)
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-profile-id', description: 'For anonymous users', required: false })
  @ApiOperation({ summary: '获取“我”的数据洞察 (图表)' })
  @ApiCommonResponses()
  getPersonalInsights(@CurrentProfile() profileOrId: Profile | string) {
    const profileId = typeof profileOrId === 'string' ? profileOrId : profileOrId?.id;

    if (!profileId) {
      throw new UnauthorizedException('Authentication required.');
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
  @UseGuards(JwtOptionalGuard)
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-profile-id', description: 'For anonymous users', required: false })
  @ApiOperation({ summary: '获取“我”的 AI 周期总结报告' })
  @ApiCommonResponses()
  getPersonalSummary(
    @CurrentProfile() profileOrId: Profile | string,
    @Query('period') period: SummaryPeriod = DEFAULT_PERIOD,
  ) {
    const profileId = typeof profileOrId === 'string' ? profileOrId : profileOrId?.id;

    if (!profileId) {
      throw new UnauthorizedException('Authentication required.');
    }
    return this.insightsService.getPersonalSummary(profileId, period);
  }
}
