import { Module } from '@nestjs/common';
import { ContributionController } from './contribution.controller';
import { ContributionService } from './contribution.service';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [ContributionController],
  providers: [ContributionService, PrismaService],
})
export class ContributionModule {}
