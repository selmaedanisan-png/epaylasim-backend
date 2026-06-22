import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'ali@epaylasim.com' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi girin' })
  email: string;

  @ApiProperty({ example: 'ali_yilmaz' })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-z0-9_]+$/, { message: 'Kullanıcı adı yalnızca küçük harf, rakam ve alt çizgi içerebilir' })
  username: string;

  @ApiProperty({ example: 'Ali Yılmaz' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  displayName: string;

  @ApiProperty({ example: 'Güvenli123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir',
  })
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'Geçerli bir telefon numarası girin' })
  phone?: string;
}
