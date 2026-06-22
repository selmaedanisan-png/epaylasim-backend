import { IsString, IsEmail, IsNumber, IsOptional, Min, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContributionDto {
  @ApiProperty({ example: 'Ahmet' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Yılmaz' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: 'ahmet@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 250 })
  @IsNumber()
  @Min(10)
  amount: number;

  @ApiPropertyOptional({ example: 'w1' })
  @IsOptional()
  @IsString()
  wishItemId?: string;

  @ApiPropertyOptional({ example: 'Çamaşır Makinesi' })
  @IsOptional()
  @IsString()
  wishItemName?: string;

  @ApiPropertyOptional({ example: 'Hayırlı olsun!' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
