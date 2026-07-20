import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrencyService } from './currency.service';
import { Public } from '../../shared/decorators/public.decorator';

@ApiTags('storefront-currency')
@Public()
@Controller('storefront/currency')
export class CurrencyPublicController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('rates')
  @ApiOperation({ summary: 'List active exchange rates for the storefront price converter' })
  listRates() {
    return this.currencyService.listActiveRates();
  }

  @Get('convert')
  @ApiOperation({ summary: 'Convert an amount between currencies' })
  @ApiQuery({ name: 'amount', type: Number })
  @ApiQuery({ name: 'from', type: String })
  @ApiQuery({ name: 'to', type: String })
  convert(
    @Query('amount') amount: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.currencyService.convert(Math.round(parseFloat(amount)), from, to);
  }
}
