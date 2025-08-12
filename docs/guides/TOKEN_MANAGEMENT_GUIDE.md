# WhatsApp Token Management Guide

## ⚠️ IMPORTANT: No Automatic Token Refresh

**The current system does NOT automatically refresh expired tokens.** When your System User token expires, the webhook will stop being able to send messages.

## Token Types and Expiration

### System User Tokens
- **Default Expiration**: 60 days
- **Never Expiring Option**: Available when generating
- **Recommended**: Always choose "Never" expiration when possible

### Regular User Tokens
- **Expiration**: 60-90 days
- **Not Recommended**: Use System User tokens instead

## Current Token Behavior

### What Happens When Token Expires

1. **Incoming Messages**: Still received (webhook continues working)
2. **Outgoing Messages**: FAIL with error "Session has expired"
3. **Dashboard**: Shows token expired error
4. **Auto-replies**: Stop working
5. **No Automatic Recovery**: Manual intervention required

### How to Check Token Expiration

#### Method 1: Dashboard
```
1. Go to https://dtc-webhook.netlify.app/test-dashboard.html
2. Click "Run Configuration Test"
3. Check "API Connectivity" result
   - Shows expiration date if token has one
   - Shows "Never expires" for permanent tokens
```

#### Method 2: Script
```bash
./scripts/testing/test-system-token.sh
```

#### Method 3: Facebook API
```bash
curl -X GET "https://graph.facebook.com/v17.0/debug_token?input_token=YOUR_TOKEN&access_token=YOUR_TOKEN"
```

## Manual Token Renewal Process

### Step 1: Generate New System User Token

1. Go to [Facebook Business Settings](https://business.facebook.com/settings)
2. Navigate to **Users** → **System Users**
3. Select your System User
4. Click **Generate New Token**
5. Select your app
6. **IMPORTANT**: Choose **"Never"** for expiration
7. Add permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
   - `business_management`
8. Generate and copy the token

### Step 2: Update in Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. **Site Settings** → **Environment Variables**
4. Update `SYSTEM_USER_ACCESS_TOKEN`
5. **CRITICAL**: Click **"Clear cache and deploy"**

### Step 3: Verify New Token

```bash
# Test locally
./scripts/testing/test-system-token.sh

# Test on dashboard
# Go to: https://dtc-webhook.netlify.app/test-dashboard.html
# Click "Clear Cache" then "Run Configuration Test"
```

## Monitoring Token Status

### Daily Check Script
Create a cron job or scheduled task:

```bash
#!/bin/bash
# check-token-daily.sh

source ./scripts/utilities/load-env.sh

RESPONSE=$(curl -s "https://graph.facebook.com/v17.0/debug_token?input_token=${SYSTEM_USER_ACCESS_TOKEN}&access_token=${SYSTEM_USER_ACCESS_TOKEN}")

if echo "$RESPONSE" | grep -q '"is_valid":false'; then
    echo "ALERT: Token is invalid!"
    # Send notification (email, Slack, etc.)
fi

EXPIRES_AT=$(echo "$RESPONSE" | grep -o '"expires_at":[0-9]*' | cut -d':' -f2)
if [ "$EXPIRES_AT" != "0" ]; then
    CURRENT_TIME=$(date +%s)
    DAYS_LEFT=$(( ($EXPIRES_AT - $CURRENT_TIME) / 86400 ))
    
    if [ $DAYS_LEFT -lt 7 ]; then
        echo "WARNING: Token expires in $DAYS_LEFT days!"
        # Send urgent notification
    fi
fi
```

### Set Up Monitoring Alerts

#### Option 1: Netlify Functions Log Monitoring
- Check function logs for "Session has expired" errors
- Set up alerts in your monitoring tool

#### Option 2: External Monitoring Service
```javascript
// Add to a monitoring service like UptimeRobot
// Check endpoint every hour
GET https://dtc-webhook.netlify.app/.netlify/functions/diagnostic

// Alert if response contains "expired" or "invalid"
```

## Best Practices

### 1. Use Never-Expiring Tokens
When generating System User tokens, ALWAYS choose "Never" for expiration if available.

### 2. Regular Validation
Check token status weekly:
```bash
# Add to weekly maintenance
./scripts/testing/test-system-token.sh
```

### 3. Keep Backup Token
1. Generate two System User tokens
2. Keep one as backup (don't use it)
3. If primary expires, switch immediately

### 4. Document Token Generation
Keep record of:
- Generation date
- Expiration date (if any)
- Permissions granted
- System User ID

### 5. Calendar Reminders
If token has expiration:
- Set reminder 14 days before expiry
- Set reminder 7 days before expiry
- Set reminder 1 day before expiry

## Token Refresh Automation (Future Enhancement)

### Why It's Not Automatic
Facebook/WhatsApp doesn't provide automatic token refresh for System Users because:
1. System User tokens can be set to never expire
2. Security best practice requires manual intervention
3. Prevents unauthorized token renewal

### Partial Automation Options

#### Option 1: Notification System
```javascript
// Add to webhook-enhanced.ts
async function checkTokenDaily() {
  const status = await checkTokenStatus();
  if (status.needsRefresh) {
    // Send email/Slack notification
    await sendNotification({
      subject: 'WhatsApp Token Expiring Soon',
      message: `Token expires in ${status.daysRemaining} days`
    });
  }
}
```

#### Option 2: Grace Period Handling
```javascript
// Store backup token in separate env variable
const PRIMARY_TOKEN = process.env.SYSTEM_USER_ACCESS_TOKEN;
const BACKUP_TOKEN = process.env.BACKUP_ACCESS_TOKEN;

// Switch to backup if primary fails
async function getActiveToken() {
  if (await isTokenValid(PRIMARY_TOKEN)) {
    return PRIMARY_TOKEN;
  }
  console.error('Primary token failed, switching to backup');
  return BACKUP_TOKEN;
}
```

## Emergency Token Replacement

If token expires unexpectedly:

### Immediate Actions (5 minutes)
1. Generate new System User token (choose "Never" expiry)
2. Update in Netlify environment variables
3. Clear cache and redeploy
4. Test with dashboard

### Quick Commands
```bash
# 1. Test if token is working
curl -X GET "https://graph.facebook.com/v17.0/debug_token?input_token=NEW_TOKEN&access_token=NEW_TOKEN"

# 2. Update in Netlify (via UI or CLI)
netlify env:set SYSTEM_USER_ACCESS_TOKEN "NEW_TOKEN"

# 3. Redeploy
netlify deploy --prod

# 4. Verify
./scripts/testing/test-system-token.sh
```

## Token Security

### Never Share Tokens
- Don't put in code
- Don't put in documentation  
- Don't share in messages
- Only store in Netlify environment variables

### Rotate Regularly
Even "never expiring" tokens should be rotated:
- Every 6 months for security
- Immediately if exposed
- After team member leaves

### Monitor Usage
Check for unusual activity:
1. Facebook Business Manager → System Users
2. View token usage logs
3. Check for unexpected API calls

## Summary

| Issue | Current Behavior | Required Action |
|-------|-----------------|-----------------|
| Token Expires | Webhook fails silently | Manual renewal required |
| No Warning | No advance notification | Check manually/set reminders |
| No Auto-Refresh | Not implemented | Must generate new token |
| No Fallback | Single token only | Consider backup token |

## Recommendations

1. **Immediate**: Generate a never-expiring System User token
2. **Weekly**: Run token validation check
3. **Monthly**: Review token usage in Facebook
4. **Quarterly**: Rotate tokens for security
5. **Always**: Keep documentation updated with token generation date