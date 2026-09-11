# Engineering Reflection: AI-Driven Test-Driven Development (TDD)

## 1. AI Acceleration: Rapid Scaffolding and Test Generation
Antigravity IDE significantly accelerated early project momentum by translating raw business specifications into structured test suites in seconds. Manually creating comprehensive test matrices for multiple subscription tiers, exact month boundaries (12, 13, 36, and 37 months), and compounding promotional vouchers is repetitive and error-prone. The AI eliminated this friction by rapidly scaffolding an ES Module Jest test harness, automating parameterization with `it.each`, and establishing clear descriptive naming conventions. It also streamlined repository setup—such as configuring environment files, `.gitignore`, and module dependencies—allowing engineering focus to shift immediately from boilerplate mechanics to core domain logic and architecture.

## 2. AI Limitations: Subtle Anti-Patterns and Weak Assertions
Despite rapid generation, the critical audit phase highlighted distinct AI limitations that demanded careful engineering review. Most notably, the initial generation exhibited a **tautological assertion**: it executed `Math.max(0.00, rate - 50.00)` inside the test body and asserted on its result, effectively testing JavaScript's native math runtime rather than the System Under Test (`SubscriptionPricingService`). 

Furthermore, the AI defaulted to several **weak assertions**:
- Loose inequalities like `toBeGreaterThanOrEqual(0.00)`, which would falsely pass even if discounts failed to apply or returned inflated values.
- Brittle string slicing (`.split('.')[1]?.length <= 2`) to verify decimal precision rather than asserting deterministic cent values (`toBe(18.75)`).
- Defensive conditionals (`if (typeof service.calculatePrice === 'function')`) that masked missing methods, alongside verbose `try / catch` blocks instead of strict `expect(() => ...).toThrow(InvalidVoucherError)`.

These anti-patterns create an illusion of high coverage while allowing regressions to escape silently, proving that AI-generated tests require rigorous auditing against strict verification standards.

## 3. TDD Value: Fearless Refactoring via Test Safety Nets
The true power of Test-Driven Development became evident during the transition from a naive implementation to a production-grade architecture. The original procedural implementation was refactored into a modern functional pipeline backed by immutable strategy maps (`BASE_RATES`, `VOUCHER_STRATEGIES`) and a declarative rule table (`LONGEVITY_RULES`). 

Because a robust, high-fidelity test suite was already locked in place, this structural overhaul was executed with complete confidence. When hardening the voucher strategy against prototype poisoning (e.g., rejecting injected keys like `"toString"` and `"valueOf"`), the tests immediately validated that the fix closed the vulnerability without regressing valid voucher deductions. The test harness transformed architectural refactoring from an anxiety-inducing exercise into a deterministic, verifiable process.

