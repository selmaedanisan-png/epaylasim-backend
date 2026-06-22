import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateContributionDto } from './dto/create-contribution.dto';

@Injectable()
export class ContributionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(dto: CreateContributionDto) {
    const contribution = await this.prisma.contribution.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        amount: dto.amount,
        wishItemId: dto.wishItemId,
        wishItemName: dto.wishItemName,
        message: dto.message,
      },
    });

    await Promise.all([
      this.mail.sendContributionConfirmation({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        amount: dto.amount,
        wishItemName: dto.wishItemName || 'Hediye',
        message: dto.message,
      }),
      this.mail.sendContributionNotificationToAdmin({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        amount: dto.amount,
        wishItemName: dto.wishItemName || 'Hediye',
      }),
    ]);

    return contribution;
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total, totalAmount] = await Promise.all([
      this.prisma.contribution.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contribution.count(),
      this.prisma.contribution.aggregate({ _sum: { amount: true } }),
    ]);
    return { data, total, totalAmount: totalAmount._sum.amount || 0, page, limit };
  }
}
