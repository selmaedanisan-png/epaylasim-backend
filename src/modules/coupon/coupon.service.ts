import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { CouponType } from '@prisma/client';

@Injectable()
export class CouponService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCouponDto) {
    return this.prisma.coupon.create({ data: dto as any });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.coupon.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { usages: true } } },
      }),
      this.prisma.coupon.count(),
    ]);
    return { data, total, page, limit };
  }

  async validate(code: string, userId: string, orderAmount: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon) throw new NotFoundException('Kupon kodu geçersiz');
    if (coupon.status !== 'ACTIVE') throw new BadRequestException('Bu kupon artık geçerli değil');

    const now = new Date();
    if (coupon.startsAt > now) throw new BadRequestException('Kupon henüz aktif değil');
    if (coupon.expiresAt && coupon.expiresAt < now) throw new BadRequestException('Kuponun süresi dolmuş');

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Kupon kullanım limiti dolmuş');
    }

    if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(
        `Bu kupon için minimum sipariş tutarı ₺${coupon.minOrderAmount}`,
      );
    }

    const userUsage = await this.prisma.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });

    if (userUsage >= coupon.perUserLimit) {
      throw new BadRequestException('Bu kuponu zaten kullandınız');
    }

    const discount = this.calculateDiscount(coupon.type, Number(coupon.value), orderAmount, coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : undefined);

    return {
      couponId: coupon.id,
      code: coupon.code,
      type: coupon.type,
      discount,
      finalAmount: Math.max(0, orderAmount - discount),
    };
  }

  async redeem(couponId: string, userId: string, discount: number) {
    await this.prisma.$transaction([
      this.prisma.couponUsage.create({ data: { couponId, userId, discount } }),
      this.prisma.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } }),
    ]);
  }

  async disable(couponId: string) {
    return this.prisma.coupon.update({
      where: { id: couponId },
      data: { status: 'DISABLED' },
    });
  }

  private calculateDiscount(
    type: CouponType,
    value: number,
    orderAmount: number,
    maxDiscount?: number,
  ): number {
    let discount =
      type === CouponType.PERCENTAGE ? (orderAmount * value) / 100 : value;

    if (maxDiscount) discount = Math.min(discount, maxDiscount);
    return Math.round(discount * 100) / 100;
  }
}
