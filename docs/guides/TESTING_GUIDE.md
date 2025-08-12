# WhatsApp Cloud API Testing Guide

## Current Status
- ✅ Webhook deployed and verified on Netlify
- ✅ System User token is valid with proper permissions  
- ⚠️ Phone Number ID needs to be obtained from Facebook Developer Console

## Quick Test Commands

### 1. Test Webhook Verification
```bash
./scripts/testing/test-production-webhook.sh
```
Expected: "✅ Webhook verification WORKING!"

### 2. Test System User Token
```bash
./scripts/testing/test-system-token.sh
```
Expected: Token valid with WhatsApp permissions

### 3. Test Dashboard
Open in browser:
```
https://dtc-webhook.netlify.app/test-dashboard.html
```

## Getting Your Phone Number ID

1. Go to [Facebook Developer Console](https://developers.facebook.com/apps/)
2. Select your app: **Daytocode Event Pictures**
3. Click **WhatsApp** in the left menu
4. Click **API Setup** or **Getting Started**
5. Find the section showing:
   - Test number (e.g., +1 555 025 3483)
   - **Phone number ID** (15-17 digit number)
6. Copy the Phone Number ID

## Update Configuration

### Update Local .env
```bash
# Edit .env file
PHONE_NUMBER_ID=YOUR_ACTUAL_PHONE_NUMBER_ID_HERE
```

### Update Netlify Environment Variables
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select **dtc-webhook** site
3. Go to **Site settings** → **Environment variables**
4. Update:
   - `PHONE_NUMBER_ID` = Your actual Phone Number ID
   - `SYSTEM_USER_ACCESS_TOKEN` = Your current token
   - `WEBHOOK_VERIFY_TOKEN` = YOUR_WEBHOOK_VERIFY_TOKEN
   - `APP_SECRET` = YOUR_APP_SECRET

## Testing Message Flow

### Step 1: Send Template Message (First Contact)
```bash
# Using curl
curl -X POST "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_SYSTEM_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "RECIPIENT_NUMBER",
    "type": "template",
    "template": {
      "name": "hello_world",
      "language": {"code": "en_US"}
    }
  }'
```

Or use the dashboard:
1. Select "Template (Hello World - First Contact Only)"
2. Enter recipient number
3. Send

### Step 2: Wait for Reply
The recipient must reply to open the 24-hour messaging window

### Step 3: Send Custom Messages
```bash
# Using curl
curl -X POST "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_SYSTEM_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "RECIPIENT_NUMBER",
    "type": "text",
    "text": {
      "body": "Your custom message here!"
    }
  }'
```

Or use the dashboard:
1. Select "Text Message (Your Custom Message)"
2. Enter your message
3. Send

## Test Numbers

### Register Test Numbers
1. Go to your app in Facebook Developer Console
2. WhatsApp → API Setup
3. Find "To" section
4. Click "Manage phone number list"
5. Add test numbers (must use real numbers you control)

### Important Notes
- Test numbers must be real WhatsApp accounts
- Can't be business numbers already connected to WhatsApp Business
- Must have WhatsApp installed
- Need access to receive messages for testing

## Troubleshooting

### "Phone Number ID does not exist"
- Get correct ID from Facebook Developer Console
- Update in both .env and Netlify

### "Session expired" error
- Token has expired, generate new System User token
- Update SYSTEM_USER_ACCESS_TOKEN in Netlify

### Messages not delivered
- Check recipient is registered test number
- Verify 24-hour window is open (recipient replied)
- Check WhatsApp is installed on recipient device

### Getting "Hello World" instead of custom message
- You selected "Template" instead of "Text Message"
- Use "Text Message" option for custom messages

## Dashboard Features

The test dashboard auto-loads credentials from Netlify and provides:
- Configuration testing
- Message sending (text, image, document, template)
- Webhook verification
- Full diagnostic tests
- Live message monitoring

Access at: https://dtc-webhook.netlify.app/test-dashboard.html

## Next Steps

1. Get Phone Number ID from Facebook Developer Console
2. Update PHONE_NUMBER_ID in Netlify environment variables
3. Register test numbers in Facebook app
4. Test template message flow
5. Test custom message within 24-hour window