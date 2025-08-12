#!/bin/bash

# Security check script - Run before committing
# Checks for potential sensitive data in staged files

echo "🔒 Security Check - Scanning for sensitive data..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if any issues found
ISSUES_FOUND=0

# Check if .env is staged
echo -n "Checking for .env files in staging... "
if git diff --cached --name-only | grep -E "^\.env$|^\.env\.|env\.sh|secrets\.|credentials\." > /dev/null; then
    echo -e "${RED}❌ FOUND${NC}"
    echo "  Warning: Found environment files in staging:"
    git diff --cached --name-only | grep -E "^\.env$|^\.env\.|env\.sh|secrets\.|credentials\."
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✅ Clear${NC}"
fi

# Check for Facebook/WhatsApp tokens
echo -n "Checking for access tokens... "
if git diff --cached | grep -E "EAAL[A-Za-z0-9]{100,}" > /dev/null; then
    echo -e "${RED}❌ FOUND${NC}"
    echo "  Warning: Possible Facebook/WhatsApp access token detected"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✅ Clear${NC}"
fi

# Check for common secret patterns
echo -n "Checking for secret keywords... "
PATTERNS="(api[_-]?key|api[_-]?secret|access[_-]?token|auth[_-]?token|private[_-]?key|secret[_-]?key)"
if git diff --cached | grep -iE "$PATTERNS\s*=\s*['\"][^'\"]{20,}" > /dev/null; then
    echo -e "${YELLOW}⚠️  SUSPICIOUS${NC}"
    echo "  Warning: Found potential secrets. Please review:"
    git diff --cached | grep -iE "$PATTERNS" | head -5
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✅ Clear${NC}"
fi

# Check for hardcoded phone numbers (that look like real numbers)
echo -n "Checking for phone numbers... "
if git diff --cached | grep -E "\+?[1-9][0-9]{9,14}" | grep -v "example\|test\|placeholder\|YOUR_" > /dev/null; then
    echo -e "${YELLOW}⚠️  FOUND${NC}"
    echo "  Warning: Found potential phone numbers. Verify they're examples only"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✅ Clear${NC}"
fi

# Check for specific known secrets
echo -n "Checking for known secret values... "
KNOWN_SECRETS=(
    "AkqMBZAI4JZCg9mAHwBBxKL9J8G8"
    "de83282e3cc8d6095d25792422fe04cf"
    "718426688024411"
)

for secret in "${KNOWN_SECRETS[@]}"; do
    if git diff --cached | grep -F "$secret" > /dev/null; then
        echo -e "${RED}❌ CRITICAL${NC}"
        echo "  STOP: Found known secret value: ${secret:0:10}..."
        ISSUES_FOUND=2
        break
    fi
done

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ Clear${NC}"
fi

# Check for private keys
echo -n "Checking for private keys... "
if git diff --cached --name-only | grep -E "\.(pem|key|p12|pfx|crt|cer)$" > /dev/null; then
    echo -e "${RED}❌ FOUND${NC}"
    echo "  Warning: Found potential private key files:"
    git diff --cached --name-only | grep -E "\.(pem|key|p12|pfx|crt|cer)$"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✅ Clear${NC}"
fi

echo ""
echo "================================================"

# Summary
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Safe to commit.${NC}"
    exit 0
elif [ $ISSUES_FOUND -eq 2 ]; then
    echo -e "${RED}❌ CRITICAL: Known secrets detected!${NC}"
    echo ""
    echo "DO NOT COMMIT! Remove sensitive data first:"
    echo "  git reset HEAD <file>"
    echo "  # Edit file to remove secrets"
    echo "  git add <file>"
    echo ""
    echo "Then run this check again."
    exit 1
else
    echo -e "${YELLOW}⚠️  Potential issues found. Please review carefully.${NC}"
    echo ""
    echo "If these are false positives (e.g., example values), you can proceed."
    echo "If real secrets, remove them before committing:"
    echo "  git reset HEAD <file>"
    echo ""
    echo "Run with --force to skip this check (NOT RECOMMENDED)"
    exit 1
fi