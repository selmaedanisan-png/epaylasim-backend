import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async trackEvent(
    event: string,
    properties?: Record<string, any>,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.analyticsEvent.create({
      data: { event, properties, userId, ipAddress, userAgent },
    });
  }

  async getEventCounts(from: Date, to: Date) {
    const events = await this.prisma.analyticsEvent.groupBy({
      by: ['event'],
      where: { createdAt: { gte: from, lte: to } },
      _count: { event: true },
      orderBy: { _count: { event: 'desc' } },
    });

    return events.map((e) => ({ event: e.event, count: e._count.event }));
  }

  async getActiveUsers(days = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.prisma.user.count({
      where: { lastLoginAt: { gte: since } },
    });
  }

  async getCampaignStats() {
    const byStatus = await this.prisma.campaign.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return byStatus.map((s) => ({ status: s.status, count: s._count.status }));
  }

  async getNewUsersOverTime(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const byDay: Record<string, number> = {};
    for (const u of users) {
      const day = u.createdAt.toISOString().split('T')[0];
      byDay[day] = (byDay[day] ?? 0) + 1;
    }

    return Object.entries(byDay).map(([date, count]) => ({ date, count }));
  }

  async getCouponStats() {
    const [total, active, depleted] = await Promise.all([
      this.prisma.coupon.count(),
      this.prisma.coupon.count({ where: { status: 'ACTIVE' } }),
      this.prisma.coupon.count({ where: { status: 'DEPLETED' } }),
    ]);

    const topUsed = await this.prisma.coupon.findMany({
      orderBy: { usedCount: 'desc' },
      take: 10,
      select: { code: true, usedCount: true, usageLimit: true },
    });

    return { total, active, depleted, topUsed };
  }
}
