import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrencyService } from './currency.service';
import { UpsertExchangeRateDto } from './dto/upsert-exchange-rate.dto';
import { JwtStaffGuard } from '../../shared/guards/jwt-staff.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@ApiTags('admin-currency')
@ApiBearerAuth()
@UseGuards(JwtStaffGuard, RolesGuard)
@Roles('owner', 'admin')
@Controller('admin/currency')
export class CurrencyAdminController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('rates')
  @ApiOperation({ summary: 'List all exchange rates' })
  listRates() {
    return this.currencyService.listRates();
  }

  @Post('rates')
  @ApiOperation({ summary: 'Create or update an exchange rate (upsert by base+target pair)' })
  upsertRate(@Body() dto: UpsertExchangeRateDto) {
    return this.currencyService.upsertRate(dto);
  }

  @Delete('rates/:id')
  @ApiOperation({ summary: 'Delete an exchange rate' })
  deleteRate(@Param('id') id: string) {
    return this.currencyService.deleteRate(id);
  }
}
