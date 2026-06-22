import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { ReviewCampaignDto } from './dto/review-campaign.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole, CampaignStatus } from '@prisma/client';

@ApiTags('Campaigns')
@ApiBearerAuth()
@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @ApiOperation({ summary: 'Kampanya oluştur' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateCampaignDto) {
    return this.campaignService.create(userId, dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Aktif kampanyaları listele' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.campaignService.findAll(CampaignStatus.ACTIVE, +page, +limit);
  }

  @Get('my')
  @ApiOperation({ summary: 'Kendi kampanyalarım' })
  findMy(@CurrentUser('id') userId: string) {
    return this.campaignService.findMyAll(userId);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Kampanya detayı' })
  findOne(@Param('slug') slug: string) {
    return this.campaignService.findBySlug(slug);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'İncelemeye gönder' })
  submit(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.campaignService.submitForReview(id, userId);
  }

  @Patch(':id/review')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Kampanya onayla/reddet (Admin)' })
  review(@Param('id') id: string, @Body() dto: ReviewCampaignDto) {
    return this.campaignService.review(id, dto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Kampanyayı iptal et' })
  cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.campaignService.cancel(id, userId);
  }
}
