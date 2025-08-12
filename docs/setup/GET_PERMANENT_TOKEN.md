# How to Get a Permanent WhatsApp Access Token

## Option 1: System User Token (Best - Never Expires)

### Step 1: Create System User
1. Go to **Meta Business Suite**: https://business.facebook.com/settings
2. Navigate to **Users** → **System Users**
3. Click **Add** → **Create System User**
4. Name: `WhatsApp API Bot`
5. Role: **Admin**

### Step 2: Generate Permanent Token
1. Select your System User
2. Click **Generate New Token**
3. Select your app
4. **IMPORTANT**: For Token Expiration, select:
   - **Never** (if available)
   - Or **60 days** (maximum)
5. Select permissions:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
   - ✅ `business_management`
6. Click **Generate Token**
7. **SAVE THIS TOKEN** - It won't expire!

### Step 3: Add to Netlify
```bash
SYSTEM_USER_ACCESS_TOKEN=your_permanent_token_here
```

## Option 2: Long-Lived User Token (60 days)

### Get Long-Lived Token via Graph API Explorer

1. **Go to Graph API Explorer**:
   - https://developers.facebook.com/tools/explorer/

2. **Select Your App**:
   - Choose your WhatsApp app from dropdown

3. **Get User Token**:
   - Click "Generate Access Token"
   - Login if prompted

4. **Add Permissions**:
   - Add: `whatsapp_business_messaging`
   - Add: `whatsapp_business_management`
   - Click "Generate Access Token" again

5. **Exchange for Long-Lived Token**:
   ```bash
   curl -X GET "https://graph.facebook.com/v17.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN"
   ```

   This returns a token valid for 60 days.

## Option 3: Permanent Token via Business Login

### Use Business Integration System User

1. **Create Business Integration**:
   - Go to Business Settings
   - Click **Integrations** → **System Users**
   - Create new System User
   - Type: **Business** (not Employee)

2. **Assign Assets**:
   - Assign your WhatsApp Business Account
   - Assign your App
   - Grant all WhatsApp permissions

3. **Generate Token Without Expiration**:
   - Select System User
   - Click **Generate Token**
   - **DON'T select expiration** (leaves it permanent)
   - Copy token

## Option 4: App Access Token (For Some Operations)

### Generate App Token (Never Expires)
```bash
curl -X GET "https://graph.facebook.com/v17.0/oauth/access_token?client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&grant_type=client_credentials"
```

**Note**: App tokens have limited permissions and may not work for all WhatsApp operations.

## Option 5: Implement Auto-Refresh (Programmatic)

### Add to your webhook:

```typescript
// netlify/functions/refresh-token.ts
import { Handler } from '@netlify/functions';

const APP_ID = process.env.APP_ID!;
const APP_SECRET = process.env.APP_SECRET!;

export const handler: Handler = async (event) => {
  const currentToken = process.env.ACCESS_TOKEN!;
  
  // Exchange for new long-lived token
  const response = await fetch(
    `https://graph.facebook.com/v17.0/oauth/access_token?` +
    `grant_type=fb_exchange_token&` +
    `client_id=${APP_ID}&` +
    `client_secret=${APP_SECRET}&` +
    `fb_exchange_token=${currentToken}`
  );
  
  const data = await response.json();
  
  // Store new token (you'd need to update Netlify env var via API)
  return {
    statusCode: 200,
    body: JSON.stringify({
      newToken: data.access_token,
      expiresIn: data.expires_in,
      instructions: 'Update ACCESS_TOKEN in Netlify with this new token'
    })
  };
};
```

## Recommended Solution: System User

System Users are the best because:
- ✅ Tokens can be permanent (no expiration)
- ✅ Designed for server-to-server
- ✅ Not tied to personal Facebook account
- ✅ Can't be accidentally revoked by user logout
- ✅ Professional and secure

## Check Your Current Token Expiration

```bash
curl -X GET "https://graph.facebook.com/v17.0/debug_token?input_token=YOUR_TOKEN&access_token=YOUR_TOKEN"
```

Look for:
- `expires_at`: Unix timestamp of expiration (0 = never)
- `data_access_expires_at`: Data access expiration

## Make Token Permanent in Dashboard

Update your test dashboard to store token in Netlify:

1. Add token to Netlify Environment Variables
2. Update dashboard to read from backend:

```javascript
// In test-dashboard.html
async function getStoredToken() {
  try {
    const response = await fetch('/.netlify/functions/get-config');
    const data = await response.json();
    return data.accessToken;
  } catch {
    return localStorage.getItem('accessToken');
  }
}
```

## Quick Fix: Store Token in Netlify

Instead of entering token each time:

1. **Set in Netlify**:
   ```
   ACCESS_TOKEN=your_permanent_token
   ```

2. **Create config endpoint**:
   ```typescript
   // netlify/functions/get-config.ts
   export const handler = async () => ({
     statusCode: 200,
     body: JSON.stringify({
       accessToken: process.env.ACCESS_TOKEN,
       phoneNumberId: process.env.PHONE_NUMBER_ID
     })
   });
   ```

3. **Dashboard auto-loads token**:
   - No more manual entry
   - Token stored securely
   - Never expires with System User

## Summary

| Method | Duration | Best For |
|--------|----------|----------|
| System User | Never/60 days | Production (BEST) |
| Long-lived User | 60 days | Testing |
| App Token | Never | Limited operations |
| Auto-refresh | Continuous | Automation |

**Action Required**: Create a System User NOW and generate a permanent token!