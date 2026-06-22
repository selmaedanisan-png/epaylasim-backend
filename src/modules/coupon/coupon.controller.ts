import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Coupons')
@ApiBearerAuth()
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Kupon oluştur (Admin)' })
  create(@Body() dto: CreateCouponDto) {
    return this.couponService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Kupon listesi (Admin)' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.couponService.findAll(+page, +limit);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kupon doğrula' })
  validate(@CurrentUser('id') userId: string, @Body() dto: ApplyCouponDto) {
    return this.couponService.validate(dto.code, userId, dto.orderAmount);
  }

  @Patch(':id/disable')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Kuponu devre dışı bırak (Admin)' })
  disable(@Param('id') id: string) {
    return this.couponService.disable(id);
  }
}
