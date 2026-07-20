import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TaxService } from './tax.service';
import { TaxRate } from './schemas/tax-rate.schema';

const mockRates = [
  { name: 'GST Standard', type: 'percentage', rate: 18, isActive: true, priority: 10, countryCode: null, stateCode: null, categorySlug: null },
  { name: 'GST Electronics', type: 'percentage', rate: 12, isActive: true, priority: 20, countryCode: null, stateCode: null, categorySlug: 'electronics' },
  { name: 'State Tax', type: 'fixed', rate: 5000, isActive: true, priority: 5, countryCode: 'IN', stateCode: 'KA', categorySlug: null },
  { name: 'Inactive Rate', type: 'percentage', rate: 50, isActive: false, priority: 99, countryCode: null, stateCode: null, categorySlug: null },
];

function makeMockModel(rates: typeof mockRates) {
  return {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(rates.filter((r) => r.isActive)),
    }),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
  };
}

describe('TaxService', () => {
  let service: TaxService;
  let model: ReturnType<typeof makeMockModel>;

  beforeEach(async () => {
    model = makeMockModel(mockRates);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxService,
        { provide: getModelToken(TaxRate.name), useValue: model },
      ],
    }).compile();
    service = module.get<TaxService>(TaxService);
  });

  describe('calculateTax', () => {
    it('applies a wildcard percentage rate to all orders', async () => {
      // Only the standard GST applies (electronics slug not present, IN+KA not present)
      const result = await service.calculateTax({ subtotalCents: 100000 });
      // 18% of 1000.00 = 180.00 → 18000 cents
      expect(result.taxCents).toBe(18000);
      expect(result.breakdown).toHaveLength(1);
      expect(result.breakdown[0].name).toBe('GST Standard');
    });

    it('applies category-specific rate when slug matches', async () => {
      const result = await service.calculateTax({
        subtotalCents: 100000,
        categorySlugs: ['electronics'],
      });
      // Both GST Standard (18%) and GST Electronics (12%) match
      expect(result.taxCents).toBe(30000); // 18000 + 12000
      expect(result.breakdown).toHaveLength(2);
    });

    it('applies fixed rate when country+state match', async () => {
      const result = await service.calculateTax({
        subtotalCents: 100000,
        countryCode: 'IN',
        stateCode: 'KA',
      });
      // GST Standard (18000) + State Tax (fixed 5000)
      expect(result.taxCents).toBe(23000);
      expect(result.breakdown).toHaveLength(2);
    });

    it('skips country-specific rate when country does not match', async () => {
      const result = await service.calculateTax({
        subtotalCents: 100000,
        countryCode: 'US',
      });
      // State Tax requires IN — should not apply
      expect(result.taxCents).toBe(18000);
    });

    it('ignores inactive rates', async () => {
      const result = await service.calculateTax({ subtotalCents: 100000 });
      const names = result.breakdown.map((b) => b.name);
      expect(names).not.toContain('Inactive Rate');
    });

    it('returns zero tax when no active rates exist', async () => {
      model.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      });
      const result = await service.calculateTax({ subtotalCents: 100000 });
      expect(result.taxCents).toBe(0);
      expect(result.breakdown).toHaveLength(0);
    });
  });
});
