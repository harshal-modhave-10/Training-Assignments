# Task 3: Local Pre-Commit Hook Setup

Your goal is to prevent `dummy-config.js` from being committed to the repository.

## Step 1: Create the Hook Script
create a local Git hook - `.git/hooks/pre-commit`

```
#!/bin/sh
# Simple Gitleaks / Secret Check Guard
if git diff --cached | grep -E "sk_live_[0-9a-zA-Z]{24}"; then
    echo "❌ COMMIT REJECTED: Hardcoded Stripe live key detected in staged diff!"
    exit 1
fi
```

## Step 2: Make it Executable
Grant execution permissions to the newly created hook script:
```
chmod +x .git/hooks/pre-commit
```

##  Step 3: Test the Guardrail (Verification Phase)
Try to commit the dummy config file:

```
git add 03-pre-commit-guardrails/dummy-config.js
git commit -m "Add production config"
```

- Expected Outcome: Git should intercept your commit, display the ❌ COMMIT REJECTED error message, and abort the commit.
- Deliverable: Take a screenshot of your terminal showing this rejection output.

## Step 4: Sanitize the Dummy Config File (Remediation Phase)
Now that you have verified the safety hook works, correct dummy-config.js to use an environment variable placeholder instead of a hardcoded key.
- Open 03-pre-commit-guardrails/dummy-config.js.
- Replace the hardcoded string with an environment variable reference:
```

const stripeConfig = {
    mode: 'production',
    // ✅ SAFELY SANITIZED: Key loaded securely from environment variable
    apiKey: process.env.STRIPE_SECRET_KEY || "PLACEHOLDER_SET_IN_ENV"
};

module.exports = stripeConfig;
```
- Stage the sanitized file and commit again:

```
git add 03-pre-commit-guardrails/dummy-config.js
git commit -m "fix(config): sanitize stripe secret key to use environment variables"
```

- Expected Outcome: The pre-commit hook will scan the diff, detect no live keys, and allow the commit to succeed!