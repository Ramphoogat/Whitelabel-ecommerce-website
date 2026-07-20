import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TaxService, TaxCalculationInput } from './tax.service';
import { CreateTaxRateDto } from './dto/create-tax-rate.dto';
import { UpdateTaxRateDto } from './dto/update-tax-rate.dto';
import { JwtStaffGuard } from '../../shared/guards/jwt-staff.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@ApiTags('admin-tax')
@ApiBearerAuth()
@UseGuards(JwtStaffGuard, RolesGuard)
@Roles('owner', 'admin')
@Controller('admin/tax')
export class TaxAdminController {
  constructor(private readonly taxService: TaxService) {}

  @Get('rates')
  @ApiOperation({ summary: 'List all tax rates' })
  listRates() {
    return this.taxService.listRates();
  }

  @Get('rates/:id')
  @ApiOperation({ summary: 'Get a single tax rate' })
  getRate(@Param('id') id: string) {
    return this.taxService.getRate(id);
  }

  @Post('rates')
  @ApiOperation({ summary: 'Create a tax rate' })
  createRate(@Body() dto: CreateTaxRateDto) {
    return this.taxService.createRate(dto);
  }

  @Patch('rates/:id')
  @ApiOperation({ summary: 'Update a tax rate' })
  updateRate(@Param('id') id: string, @Body() dto: UpdateTaxRateDto) {
    return this.taxService.updateRate(id, dto);
  }

  @Delete('rates/:id')
  @ApiOperation({ summary: 'Delete a tax rate' })
  deleteRate(@Param('id') id: string) {
    return this.taxService.deleteRate(id);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Preview tax for a given subtotal + context (useful for testing rules)' })
  calculate(@Body() input: TaxCalculationInput) {
    return this.taxService.calculateTax(input);
  }
}
