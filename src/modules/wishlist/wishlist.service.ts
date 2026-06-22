import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { PartialType } from '@nestjs/mapped-types';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateWishlistDto) {
    const slug = await this.generateSlug(dto.title, userId);
    return this.prisma.wishlist.create({
      data: { ...dto, userId, slug },
      include: { items: true },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string, requesterId?: string) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { slug },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        items: { orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }] },
      },
    });

    if (!wishlist) throw new NotFoundException('Dilek listesi bulunamadı');
    if (!wishlist.isPublic && wishlist.userId !== requesterId) {
      throw new ForbiddenException('Bu dilek listesi gizli');
    }

    return wishlist;
  }

  async update(wishlistId: string, userId: string, dto: Partial<CreateWishlistDto>) {
    await this.assertOwner(wishlistId, userId);
    return this.prisma.wishlist.update({
      where: { id: wishlistId },
      data: dto,
    });
  }

  async remove(wishlistId: string, userId: string) {
    await this.assertOwner(wishlistId, userId);
    await this.prisma.wishlist.delete({ where: { id: wishlistId } });
    return { message: 'Dilek listesi silindi' };
  }

  async addItem(wishlistId: string, userId: string, dto: CreateWishlistItemDto) {
    await this.assertOwner(wishlistId, userId);
    return this.prisma.wishlistItem.create({
      data: { ...dto, wishlistId },
    });
  }

  async updateItem(
    wishlistId: string,
    itemId: string,
    userId: string,
    dto: Partial<CreateWishlistItemDto>,
  ) {
    await this.assertOwner(wishlistId, userId);
    return this.prisma.wishlistItem.update({
      where: { id: itemId },
      data: dto,
    });
  }

  async removeItem(wishlistId: string, itemId: string, userId: string) {
    await this.assertOwner(wishlistId, userId);
    await this.prisma.wishlistItem.delete({ where: { id: itemId } });
    return { message: 'Ürün silindi' };
  }

  private async assertOwner(wishlistId: string, userId: string) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { id: wishlistId },
      select: { userId: true },
    });
    if (!wishlist) throw new NotFoundException('Dilek listesi bulunamadı');
    if (wishlist.userId !== userId) throw new ForbiddenException('Bu işlem için yetkiniz yok');
  }

  private async generateSlug(title: string, userId: string): Promise<string> {
    const base = title
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);

    const suffix = userId.slice(0, 8);
    let slug = `${base}-${suffix}`;
    let counter = 1;

    while (await this.prisma.wishlist.findUnique({ where: { slug } })) {
      slug = `${base}-${suffix}-${counter++}`;
    }

    return slug;
  }
}
