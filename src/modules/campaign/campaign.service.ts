import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { ReviewCampaignDto, ReviewAction } from './dto/review-campaign.dto';
import { CampaignStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CampaignService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  async create(userId: string, dto: CreateCampaignDto) {
    const { items, ...rest } = dto;
    const slug = await this.generateSlug(dto.title);

    return this.prisma.campaign.create({
      data: {
        ...rest,
        slug,
        ownerId: userId,
        items: items?.length
          ? { create: items.map((i) => ({ name: i.name, amount: i.amount, wishlistItemId: i.wishlistItemId })) }
          : undefined,
      },
      include: { items: true, owner: { select: { id: true, username: true, displayName: true } } },
    });
  }

  async findAll(status?: CampaignStatus, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : { status: CampaignStatus.ACTIVE };

    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          _count: { select: { contributors: true } },
        },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findBySlug(slug: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { slug },
      include: {
        owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        items: true,
        contributors: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });

    if (!campaign) throw new NotFoundException('Kampanya bulunamadı');
    return campaign;
  }

  async findMyAll(userId: string) {
    return this.prisma.campaign.findMany({
      where: { ownerId: userId },
      include: { _count: { select: { contributors: true } }, items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitForReview(campaignId: string, userId: string) {
    const campaign = await this.assertOwner(campaignId, userId);

    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('Yalnızca taslak kampanyalar incelemeye gönderilebilir');
    }

    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: CampaignStatus.PENDING_REVIEW },
    });
  }

  async review(campaignId: string, dto: ReviewCampaignDto) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Kampanya bulunamadı');
    if (campaign.status !== CampaignStatus.PENDING_REVIEW) {
      throw new BadRequestException('Kampanya inceleme beklemiyor');
    }

    if (dto.action === ReviewAction.REJECT && !dto.rejectionReason) {
      throw new BadRequestException('Red sebebi zorunludur');
    }

    const updated = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: dto.action === ReviewAction.APPROVE ? CampaignStatus.ACTIVE : CampaignStatus.REJECTED,
        rejectionReason: dto.rejectionReason ?? null,
        reviewedAt: new Date(),
        publishedAt: dto.action === ReviewAction.APPROVE ? new Date() : undefined,
      },
    });

    this.events.emit('campaign.reviewed', { campaign: updated, action: dto.action });
    return updated;
  }

  async cancel(campaignId: string, userId: string) {
    await this.assertOwner(campaignId, userId);
    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: CampaignStatus.CANCELLED },
    });
  }

  private async assertOwner(campaignId: string, userId: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Kampanya bulunamadı');
    if (campaign.ownerId !== userId) throw new ForbiddenException('Bu işlem için yetkiniz yok');
    return campaign;
  }

  private async generateSlug(title: string): Promise<string> {
    const base = title
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);

    let slug = base;
    let counter = 1;
    while (await this.prisma.campaign.findUnique({ where: { slug } })) {
      slug = `${base}-${counter++}`;
    }
    return slug;
  }
}
