import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscribeDto {
  @ApiProperty({ example: 'ahmet@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'Ahmet Yılmaz' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}

export class SendNewsletterDto {
  @ApiProperty({ example: 'Haziran Kampanyaları' })
  @IsString()
  @MaxLength(200)
  subject: string;

  @ApiProperty({ example: '<h2>Yeni kampanyalar başladı!</h2><p>Bu ay size özel fırsatlar...</p>' })
  @IsString()
  content: string;
}
