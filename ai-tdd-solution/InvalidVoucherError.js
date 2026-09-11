export class InvalidVoucherError extends Error {
  constructor(message = 'Invalid or expired voucher') {
    super(message);
    this.name = 'InvalidVoucherError';
  }
}

