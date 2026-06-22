import { IsString, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ApplyCouponDto {
  @ApiProperty({ example: 'YILBASI20' })
  @IsString()
  code: string;

  @ApiProperty({ example: 500, description: 'Sipariş tutarı (TL)' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  orderAmount: number;
}
