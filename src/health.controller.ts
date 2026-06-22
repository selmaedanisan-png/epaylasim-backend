import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { SkipTransform } from './common/decorators/skip-transform.decorator';
import { PrismaService } from './config/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @SkipTransform()
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Public()
  @SkipTransform()
  @Post('seed-admin')
  @ApiOperation({ summary: 'Seed admin user (one-time setup)' })
  async seedAdmin() {
    const admin = await this.prisma.user.findUnique({
      where: { email: 'admin@epaylasim.com' },
    });

    if (!admin) {
      const hash = await bcrypt.hash('Admin123!@#', 12);
      await this.prisma.user.create({
        data: {
          email: 'admin@epaylasim.com',
          username: 'admin',
          displayName: 'Super Admin',
          passwordHash: hash,
          role: UserRole.SUPER_ADMIN,
          emailVerified: true,
        },
      });
      return { message: 'Admin olusturuldu' };
    }

    await this.prisma.user.update({
      where: { email: 'admin@epaylasim.com' },
      data: { role: UserRole.SUPER_ADMIN, emailVerified: true },
    });
    return { message: 'Admin rolu SUPER_ADMIN olarak guncellendi' };
  }
}
