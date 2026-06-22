import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminUserQueryDto, AdminCampaignQueryDto } from './dto/list-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard istatistikleri' })
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Kullanıcı listesi' })
  listUsers(@Query() query: AdminUserQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Patch('users/:id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kullanıcıyı askıya al' })
  suspendUser(@Param('id') id: string) {
    return this.adminService.suspendUser(id);
  }

  @Patch('users/:id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kullanıcıyı aktifleştir' })
  activateUser(@Param('id') id: string) {
    return this.adminService.activateUser(id);
  }

  @Patch('users/:id/role')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Kullanıcı rolünü değiştir (Super Admin)' })
  changeRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.adminService.changeUserRole(id, role);
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Kampanya listesi' })
  listCampaigns(@Query() query: AdminCampaignQueryDto) {
    return this.adminService.listCampaigns(query);
  }

  @Get('coupons')
  @ApiOperation({ summary: 'Kupon listesi' })
  listCoupons(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.listAllCoupons(+page, +limit);
  }
}
