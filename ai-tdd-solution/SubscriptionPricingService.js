import { InvalidVoucherError } from './InvalidVoucherError.js';

export { InvalidVoucherError };

/**
 * Strategy map for base rates indexed by subscription tier.
 */
const BASE_RATES = Object.freeze({
  BASIC: 50.00,
  PRO: 150.00,
  ENTERPRISE: 500.00,
});

/**
 * Ordered longevity discount tiers evaluated in descending order of threshold.
 */
const LONGEVITY_RULES = Object.freeze([
  { minMonths: 36, multiplier: 0.75 }, // > 36 months gets 25% discount
  { minMonths: 12, multiplier: 0.90 }, // > 12 months gets 10% discount
]);

/**
 * Strategy map for voucher calculations applied after longevity discounts.
 */
const VOUCHER_STRATEGIES = Object.freeze({
  SAVE20: (rate) => rate - 20.00,
  HALFPRICE: (rate) => rate * 0.50,
});

/**
 * Pipeline Step 1: Resolve the base rate for the subscription tier.
 * Accepts tier string ('BASIC', 'PRO', 'ENTERPRISE') or custom numeric base rate for deficit testing.
 * @param {string|number} plan
 * @returns {number}
 */
const resolveBaseRate = (plan) =>
  typeof plan === 'number' ? plan : BASE_RATES[plan];

/**
 * Pipeline Step 2: Apply longevity discount based on subscription duration.
 * @param {number} rate
 * @param {number} months
 * @returns {number}
 */
const applyLongevityDiscount = (rate, months) => {
  const matchedRule = LONGEVITY_RULES.find((rule) => months > rule.minMonths);
  const multiplier = matchedRule ? matchedRule.multiplier : 1.0;
  return rate * multiplier;
};

/**
 * Pipeline Step 3: Apply promotional voucher strategy if present.
 * @param {number} rate
 * @param {string|null|undefined} voucher
 * @returns {number}
 * @throws {InvalidVoucherError}
 */
const applyVoucherDeduction = (rate, voucher) => {
  if (voucher === null || voucher === undefined) {
    return rate;
  }

  if (typeof voucher !== 'string' || !Object.prototype.hasOwnProperty.call(VOUCHER_STRATEGIES, voucher)) {
    throw new InvalidVoucherError(`Invalid or expired voucher: ${voucher}`);
  }

  return VOUCHER_STRATEGIES[voucher](rate);
};

/**
 * Pipeline Step 4: Enforce $0.00 floor and half-up rounding to two decimal places.
 * @param {number} rate
 * @returns {number}
 */
const applyFloorAndRounding = (rate) => {
  const floored = Math.max(0.00, rate);
  return Math.round((floored + Number.EPSILON) * 100) / 100;
};

/**
 * Subscription Pricing Service
 * Orchestrates subscription pricing calculations across a functional pipeline.
 */
export class SubscriptionPricingService {
  /**
   * Calculates the final rate for a subscription plan using a functional pipeline.
   *
   * Pipeline flow:
   *   resolveBaseRate -> applyLongevityDiscount -> applyVoucherDeduction -> applyFloorAndRounding
   *
   * @param {string} plan - Subscription plan ('BASIC', 'PRO', 'ENTERPRISE')
   * @param {number} [months=0] - Active subscription longevity in months
   * @param {string|null} [voucher=null] - Voucher code ('SAVE20', 'HALFPRICE', or null)
   * @returns {number} Final calculated rate rounded to two decimal places
   */
  calculatePrice(plan, months = 0, voucher = null) {
    const pipeline = [
      () => resolveBaseRate(plan),
      (rate) => applyLongevityDiscount(rate, months),
      (rate) => applyVoucherDeduction(rate, voucher),
      (rate) => applyFloorAndRounding(rate),
    ];

    return pipeline.reduce((currentRate, step) => step(currentRate), null);
  }
}
