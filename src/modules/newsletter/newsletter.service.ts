import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { MailService } from '../mail/mail.service';
import { SubscribeDto, SendNewsletterDto } from './dto/subscribe.dto';

@Injectable()
export class NewsletterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async subscribe(dto: SubscribeDto) {
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: dto.email },
    });

    if (existing && existing.isActive) {
      throw new ConflictException('Bu e-posta zaten bültene kayıtlı.');
    }

    if (existing && !existing.isActive) {
      await this.prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { isActive: true, unsubscribedAt: null, name: dto.name || existing.name },
      });
    } else {
      await this.prisma.newsletterSubscriber.create({ data: dto });
    }

    await this.mail.sendWelcomeNewsletter({ email: dto.email, name: dto.name });

    return { message: 'Bültene başarıyla abone oldunuz!' };
  }

  async unsubscribe(email: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (!subscriber || !subscriber.isActive) {
      return { message: 'Bu e-posta zaten abonelikten çıkmış.' };
    }

    await this.prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { isActive: false, unsubscribedAt: new Date() },
    });

    return { message: 'Abonelikten başarıyla çıktınız.' };
  }

  async sendNewsletter(dto: SendNewsletterDto) {
    const subscribers = await this.prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true, name: true },
    });

    if (subscribers.length === 0) {
      return { message: 'Aktif abone bulunamadı.', sent: 0, failed: 0 };
    }

    const result = await this.mail.sendBulkNewsletter(subscribers, dto.subject, dto.content);

    return { message: `Bülten gönderildi.`, ...result, totalSubscribers: subscribers.length };
  }

  async getStats() {
    const [total, active] = await Promise.all([
      this.prisma.newsletterSubscriber.count(),
      this.prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    ]);
    return { total, active, inactive: total - active };
  }

  async findAll(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.newsletterSubscriber.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.newsletterSubscriber.count(),
    ]);
    return { data, total, page, limit };
  }
}
