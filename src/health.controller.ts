import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { SkipTransform } from './common/decorators/skip-transform.decorator';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Public()
  @SkipTransform()
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
