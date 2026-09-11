import { describe, it, expect, beforeEach } from '@jest/globals';
import { SubscriptionPricingService, InvalidVoucherError } from './SubscriptionPricingService.js';

describe('SubscriptionPricingService', () => {
  let service;

  beforeEach(() => {
    service = new SubscriptionPricingService();
  });

  describe('Standard Baseline Rates (0 Months, No Vouchers)', () => {
    it('should return exactly $50.00 for BASIC tier at 0 months', () => {
      expect(service.calculatePrice('BASIC', 0)).toBe(50.00);
    });

    it('should return exactly $150.00 for PRO tier at 0 months', () => {
      expect(service.calculatePrice('PRO', 0)).toBe(150.00);
    });

    it('should return exactly $500.00 for ENTERPRISE tier at 0 months', () => {
      expect(service.calculatePrice('ENTERPRISE', 0)).toBe(500.00);
    });

    it('should default months to 0 and return exactly $50.00 for BASIC tier when months is omitted', () => {
      expect(service.calculatePrice('BASIC')).toBe(50.00);
    });

    it('should default months to 0 and return exactly $150.00 for PRO tier when months is omitted', () => {
      expect(service.calculatePrice('PRO')).toBe(150.00);
    });

    it('should default months to 0 and return exactly $500.00 for ENTERPRISE tier when months is omitted', () => {
      expect(service.calculatePrice('ENTERPRISE')).toBe(500.00);
    });
  });

  describe('Longevity Discount Exact Boundaries', () => {
    describe('Boundary: Exactly 12 Months (0% Discount, Threshold Not Met)', () => {
      it('should return baseline $50.00 for BASIC tier at 12 months without discount', () => {
        expect(service.calculatePrice('BASIC', 12)).toBe(50.00);
      });

      it('should return baseline $150.00 for PRO tier at 12 months without discount', () => {
        expect(service.calculatePrice('PRO', 12)).toBe(150.00);
      });

      it('should return baseline $500.00 for ENTERPRISE tier at 12 months without discount', () => {
        expect(service.calculatePrice('ENTERPRISE', 12)).toBe(500.00);
      });
    });

    describe('Boundary: Exactly 13 Months (10% Discount, Threshold First Met)', () => {
      it('should apply 10% discount and return exactly $45.00 for BASIC tier at 13 months', () => {
        expect(service.calculatePrice('BASIC', 13)).toBe(45.00);
      });

      it('should apply 10% discount and return exactly $135.00 for PRO tier at 13 months', () => {
        expect(service.calculatePrice('PRO', 13)).toBe(135.00);
      });

      it('should apply 10% discount and return exactly $450.00 for ENTERPRISE tier at 13 months', () => {
        expect(service.calculatePrice('ENTERPRISE', 13)).toBe(450.00);
      });
    });

    describe('Boundary: Exactly 36 Months (10% Discount Upper Bound, 25% Threshold Not Met)', () => {
      it('should retain 10% discount and return exactly $45.00 for BASIC tier at 36 months', () => {
        expect(service.calculatePrice('BASIC', 36)).toBe(45.00);
      });

      it('should retain 10% discount and return exactly $135.00 for PRO tier at 36 months', () => {
        expect(service.calculatePrice('PRO', 36)).toBe(135.00);
      });

      it('should retain 10% discount and return exactly $450.00 for ENTERPRISE tier at 36 months', () => {
        expect(service.calculatePrice('ENTERPRISE', 36)).toBe(450.00);
      });
    });

    describe('Boundary: Exactly 37 Months (25% Discount, Threshold First Met)', () => {
      it('should apply 25% discount and return exactly $37.50 for BASIC tier at 37 months', () => {
        expect(service.calculatePrice('BASIC', 37)).toBe(37.50);
      });

      it('should apply 25% discount and return exactly $112.50 for PRO tier at 37 months', () => {
        expect(service.calculatePrice('PRO', 37)).toBe(112.50);
      });

      it('should apply 25% discount and return exactly $375.00 for ENTERPRISE tier at 37 months', () => {
        expect(service.calculatePrice('ENTERPRISE', 37)).toBe(375.00);
      });
    });

    describe('Beyond 37 Months (Extended Longevity Cap at 25%)', () => {
      it('should retain 25% discount and return exactly $37.50 for BASIC tier at 60 months', () => {
        expect(service.calculatePrice('BASIC', 60)).toBe(37.50);
      });

      it('should retain 25% discount and return exactly $112.50 for PRO tier at 60 months', () => {
        expect(service.calculatePrice('PRO', 60)).toBe(112.50);
      });

      it('should retain 25% discount and return exactly $375.00 for ENTERPRISE tier at 60 months', () => {
        expect(service.calculatePrice('ENTERPRISE', 60)).toBe(375.00);
      });
    });
  });

  describe('Voucher: "SAVE20" (Deducts $20 flat after longevity percentage discounts)', () => {
    describe('At 0 Months Baseline', () => {
      it('should deduct $20 flat from BASIC baseline to yield exactly $30.00', () => {
        expect(service.calculatePrice('BASIC', 0, 'SAVE20')).toBe(30.00);
      });

      it('should deduct $20 flat from PRO baseline to yield exactly $130.00', () => {
        expect(service.calculatePrice('PRO', 0, 'SAVE20')).toBe(130.00);
      });

      it('should deduct $20 flat from ENTERPRISE baseline to yield exactly $480.00', () => {
        expect(service.calculatePrice('ENTERPRISE', 0, 'SAVE20')).toBe(480.00);
      });
    });

    describe('At 12 Months Boundary (0% Longevity Discount)', () => {
      it('should deduct $20 flat from BASIC 12-month rate to yield exactly $30.00', () => {
        expect(service.calculatePrice('BASIC', 12, 'SAVE20')).toBe(30.00);
      });

      it('should deduct $20 flat from PRO 12-month rate to yield exactly $130.00', () => {
        expect(service.calculatePrice('PRO', 12, 'SAVE20')).toBe(130.00);
      });

      it('should deduct $20 flat from ENTERPRISE 12-month rate to yield exactly $480.00', () => {
        expect(service.calculatePrice('ENTERPRISE', 12, 'SAVE20')).toBe(480.00);
      });
    });

    describe('At 13 Months Boundary (10% Longevity Discount Applied First)', () => {
      it('should deduct $20 after 10% discount on BASIC ($45.00 - $20.00) to yield exactly $25.00', () => {
        expect(service.calculatePrice('BASIC', 13, 'SAVE20')).toBe(25.00);
      });

      it('should deduct $20 after 10% discount on PRO ($135.00 - $20.00) to yield exactly $115.00', () => {
        expect(service.calculatePrice('PRO', 13, 'SAVE20')).toBe(115.00);
      });

      it('should deduct $20 after 10% discount on ENTERPRISE ($450.00 - $20.00) to yield exactly $430.00', () => {
        expect(service.calculatePrice('ENTERPRISE', 13, 'SAVE20')).toBe(430.00);
      });
    });

    describe('At 36 Months Boundary (10% Longevity Discount Applied First)', () => {
      it('should deduct $20 after 10% discount on BASIC at 36 months to yield exactly $25.00', () => {
        expect(service.calculatePrice('BASIC', 36, 'SAVE20')).toBe(25.00);
      });

      it('should deduct $20 after 10% discount on PRO at 36 months to yield exactly $115.00', () => {
        expect(service.calculatePrice('PRO', 36, 'SAVE20')).toBe(115.00);
      });

      it('should deduct $20 after 10% discount on ENTERPRISE at 36 months to yield exactly $430.00', () => {
        expect(service.calculatePrice('ENTERPRISE', 36, 'SAVE20')).toBe(430.00);
      });
    });

    describe('At 37 Months Boundary (25% Longevity Discount Applied First)', () => {
      it('should deduct $20 after 25% discount on BASIC ($37.50 - $20.00) to yield exactly $17.50', () => {
        expect(service.calculatePrice('BASIC', 37, 'SAVE20')).toBe(17.50);
      });

      it('should deduct $20 after 25% discount on PRO ($112.50 - $20.00) to yield exactly $92.50', () => {
        expect(service.calculatePrice('PRO', 37, 'SAVE20')).toBe(92.50);
      });

      it('should deduct $20 after 25% discount on ENTERPRISE ($375.00 - $20.00) to yield exactly $355.00', () => {
        expect(service.calculatePrice('ENTERPRISE', 37, 'SAVE20')).toBe(355.00);
      });
    });
  });

  describe('Voucher: "HALFPRICE" (Reduces calculated rate by 50% after longevity discounts)', () => {
    describe('At 0 Months Baseline', () => {
      it('should reduce BASIC baseline by 50% to yield exactly $25.00', () => {
        expect(service.calculatePrice('BASIC', 0, 'HALFPRICE')).toBe(25.00);
      });

      it('should reduce PRO baseline by 50% to yield exactly $75.00', () => {
        expect(service.calculatePrice('PRO', 0, 'HALFPRICE')).toBe(75.00);
      });

      it('should reduce ENTERPRISE baseline by 50% to yield exactly $250.00', () => {
        expect(service.calculatePrice('ENTERPRISE', 0, 'HALFPRICE')).toBe(250.00);
      });
    });

    describe('At 12 Months Boundary (0% Longevity Discount)', () => {
      it('should reduce BASIC 12-month rate by 50% to yield exactly $25.00', () => {
        expect(service.calculatePrice('BASIC', 12, 'HALFPRICE')).toBe(25.00);
      });

      it('should reduce PRO 12-month rate by 50% to yield exactly $75.00', () => {
        expect(service.calculatePrice('PRO', 12, 'HALFPRICE')).toBe(75.00);
      });

      it('should reduce ENTERPRISE 12-month rate by 50% to yield exactly $250.00', () => {
        expect(service.calculatePrice('ENTERPRISE', 12, 'HALFPRICE')).toBe(250.00);
      });
    });

    describe('At 13 Months Boundary (10% Longevity Discount Applied First)', () => {
      it('should reduce BASIC discounted rate ($45.00 * 0.50) to yield exactly $22.50', () => {
        expect(service.calculatePrice('BASIC', 13, 'HALFPRICE')).toBe(22.50);
      });

      it('should reduce PRO discounted rate ($135.00 * 0.50) to yield exactly $67.50', () => {
        expect(service.calculatePrice('PRO', 13, 'HALFPRICE')).toBe(67.50);
      });

      it('should reduce ENTERPRISE discounted rate ($450.00 * 0.50) to yield exactly $225.00', () => {
        expect(service.calculatePrice('ENTERPRISE', 13, 'HALFPRICE')).toBe(225.00);
      });
    });

    describe('At 36 Months Boundary (10% Longevity Discount Applied First)', () => {
      it('should reduce BASIC discounted rate at 36 months to yield exactly $22.50', () => {
        expect(service.calculatePrice('BASIC', 36, 'HALFPRICE')).toBe(22.50);
      });

      it('should reduce PRO discounted rate at 36 months to yield exactly $67.50', () => {
        expect(service.calculatePrice('PRO', 36, 'HALFPRICE')).toBe(67.50);
      });

      it('should reduce ENTERPRISE discounted rate at 36 months to yield exactly $225.00', () => {
        expect(service.calculatePrice('ENTERPRISE', 36, 'HALFPRICE')).toBe(225.00);
      });
    });

    describe('At 37 Months Boundary (25% Longevity Discount Applied First)', () => {
      it('should reduce BASIC discounted rate ($37.50 * 0.50) to yield exactly $18.75', () => {
        expect(service.calculatePrice('BASIC', 37, 'HALFPRICE')).toBe(18.75);
      });

      it('should reduce PRO discounted rate ($112.50 * 0.50) to yield exactly $56.25', () => {
        expect(service.calculatePrice('PRO', 37, 'HALFPRICE')).toBe(56.25);
      });

      it('should reduce ENTERPRISE discounted rate ($375.00 * 0.50) to yield exactly $187.50', () => {
        expect(service.calculatePrice('ENTERPRISE', 37, 'HALFPRICE')).toBe(187.50);
      });
    });
  });

  describe('Invalid and Expired Voucher Handling', () => {
    it('should strictly throw InvalidVoucherError when voucher string is unrecognized', () => {
      expect(() => {
        service.calculatePrice('BASIC', 0, 'DISCOUNT10');
      }).toThrow(InvalidVoucherError);
    });

    it('should strictly throw InvalidVoucherError when voucher string indicates expired', () => {
      expect(() => {
        service.calculatePrice('BASIC', 0, 'EXPIRED');
      }).toThrow(InvalidVoucherError);

      expect(() => {
        service.calculatePrice('PRO', 13, 'SAVE20_EXPIRED');
      }).toThrow(InvalidVoucherError);
    });

    it('should strictly throw InvalidVoucherError on empty voucher string', () => {
      expect(() => {
        service.calculatePrice('BASIC', 0, '');
      }).toThrow(InvalidVoucherError);
    });

    it('should strictly throw InvalidVoucherError on whitespace-only voucher string', () => {
      expect(() => {
        service.calculatePrice('BASIC', 0, '   ');
      }).toThrow(InvalidVoucherError);
    });

    it('should strictly throw InvalidVoucherError for lower-case voucher code "save20"', () => {
      expect(() => {
        service.calculatePrice('BASIC', 0, 'save20');
      }).toThrow(InvalidVoucherError);
    });

    it('should strictly throw InvalidVoucherError for lower-case voucher code "halfprice"', () => {
      expect(() => {
        service.calculatePrice('BASIC', 0, 'halfprice');
      }).toThrow(InvalidVoucherError);
    });

    it('should return exact baseline rate of $50.00 when voucher argument is null', () => {
      expect(service.calculatePrice('BASIC', 0, null)).toBe(50.00);
    });

    it('should return exact baseline rate of $50.00 when voucher argument is undefined', () => {
      expect(service.calculatePrice('BASIC', 0, undefined)).toBe(50.00);
    });
  });

  describe('Rounding and Precision Constraints', () => {
    it('should accurately calculate two decimal places for BASIC tier at 37 months with HALFPRICE ($18.75)', () => {
      expect(service.calculatePrice('BASIC', 37, 'HALFPRICE')).toBe(18.75);
    });

    it('should accurately calculate two decimal places for PRO tier at 37 months with HALFPRICE ($56.25)', () => {
      expect(service.calculatePrice('PRO', 37, 'HALFPRICE')).toBe(56.25);
    });

    it('should accurately calculate two decimal places for ENTERPRISE tier at 37 months with HALFPRICE ($187.50)', () => {
      expect(service.calculatePrice('ENTERPRISE', 37, 'HALFPRICE')).toBe(187.50);
    });
  });

  describe('Floor and Minimum Bounds', () => {
    it('should evaluate the minimum possible rate under maximum allowable deductions to exactly $17.50', () => {
      // Maximum discount combination: BASIC ($50.00) with >36 months (25% off -> $37.50) and SAVE20 ($20 flat -> $17.50)
      expect(service.calculatePrice('BASIC', 37, 'SAVE20')).toBe(17.50);
    });

    it('should evaluate the lowest percentage-discounted rate to exactly $18.75', () => {
      // BASIC ($50.00) with >36 months (25% off -> $37.50) and HALFPRICE (50% off -> $18.75)
      expect(service.calculatePrice('BASIC', 37, 'HALFPRICE')).toBe(18.75);
    });
  });

  describe('Critical Adversarial Test Suite: 4 Selected Scenarios', () => {
    /**
     * 1. Floating-Point Precision
     * Engineering Justification: Validates half-up rounding on fractional cent outputs.
     * Prevents binary floating-point representation drift (IEEE-754) when combining
     * multi-step percentage discounts (e.g. 25% longevity then 50% voucher).
     */
    describe('1. Floating-Point Precision: Half-Up Rounding on Fractional Cent Outputs', () => {
      it.each([
        ['BASIC', 37, 'HALFPRICE', 18.75, '$50.00 * 0.75 * 0.50 = $18.75 (exact fractional cent half-up)'],
        ['PRO', 37, 'HALFPRICE', 56.25, '$150.00 * 0.75 * 0.50 = $56.25 (exact fractional cent half-up)'],
        ['ENTERPRISE', 37, 'HALFPRICE', 187.50, '$500.00 * 0.75 * 0.50 = $187.50 (exact fractional cent half-up)'],
        ['BASIC', 13, 'HALFPRICE', 22.50, '$50.00 * 0.90 * 0.50 = $22.50 (intermediate fractional half-up)'],
        ['PRO', 13, 'HALFPRICE', 67.50, '$150.00 * 0.90 * 0.50 = $67.50 (intermediate fractional half-up)'],
        ['ENTERPRISE', 13, 'HALFPRICE', 225.00, '$500.00 * 0.90 * 0.50 = $225.00 (intermediate fractional half-up)'],
      ])('should accurately compute %s at %d months with %s to $%d (%s)', (plan, months, voucher, expected) => {
        expect(service.calculatePrice(plan, months, voucher)).toBe(expected);
      });
    });

    /**
     * 2. Month Boundary Limits
     * Engineering Justification: Tests exact boundary transitions (e.g., 12 vs 13 months, 36 vs 37 months).
     * Guards against off-by-one errors (> vs >=) at critical financial threshold boundaries.
     */
    describe('2. Month Boundary Limits: Exact Boundary Transitions (12 vs 13, 36 vs 37 Months)', () => {
      it.each([
        // 12 vs 13 Months Boundary: 0% vs 10% Discount
        ['BASIC', 12, 50.00, 'BASIC at 12 months: threshold not met (0% discount, $50.00)'],
        ['BASIC', 13, 45.00, 'BASIC at 13 months: threshold met (10% discount, $45.00)'],
        ['PRO', 12, 150.00, 'PRO at 12 months: threshold not met (0% discount, $150.00)'],
        ['PRO', 13, 135.00, 'PRO at 13 months: threshold met (10% discount, $135.00)'],
        ['ENTERPRISE', 12, 500.00, 'ENTERPRISE at 12 months: threshold not met (0% discount, $500.00)'],
        ['ENTERPRISE', 13, 450.00, 'ENTERPRISE at 13 months: threshold met (10% discount, $450.00)'],

        // 36 vs 37 Months Boundary: 10% vs 25% Discount
        ['BASIC', 36, 45.00, 'BASIC at 36 months: upper limit of 10% discount tier ($45.00)'],
        ['BASIC', 37, 37.50, 'BASIC at 37 months: entry into 25% discount tier ($37.50)'],
        ['PRO', 36, 135.00, 'PRO at 36 months: upper limit of 10% discount tier ($135.00)'],
        ['PRO', 37, 112.50, 'PRO at 37 months: entry into 25% discount tier ($112.50)'],
        ['ENTERPRISE', 36, 450.00, 'ENTERPRISE at 36 months: upper limit of 10% discount tier ($450.00)'],
        ['ENTERPRISE', 37, 375.00, 'ENTERPRISE at 37 months: entry into 25% discount tier ($375.00)'],
      ])('should resolve %s at boundary %d months to exactly $%d (%s)', (plan, months, expected) => {
        expect(service.calculatePrice(plan, months)).toBe(expected);
      });
    });

    /**
     * 3. Floor Enforcement
     * Engineering Justification: Ensures discounts dropping total below $0 round up to $0.00.
     * Enforces the business floor constraint so account totals cannot produce negative balances.
     */
    describe('3. Floor Enforcement: Ensures Discounts Dropping Total Below $0 Round Up to $0.00', () => {
      it.each([
        [10.00, 0, 'SAVE20', 0.00, 'base rate $10.00 minus $20.00 voucher floors at $0.00'],
        [15.00, 0, 'SAVE20', 0.00, 'base rate $15.00 minus $20.00 voucher floors at $0.00'],
        [0.00, 0, 'SAVE20', 0.00, 'base rate $0.00 minus $20.00 voucher floors at $0.00'],
        [10.00, 13, 'SAVE20', 0.00, 'discounted $9.00 minus $20.00 voucher floors at $0.00'],
        [20.00, 37, 'SAVE20', 0.00, 'discounted $15.00 minus $20.00 voucher floors at $0.00'],
        ['BASIC', 37, 'SAVE20', 17.50, 'standard maximum valid deduction ($50 * 0.75 - 20) yields $17.50 >= $0.00'],
      ])('should floor rate to $%d when initial rate is %p with %s (%s)', (rateOrPlan, months, voucher, expected) => {
        expect(service.calculatePrice(rateOrPlan, months, voucher)).toBe(expected);
      });
    });

    /**
     * 4. Unknown Voucher Handlers
     * Engineering Justification: Confirms invalid input types fail safely with InvalidVoucherError.
     * Prevents unhandled exceptions, prototype poisoning, and improper voucher stacking.
     */
    describe('4. Unknown Voucher Handlers: Confirms Invalid Input Types Fail Safely with InvalidVoucherError', () => {
      it.each([
        ['DISCOUNT10', 'unrecognized voucher code'],
        ['EXPIRED', 'expired voucher code'],
        ['SAVE20_EXPIRED', 'expired voucher token prefix'],
        ['SAVE20,HALFPRICE', 'concatenated voucher stacking attempt'],
        ['SAVE20 HALFPRICE', 'space-separated voucher stacking attempt'],
        ['toString', 'prototype function property injection'],
        ['valueOf', 'prototype method property injection'],
        ['__proto__', 'prototype key access attempt'],
        ['constructor', 'constructor property access attempt'],
        [' save20 ', 'padded leading/trailing whitespace voucher'],
        ['', 'empty string voucher'],
        ['   ', 'whitespace-only voucher string'],
        [12345, 'numeric voucher input'],
        [true, 'boolean voucher input'],
        [{}, 'object voucher input'],
        [['SAVE20'], 'array voucher input'],
      ])('should strictly throw InvalidVoucherError when voucher argument is %p (%s)', (invalidVoucher) => {
        expect(() => service.calculatePrice('BASIC', 0, invalidVoucher)).toThrow(InvalidVoucherError);
      });
    });
  });
});
