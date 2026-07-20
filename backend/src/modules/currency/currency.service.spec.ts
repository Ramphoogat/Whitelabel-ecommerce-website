import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { ExchangeRate } from './schemas/exchange-rate.schema';

function makeMockModel(rates: Record<string, number>) {
  return {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(Object.entries(rates).map(([pair, rate]) => {
        const [base, target] = pair.split('_');
        return { baseCurrency: base, targetCurrency: target, rate, isActive: true };
      })),
    }),
    findOne: jest.fn().mockImplementation((query: any) => ({
      lean: jest.fn().mockResolvedValue(null), // override per test
    })),
    findOneAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };
}

describe('CurrencyService', () => {
  let service: CurrencyService;

  function buildModule(findOneFn: jest.Mock) {
    return Test.createTestingModule({
      providers: [
        CurrencyService,
        {
          provide: getModelToken(ExchangeRate.name),
          useValue: {
            find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue([]) }),
            findOne: findOneFn,
            findOneAndUpdate: jest.fn().mockReturnValue({ lean: jest.fn() }),
            findByIdAndDelete: jest.fn(),
          },
        },
      ],
    }).compile();
  }

  it('returns same amount when from === to', async () => {
    const module = await buildModule(jest.fn());
    service = module.get<CurrencyService>(CurrencyService);
    const result = await service.convert(10000, 'INR', 'INR');
    expect(result).toBe(10000);
  });

  it('uses direct rate when available', async () => {
    const directRate = { baseCurrency: 'USD', targetCurrency: 'INR', rate: 83.5, isActive: true };
    const findOneMock = jest.fn().mockResolvedValueOnce(directRate);
    const module = await buildModule(findOneMock);
    service = module.get<CurrencyService>(CurrencyService);
    const result = await service.convert(100, 'USD', 'INR');
    expect(result).toBe(Math.round(100 * 83.5));
  });

  it('uses inverse rate when direct is not found', async () => {
    const inverseRate = { baseCurrency: 'INR', targetCurrency: 'USD', rate: 0.012, isActive: true };
    const findOneMock = jest.fn()
      .mockResolvedValueOnce(null)        // no direct USD→INR
      .mockResolvedValueOnce(inverseRate); // inverse INR→USD found
    const module = await buildModule(findOneMock);
    service = module.get<CurrencyService>(CurrencyService);
    const result = await service.convert(100, 'INR', 'USD');
    expect(result).toBe(Math.round(100 / 0.012));
  });

  it('throws when no rate exists in either direction', async () => {
    const findOneMock = jest.fn().mockResolvedValue(null);
    const module = await buildModule(findOneMock);
    service = module.get<CurrencyService>(CurrencyService);
    await expect(service.convert(100, 'EUR', 'JPY')).rejects.toThrow(BadRequestException);
  });

  it('throws when base and target are the same in upsert', async () => {
    const findOneMock = jest.fn().mockResolvedValue(null);
    const module = await buildModule(findOneMock);
    service = module.get<CurrencyService>(CurrencyService);
    await expect(
      service.upsertRate({ baseCurrency: 'USD', targetCurrency: 'USD', rate: 1 }),
    ).rejects.toThrow(BadRequestException);
  });
});
