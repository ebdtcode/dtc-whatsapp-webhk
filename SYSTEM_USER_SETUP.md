# System User Setup for Production WhatsApp API

## Why System User?

Based on Facebook's documentation, **System Users** are the best choice for production webhooks because:
- ✅ Long-lived tokens (60+ days)
- ✅ No manual intervention needed
- ✅ Can be automated
- ✅ Proper for server-to-server communication
- ✅ More secure than user tokens

## Step-by-Step Setup

### 1. Create a System User

1. Go to **Meta Business Suite**: https://business.facebook.com
2. Click **Settings** (gear icon)
3. Navigate to **Business settings** > **Users** > **System users**
4. Click **Add** > **Create System User**
5. Enter:
   - **Name**: `DTC WhatsApp Webhook Bot`
   - **Role**: Select `Admin` for full access
6. Click **Create System User**

### 2. Assign Assets to System User

1. Select your new System User
2. Click **Add Assets**
3. Assign:
   - **Apps**: Select your WhatsApp app
   - **WhatsApp Accounts**: Select your WhatsApp Business Account
   - Permissions needed:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management` 
     - `business_management`

### 3. Generate System User Token

1. Select your System User
2. Click **Generate New Token**
3. Select your app
4. Choose permissions:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
   - ✅ `business_management`
   - ✅ `pages_messaging` (if using Facebook pages)
5. Token expiration: Choose **60 days** (or Never Expire if available)
6. Click **Generate Token**
7. **SAVE THE TOKEN** - you won't see it again!

### 4. Add to Netlify Environment Variables

Add these to your Netlify environment variables:

```
SYSTEM_USER_ACCESS_TOKEN=<your-system-user-token>
APP_ID=<your-app-id>
APP_SECRET=<your-app-secret>
ADMIN_SECRET=<create-a-random-secret-for-admin-access>
```

### 5. Update Webhook to Use System User Token

The webhook has been updated to use `SYSTEM_USER_ACCESS_TOKEN` instead of the regular `ACCESS_TOKEN`.

## Token Management

### Check Token Status

```bash
curl -X GET "https://dtc-webhook.netlify.app/.netlify/functions/token-manager" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

### Refresh Token Before Expiration

System User tokens last 60 days. Set a reminder to refresh every 50 days:

1. Go back to System Users in Business Settings
2. Select your System User
3. Click **Generate New Token**
4. Update in Netlify environment variables
5. Redeploy

## Automated Token Refresh (Optional)

For fully automated token management:

1. Use Facebook's OAuth flow
2. Store refresh token securely
3. Auto-refresh before expiration
4. Send alerts when manual action needed

## Security Best Practices

1. **Never commit tokens** to Git
2. **Use environment variables** only
3. **Rotate tokens** regularly (every 50 days)
4. **Monitor token usage** via Facebook Developer Console
5. **Set up alerts** for token expiration
6. **Limit permissions** to only what's needed

## Troubleshooting

### "Token has expired"
- Generate new token from System Users page
- Update Netlify environment variable
- Redeploy

### "Invalid OAuth access token"
- Check token is from System User, not regular user
- Verify token has correct permissions
- Ensure token hasn't been revoked

### "Insufficient permission"
- Add missing permissions to System User
- Regenerate token with new permissions

## Benefits Over User Tokens

| Feature | User Token | System User Token |
|---------|------------|-------------------|
| Lifespan | 1-2 hours | 60+ days |
| Auto-refresh | No | Yes (with setup) |
| Manual intervention | Frequent | Minimal |
| Production ready | No | Yes |
| Server-to-server | Limited | Optimized |

## Next Steps

1. Create System User ✓
2. Generate token ✓  
3. Add to Netlify ✓
4. Test webhook ✓
5. Set reminder for token refresh (50 days)
6. Monitor token health via `/token-manager` endpoint