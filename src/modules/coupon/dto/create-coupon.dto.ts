import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  IsDateString,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateCouponDto {
  @ApiProperty({ example: 'YILBASI20' })
  @IsString()
  @MaxLength(30)
  @Matches(/^[A-Z0-9_]+$/, { message: 'Kupon kodu yalnızca büyük harf, rakam ve alt çizgi içerebilir' })
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @ApiProperty({ enum: CouponType })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ example: 10, description: 'Yüzde veya TL tutarı' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  value: number;

  @ApiPropertyOptional({ example: 100, description: 'Minimum sipariş tutarı (TL)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 500, description: 'Maksimum indirim tutarı (TL)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @ApiPropertyOptional({ example: 100, description: 'Toplam kullanım limiti' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ example: 1, description: 'Kullanıcı başına limit' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  perUserLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
