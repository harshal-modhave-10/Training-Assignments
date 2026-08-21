const stripeConfig = {
    mode: 'production',
    // ✅ SAFELY SANITIZED: Key loaded securely from environment variable
    apiKey: process.env.STRIPE_SECRET_KEY || "PLACEHOLDER_SET_IN_ENV"
};

module.exports = stripeConfig;
