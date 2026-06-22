import { Controller, Post, Get, Delete, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { SubscribeDto, SendNewsletterDto } from './dto/subscribe.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bültene abone ol (herkese açık)' })
  subscribe(@Body() dto: SubscribeDto) {
    return this.newsletterService.subscribe(dto);
  }

  @Delete('unsubscribe')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Abonelikten çık (herkese açık)' })
  unsubscribe(@Query('email') email: string) {
    return this.newsletterService.unsubscribe(email);
  }

  @Post('send')
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toplu bülten gönder (admin)' })
  send(@Body() dto: SendNewsletterDto) {
    return this.newsletterService.sendNewsletter(dto);
  }

  @Get('stats')
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Abone istatistikleri (admin)' })
  stats() {
    return this.newsletterService.getStats();
  }

  @Get('subscribers')
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Aboneleri listele (admin)' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 50) {
    return this.newsletterService.findAll(+page, +limit);
  }
}
