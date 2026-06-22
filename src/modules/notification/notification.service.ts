import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { NotificationType, NotificationChannel } from '@prisma/client';
import { OnEvent } from '@nestjs/event-emitter';
import { ReviewAction } from '../campaign/dto/review-campaign.dto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  channel?: NotificationChannel;
  title: string;
  body: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: config.get('mail.host'),
      port: config.get<number>('mail.port'),
      auth: {
        user: config.get('mail.user'),
        pass: config.get('mail.pass'),
      },
    });
  }

  async create(input: CreateNotificationInput) {
    return this.prisma.notification.create({ data: input });
  }

  async createBulk(inputs: CreateNotificationInput[]) {
    return this.prisma.notification.createMany({ data: inputs });
  }

  async findAllForUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { data, total, unread, page, limit };
  }

  async markAsRead(notificationId: string, userId: string) {
    const n = await this.prisma.notification.findUnique({ where: { id: notificationId } });
    if (!n || n.userId !== userId) throw new NotFoundException('Bildirim bulunamadı');

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { message: 'Tüm bildirimler okundu olarak işaretlendi' };
  }

  async sendEmail(to: string, subject: string, html: string) {
    return this.transporter.sendMail({
      from: this.config.get('mail.from'),
      to,
      subject,
      html,
    });
  }

  async sendAdminEmail(subject: string, html: string) {
    return this.sendEmail(this.config.get('mail.adminEmail'), subject, html);
  }

  @OnEvent('campaign.reviewed')
  async handleCampaignReviewed(payload: { campaign: any; action: ReviewAction }) {
    const { campaign, action } = payload;

    const owner = await this.prisma.user.findUnique({
      where: { id: campaign.ownerId },
      select: { id: true, email: true, displayName: true },
    });

    if (!owner) return;

    const isApproved = action === ReviewAction.APPROVE;

    await this.create({
      userId: owner.id,
      type: NotificationType.CAMPAIGN,
      title: isApproved ? 'Kampanyanız onaylandı! 🎉' : 'Kampanyanız reddedildi',
      body: isApproved
        ? `"${campaign.title}" kampanyanız yayına alındı.`
        : `"${campaign.title}" kampanyanız reddedildi. Sebep: ${campaign.rejectionReason}`,
      data: { campaignId: campaign.id, campaignSlug: campaign.slug },
    });

    await this.sendEmail(
      owner.email,
      isApproved ? 'Kampanyanız Onaylandı' : 'Kampanyanız Reddedildi',
      `<p>Merhaba ${owner.displayName},</p>
       <p>${isApproved ? `"${campaign.title}" kampanyanız onaylandı ve yayına alındı.` : `"${campaign.title}" kampanyanız reddedildi. Sebep: ${campaign.rejectionReason}`}</p>`,
    );
  }
}
