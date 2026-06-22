import {
  IsString,
  IsOptional,
  IsUrl,
  IsNumber,
  IsPositive,
  IsDateString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateWishlistItemDto {
  @ApiProperty({ example: 'Sony WH-1000XM5 Kulaklık' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({}, { message: 'Geçerli bir ürün URL\'i girin' })
  productUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({}, { message: 'Geçerli bir görsel URL\'i girin' })
  imageUrl?: string;

  @ApiProperty({ example: 1500.00 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  targetAmount: number;

  @ApiPropertyOptional({ example: 1, description: 'Sıralama önceliği (0 = en düşük)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(99)
  priority?: number;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
