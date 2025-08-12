# Git Hooks

## Installation

To enable automatic security checks before commits:

```bash
# Install the pre-commit hook
cp .githooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## What It Does

The pre-commit hook automatically runs security checks before each commit:
- Scans for access tokens
- Checks for API secrets
- Detects private keys
- Prevents committing .env files

## Bypass (Emergency Only)

If you absolutely need to bypass the check:
```bash
git commit --no-verify
```

⚠️ **WARNING**: Only bypass if you're 100% sure no sensitive data is being committed!