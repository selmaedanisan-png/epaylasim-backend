import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Analytics')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('events')
  @ApiOperation({ summary: 'Event sayıları (Admin)' })
  getEvents(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.analyticsService.getEventCounts(
      from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to ? new Date(to) : new Date(),
    );
  }

  @Get('active-users')
  @ApiOperation({ summary: 'Aktif kullanıcı sayısı' })
  getActiveUsers(@Query('days') days = 7) {
    return this.analyticsService.getActiveUsers(+days);
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Kampanya istatistikleri' })
  getCampaignStats() {
    return this.analyticsService.getCampaignStats();
  }

  @Get('users/growth')
  @ApiOperation({ summary: 'Kullanıcı büyüme grafiği' })
  getUserGrowth(@Query('days') days = 30) {
    return this.analyticsService.getNewUsersOverTime(+days);
  }

  @Get('coupons')
  @ApiOperation({ summary: 'Kupon istatistikleri' })
  getCouponStats() {
    return this.analyticsService.getCouponStats();
  }
}
