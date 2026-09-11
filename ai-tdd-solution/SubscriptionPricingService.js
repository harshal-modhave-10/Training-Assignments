import { InvalidVoucherError } from './InvalidVoucherError.js';

export { InvalidVoucherError };

const BASE_RATES = {
  BASIC: 50.00,
  PRO: 150.00,
  ENTERPRISE: 500.00,
};

export class SubscriptionPricingService {
  calculatePrice(plan, months = 0, voucher = null) {
    let rate = BASE_RATES[plan];

    // Longevity discounts: >36 months gets 25%, >12 months gets 10%
    if (months > 36) {
      rate *= 0.75;
    } else if (months > 12) {
      rate *= 0.90;
    }

    // Voucher handling: applied after longevity discounts
    if (voucher !== null && voucher !== undefined) {
      if (voucher === 'SAVE20') {
        rate -= 20.00;
      } else if (voucher === 'HALFPRICE') {
        rate *= 0.50;
      } else {
        throw new InvalidVoucherError(`Invalid voucher: ${voucher}`);
      }
    }

    // Enforce floor minimum of 0.00
    rate = Math.max(0.00, rate);

    // Half-up rounding accurate to two decimal places
    return Math.round((rate + Number.EPSILON) * 100) / 100;
  }
}

