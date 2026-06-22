import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Wishlists')
@ApiBearerAuth()
@Controller('wishlists')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni dilek listesi oluştur' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateWishlistDto) {
    return this.wishlistService.create(userId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Kendi dilek listelerimi getir' })
  getMyWishlists(@CurrentUser('id') userId: string) {
    return this.wishlistService.findAllByUser(userId);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Slug ile dilek listesi getir' })
  getBySlug(@Param('slug') slug: string, @CurrentUser('id') userId: string) {
    return this.wishlistService.findBySlug(slug, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Dilek listesini güncelle' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: Partial<CreateWishlistDto>,
  ) {
    return this.wishlistService.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dilek listesini sil' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.wishlistService.remove(id, userId);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Dilek listesine ürün ekle' })
  addItem(
    @Param('id') wishlistId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWishlistItemDto,
  ) {
    return this.wishlistService.addItem(wishlistId, userId, dto);
  }

  @Patch(':id/items/:itemId')
  @ApiOperation({ summary: 'Ürünü güncelle' })
  updateItem(
    @Param('id') wishlistId: string,
    @Param('itemId') itemId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: Partial<CreateWishlistItemDto>,
  ) {
    return this.wishlistService.updateItem(wishlistId, itemId, userId, dto);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ürünü sil' })
  removeItem(
    @Param('id') wishlistId: string,
    @Param('itemId') itemId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.wishlistService.removeItem(wishlistId, itemId, userId);
  }
}
