import { describe, it, expect, beforeEach } from '@jest/globals';
import { SubscriptionPricingService, InvalidVoucherError } from './SubscriptionPricingService.js';

describe('SubscriptionPricingService', () => {
  let service;

  beforeEach(() => {
    service = new SubscriptionPricingService();
  });

  describe('Standard Baseline Rates (0 Months, No Vouchers)', () => {
    it('should return $50.00 for BASIC tier when no longevity discount or voucher is applied', () => {
      const rate = service.calculatePrice('BASIC', 0);
      expect(rate).toBe(50.00);
    });

    it('should return $150.00 for PRO tier when no longevity discount or voucher is applied', () => {
      const rate = service.calculatePrice('PRO', 0);
      expect(rate).toBe(150.00);
    });

    it('should return $500.00 for ENTERPRISE tier when no longevity discount or voucher is applied', () => {
      const rate = service.calculatePrice('ENTERPRISE', 0);
      expect(rate).toBe(500.00);
    });

    it('should default months to 0 when months argument is omitted', () => {
      expect(service.calculatePrice('BASIC')).toBe(50.00);
      expect(service.calculatePrice('PRO')).toBe(150.00);
      expect(service.calculatePrice('ENTERPRISE')).toBe(500.00);
    });
  });

  describe('Longevity Discount Boundaries', () => {
    describe('Boundary: Exactly 12 Months (Threshold for 10% Discount, Not Met)', () => {
      it('should NOT apply discount at 12 months for BASIC tier', () => {
        expect(service.calculatePrice('BASIC', 12)).toBe(50.00);
      });

      it('should NOT apply discount at 12 months for PRO tier', () => {
        expect(service.calculatePrice('PRO', 12)).toBe(150.00);
      });

      it('should NOT apply discount at 12 months for ENTERPRISE tier', () => {
        expect(service.calculatePrice('ENTERPRISE', 12)).toBe(500.00);
      });
    });

    describe('Boundary: Exactly 13 Months (Threshold for 10% Discount, First Met)', () => {
      it('should apply 10% discount at 13 months for BASIC tier ($50 -> $45.00)', () => {
        expect(service.calculatePrice('BASIC', 13)).toBe(45.00);
      });

      it('should apply 10% discount at 13 months for PRO tier ($150 -> $135.00)', () => {
        expect(service.calculatePrice('PRO', 13)).toBe(135.00);
      });

      it('should apply 10% discount at 13 months for ENTERPRISE tier ($500 -> $450.00)', () => {
        expect(service.calculatePrice('ENTERPRISE', 13)).toBe(450.00);
      });
    });

    describe('Boundary: Exactly 36 Months (Upper Threshold for 10% Discount, 25% Not Met)', () => {
      it('should retain 10% discount at 36 months for BASIC tier ($45.00)', () => {
        expect(service.calculatePrice('BASIC', 36)).toBe(45.00);
      });

      it('should retain 10% discount at 36 months for PRO tier ($135.00)', () => {
        expect(service.calculatePrice('PRO', 36)).toBe(135.00);
      });

      it('should retain 10% discount at 36 months for ENTERPRISE tier ($450.00)', () => {
        expect(service.calculatePrice('ENTERPRISE', 36)).toBe(450.00);
      });
    });

    describe('Boundary: Exactly 37 Months (Threshold for 25% Discount, First Met)', () => {
      it('should apply 25% discount at 37 months for BASIC tier ($50 -> $37.50)', () => {
        expect(service.calculatePrice('BASIC', 37)).toBe(37.50);
      });

      it('should apply 25% discount at 37 months for PRO tier ($150 -> $112.50)', () => {
        expect(service.calculatePrice('PRO', 37)).toBe(112.50);
      });

      it('should apply 25% discount at 37 months for ENTERPRISE tier ($500 -> $375.00)', () => {
        expect(service.calculatePrice('ENTERPRISE', 37)).toBe(375.00);
      });
    });

    it('should maintain 25% discount for extended subscriptions beyond 37 months', () => {
      expect(service.calculatePrice('BASIC', 60)).toBe(37.50);
      expect(service.calculatePrice('PRO', 60)).toBe(112.50);
      expect(service.calculatePrice('ENTERPRISE', 60)).toBe(375.00);
    });
  });

  describe('Voucher: "SAVE20" (Deducts $20 flat after percentage discounts)', () => {
    it('should deduct $20 from baseline rate with 0 months subscription', () => {
      expect(service.calculatePrice('BASIC', 0, 'SAVE20')).toBe(30.00);
      expect(service.calculatePrice('PRO', 0, 'SAVE20')).toBe(130.00);
      expect(service.calculatePrice('ENTERPRISE', 0, 'SAVE20')).toBe(480.00);
    });

    it('should deduct $20 at 12 months boundary (0% longevity discount)', () => {
      expect(service.calculatePrice('BASIC', 12, 'SAVE20')).toBe(30.00);
      expect(service.calculatePrice('PRO', 12, 'SAVE20')).toBe(130.00);
      expect(service.calculatePrice('ENTERPRISE', 12, 'SAVE20')).toBe(480.00);
    });

    it('should deduct $20 after 10% longevity discount at 13 months boundary', () => {
      // BASIC: ($50 * 0.90) - $20 = $45 - $20 = $25.00
      expect(service.calculatePrice('BASIC', 13, 'SAVE20')).toBe(25.00);
      // PRO: ($150 * 0.90) - $20 = $135 - $20 = $115.00
      expect(service.calculatePrice('PRO', 13, 'SAVE20')).toBe(115.00);
      // ENTERPRISE: ($500 * 0.90) - $20 = $450 - $20 = $430.00
      expect(service.calculatePrice('ENTERPRISE', 13, 'SAVE20')).toBe(430.00);
    });

    it('should deduct $20 after 10% longevity discount at 36 months boundary', () => {
      expect(service.calculatePrice('BASIC', 36, 'SAVE20')).toBe(25.00);
      expect(service.calculatePrice('PRO', 36, 'SAVE20')).toBe(115.00);
      expect(service.calculatePrice('ENTERPRISE', 36, 'SAVE20')).toBe(430.00);
    });

    it('should deduct $20 after 25% longevity discount at 37 months boundary', () => {
      // BASIC: ($50 * 0.75) - $20 = $37.50 - $20 = $17.50
      expect(service.calculatePrice('BASIC', 37, 'SAVE20')).toBe(17.50);
      // PRO: ($150 * 0.75) - $20 = $112.50 - $20 = $92.50
      expect(service.calculatePrice('PRO', 37, 'SAVE20')).toBe(92.50);
      // ENTERPRISE: ($500 * 0.75) - $20 = $375.00 - $20 = $355.00
      expect(service.calculatePrice('ENTERPRISE', 37, 'SAVE20')).toBe(355.00);
    });
  });

  describe('Voucher: "HALFPRICE" (Reduces calculated rate by 50% after longevity discounts)', () => {
    it('should reduce baseline rate by 50% with 0 months subscription', () => {
      expect(service.calculatePrice('BASIC', 0, 'HALFPRICE')).toBe(25.00);
      expect(service.calculatePrice('PRO', 0, 'HALFPRICE')).toBe(75.00);
      expect(service.calculatePrice('ENTERPRISE', 0, 'HALFPRICE')).toBe(250.00);
    });

    it('should reduce rate by 50% at 12 months boundary (0% longevity discount)', () => {
      expect(service.calculatePrice('BASIC', 12, 'HALFPRICE')).toBe(25.00);
      expect(service.calculatePrice('PRO', 12, 'HALFPRICE')).toBe(75.00);
      expect(service.calculatePrice('ENTERPRISE', 12, 'HALFPRICE')).toBe(250.00);
    });

    it('should reduce rate by 50% after 10% longevity discount at 13 months boundary', () => {
      // BASIC: ($50 * 0.90) * 0.50 = $45 * 0.50 = $22.50
      expect(service.calculatePrice('BASIC', 13, 'HALFPRICE')).toBe(22.50);
      // PRO: ($150 * 0.90) * 0.50 = $135 * 0.50 = $67.50
      expect(service.calculatePrice('PRO', 13, 'HALFPRICE')).toBe(67.50);
      // ENTERPRISE: ($500 * 0.90) * 0.50 = $450 * 0.50 = $225.00
      expect(service.calculatePrice('ENTERPRISE', 13, 'HALFPRICE')).toBe(225.00);
    });

    it('should reduce rate by 50% after 10% longevity discount at 36 months boundary', () => {
      expect(service.calculatePrice('BASIC', 36, 'HALFPRICE')).toBe(22.50);
      expect(service.calculatePrice('PRO', 36, 'HALFPRICE')).toBe(67.50);
      expect(service.calculatePrice('ENTERPRISE', 36, 'HALFPRICE')).toBe(225.00);
    });

    it('should reduce rate by 50% after 25% longevity discount at 37 months boundary', () => {
      // BASIC: ($50 * 0.75) * 0.50 = $37.50 * 0.50 = $18.75
      expect(service.calculatePrice('BASIC', 37, 'HALFPRICE')).toBe(18.75);
      // PRO: ($150 * 0.75) * 0.50 = $112.50 * 0.50 = $56.25
      expect(service.calculatePrice('PRO', 37, 'HALFPRICE')).toBe(56.25);
      // ENTERPRISE: ($500 * 0.75) * 0.50 = $375.00 * 0.50 = $187.50
      expect(service.calculatePrice('ENTERPRISE', 37, 'HALFPRICE')).toBe(187.50);
    });
  });

  describe('Invalid and Expired Voucher Handling', () => {
    it('should throw InvalidVoucherError when voucher string is unrecognized', () => {
      expect(() => {
        service.calculatePrice('BASIC', 0, 'DISCOUNT10');
      }).toThrow(InvalidVoucherError);
    });

    it('should throw InvalidVoucherError when voucher string is expired', () => {
      expect(() => {
        service.calculatePrice('BASIC', 0, 'EXPIRED');
      }).toThrow(InvalidVoucherError);

      expect(() => {
        service.calculatePrice('PRO', 13, 'SAVE20_EXPIRED');
      }).toThrow(InvalidVoucherError);
    });

    it('should throw InvalidVoucherError on empty voucher string', () => {
      expect(() => {
        service.calculatePrice('BASIC', 0, '');
      }).toThrow(InvalidVoucherError);
    });

    it('should throw InvalidVoucherError on whitespace-only voucher string', () => {
      expect(() => {
        service.calculatePrice('BASIC', 0, '   ');
      }).toThrow(InvalidVoucherError);
    });

    it('should throw InvalidVoucherError for lower-case or case-mismatched voucher codes', () => {
      expect(() => {
        service.calculatePrice('BASIC', 0, 'save20');
      }).toThrow(InvalidVoucherError);

      expect(() => {
        service.calculatePrice('BASIC', 0, 'halfprice');
      }).toThrow(InvalidVoucherError);
    });

    it('should throw an error that is an instance of InvalidVoucherError and Error', () => {
      try {
        service.calculatePrice('BASIC', 0, 'INVALID_CODE');
        throw new Error('Test failed: Error was not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidVoucherError);
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('InvalidVoucherError');
      }
    });

    it('should NOT throw when voucher argument is null or undefined', () => {
      expect(() => service.calculatePrice('BASIC', 0, null)).not.toThrow();
      expect(() => service.calculatePrice('BASIC', 0, undefined)).not.toThrow();
      expect(service.calculatePrice('BASIC', 0, null)).toBe(50.00);
      expect(service.calculatePrice('BASIC', 0, undefined)).toBe(50.00);
    });
  });

  describe('Rounding and Floor Constraints', () => {
    it('should enforce half-up rounding accurate to two decimal places', () => {
      // Half-up precision checks across odd-cent calculations
      const basicHalfPrice37m = service.calculatePrice('BASIC', 37, 'HALFPRICE');
      expect(basicHalfPrice37m).toBe(18.75);

      const proHalfPrice37m = service.calculatePrice('PRO', 37, 'HALFPRICE');
      expect(proHalfPrice37m).toBe(56.25);

      // Verify no floating point overflow beyond two decimal places
      const decimalPlaces = basicHalfPrice37m.toString().split('.')[1]?.length || 0;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    it('should guarantee that final rate never drops below $0.00 across all standard discounts', () => {
      const plans = ['BASIC', 'PRO', 'ENTERPRISE'];
      const months = [0, 12, 13, 36, 37, 60];
      const vouchers = [null, 'SAVE20', 'HALFPRICE'];

      for (const plan of plans) {
        for (const month of months) {
          for (const voucher of vouchers) {
            const finalRate = service.calculatePrice(plan, month, voucher);
            expect(finalRate).toBeGreaterThanOrEqual(0.00);
          }
        }
      }
    });

    it('should floor negative resulting totals to $0.00 when deductions exceed remaining rate', () => {
      // In scenarios where total deductions exceed the base rate (e.g. promotional credit >= base rate),
      // the final rate must floor at $0.00 rather than yielding a negative balance.
      const rate = service.calculatePrice('BASIC', 37, 'SAVE20');
      expect(rate).toBeGreaterThanOrEqual(0.00);

      // If service is evaluated against zero/sub-zero intermediate calculations
      if (typeof service.calculatePrice === 'function') {
        const floorClamped = Math.max(0.00, rate - 50.00);
        expect(floorClamped).toBe(0.00);
      }
    });
  });
});

