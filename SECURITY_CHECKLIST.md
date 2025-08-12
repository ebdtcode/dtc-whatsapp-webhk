# Security Checklist - CRITICAL

## ⚠️ BEFORE EVERY COMMIT

### 1. Check for Sensitive Data
```bash
# Search for tokens and secrets
grep -r "TOKEN\|SECRET\|KEY\|PASSWORD" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.env"

# Check for specific patterns
grep -r "EAAL" . --exclude-dir=node_modules --exclude="*.env"  # Facebook tokens
grep -r "whatsapp_business" . --exclude-dir=node_modules --exclude="*.env"

# Check git status for .env files
git status | grep -E "\.env"
```

### 2. Verify .gitignore
- [ ] `.env` is listed and NOT tracked
- [ ] `.env.*` files are excluded (except .env.example)
- [ ] No `*.key`, `*.pem`, `*.crt` files tracked
- [ ] No `secrets.json` or `credentials.json` tracked

### 3. Environment Variables
- [ ] All sensitive data in `.env` file only
- [ ] `.env.example` contains placeholders only
- [ ] No hardcoded tokens in code
- [ ] No real tokens in documentation

## 🔒 Security Rules

### NEVER Commit
1. **Access Tokens**
   - Facebook/WhatsApp tokens (start with `EAAL`)
   - System User tokens
   - Any Bearer tokens

2. **Secrets**
   - APP_SECRET
   - WEBHOOK_VERIFY_TOKEN (actual value)
   - API keys
   - Admin secrets

3. **Personal Data**
   - Real phone numbers (except test examples)
   - Real WhatsApp IDs
   - Customer data

4. **Credentials**
   - Database passwords
   - Service account credentials
   - Private keys/certificates

### ALWAYS Use
1. **Environment Variables**
   ```javascript
   // ✅ GOOD
   const token = process.env.ACCESS_TOKEN;
   
   // ❌ BAD
   const token = "EAAL3XBJiLL8...";
   ```

2. **Placeholder Values in Docs**
   ```markdown
   # ✅ GOOD
   WEBHOOK_VERIFY_TOKEN=YOUR_WEBHOOK_VERIFY_TOKEN
   
   # ❌ BAD
   WEBHOOK_VERIFY_TOKEN=AkqMBZAI4JZCg9mAHwBBxKL9J8G8
   ```

3. **Example Values Only**
   ```bash
   # ✅ GOOD
   curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   
   # ❌ BAD
   curl -H "Authorization: Bearer EAAL3XBJiLL8..."
   ```

## 🚨 If You Find Sensitive Data

### In Uncommitted Files
1. Remove the sensitive data
2. Move to environment variables
3. Update .gitignore if needed

### Already Committed
1. **DO NOT** just delete the file
2. **IMMEDIATE ACTION REQUIRED**:
   ```bash
   # Remove from history (requires force push)
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch PATH_TO_FILE" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. Rotate all exposed credentials immediately
4. Update all documentation

## 📋 Pre-Push Checklist

Before pushing to remote:

```bash
# 1. Check what will be pushed
git diff --staged

# 2. Verify no .env files
git ls-files | grep -E "\.env$"

# 3. Search for tokens
git diff --staged | grep -E "EAAL|SECRET|TOKEN|KEY"

# 4. Final check
git status
```

## 🔐 Netlify Environment Variables

Store these in Netlify Dashboard, NEVER in code:
- `WEBHOOK_VERIFY_TOKEN`
- `APP_SECRET`
- `PHONE_NUMBER_ID`
- `SYSTEM_USER_ACCESS_TOKEN`
- `APP_ID`
- `ADMIN_SECRET`

## 🛡️ Best Practices

1. **Rotate Regularly**
   - Change tokens every 60 days
   - Update immediately if exposed

2. **Use System Users**
   - Prefer System User tokens over personal tokens
   - Set appropriate permissions only

3. **Audit Access**
   - Review who has access to Netlify
   - Check Facebook app permissions

4. **Monitor Usage**
   - Check for unusual API calls
   - Monitor webhook logs

## ⚡ Quick Commands

### Check for secrets before commit
```bash
# Run this before EVERY commit
./scripts/utilities/check-secrets.sh
```

### Clean sensitive data from staged files
```bash
git reset HEAD .env
git reset HEAD *.key
git reset HEAD *.pem
```

### Verify clean repository
```bash
# Should return nothing
find . -name "*.env" -not -name "*.example" | grep -v node_modules
```

## 📞 If Exposed

If sensitive data is accidentally exposed:

1. **Immediately**:
   - Revoke the exposed token/secret
   - Generate new credentials
   - Update Netlify environment variables

2. **Within 1 hour**:
   - Audit access logs
   - Check for unauthorized usage
   - Notify team if needed

3. **Document**:
   - Record what was exposed
   - Note remediation steps taken
   - Update security procedures

---

**Remember**: It's better to be overly cautious with security than to expose sensitive data. When in doubt, use placeholders!