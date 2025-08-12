# Complete WhatsApp API Testing Guide

## Prerequisites Checklist

Before testing, ensure you have:
- ✅ Webhook deployed to Netlify
- ✅ Environment variables set in Netlify
- ✅ Phone Number ID from Facebook
- ✅ Test phone number added in Facebook
- ✅ Access token (System User or regular)

## Test 1: Webhook Verification

### Purpose
Verify the webhook is properly configured and responding

### Test Command
```bash
curl "https://dtc-webhook.netlify.app/webhook?hub.mode=subscribe&hub.verify_token=AkqMBZAI4JZCg9mAHwBBxKL9J8G8L0H7S3OL3pK8ha3GhqAo81gplkzaqw&hub.challenge=test123"
```

### Expected Response
```
test123
```

### Status
✅ If returns `test123` - Webhook verification working
❌ If returns `Forbidden` - Check WEBHOOK_VERIFY_TOKEN in Netlify

## Test 2: Send Test Template Message

### Purpose
Send your first WhatsApp message using the hello_world template

### Get Your Phone Number ID
1. Go to https://developers.facebook.com
2. Select your app > WhatsApp > API Setup
3. Copy the Phone number ID (15-17 digits)

### Test Command
```bash
curl -X POST "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "YOUR_TEST_PHONE_NUMBER",
    "type": "template",
    "template": {
      "name": "hello_world",
      "language": {
        "code": "en_US"
      }
    }
  }'
```

### Expected Response
```json
{
  "messaging_product": "whatsapp",
  "contacts": [{
    "input": "YOUR_PHONE_NUMBER",
    "wa_id": "YOUR_PHONE_NUMBER"
  }],
  "messages": [{
    "id": "wamid.XXXXX"
  }]
}
```

### Verification
- Check WhatsApp on the test phone for the message
- Check Netlify Functions logs for status updates

## Test 3: Receive a Message

### Purpose
Test that your webhook receives messages correctly

### Steps
1. Send a WhatsApp message TO your business number
2. Check Netlify Functions logs immediately

### View Logs
1. Go to Netlify Dashboard
2. Functions tab > webhook
3. Look for "Received message" logs

### Expected Log Entry
```
Received message: {
  from: "27823456789",
  type: "text",
  text: "Your message here"
}
```

## Test 4: Two-Way Conversation

### Purpose
Test complete flow: receive and auto-reply

### Steps
1. Send "Hello" to your business number
2. Check if you receive auto-reply
3. Check Netlify logs for both events

### Expected Flow
1. Your message → WhatsApp Business
2. Webhook receives message
3. Webhook sends auto-reply
4. You receive reply on WhatsApp

## Test 5: Token Health Check

### Purpose
Verify your access token is valid and has correct permissions

### Test Command
```bash
curl -X GET "https://graph.facebook.com/v17.0/debug_token?input_token=YOUR_ACCESS_TOKEN&access_token=YOUR_ACCESS_TOKEN"
```

### Expected Response
```json
{
  "data": {
    "app_id": "YOUR_APP_ID",
    "type": "USER" or "SYSTEM",
    "is_valid": true,
    "scopes": [
      "whatsapp_business_messaging",
      "whatsapp_business_management"
    ]
  }
}
```

## Test 6: Send Regular Text Message

### Purpose
After template message, test regular text within 24-hour window

### Test Command
```bash
curl -X POST "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "YOUR_TEST_PHONE_NUMBER",
    "type": "text",
    "text": {
      "body": "This is a test message from the API!"
    }
  }'
```

## Quick Test Script

Create `test-all.sh`:

```bash
#!/bin/bash

# Configuration
PHONE_NUMBER_ID="YOUR_PHONE_NUMBER_ID"
ACCESS_TOKEN="YOUR_ACCESS_TOKEN"
TEST_PHONE="27823456789"  # Your test phone number
WEBHOOK_URL="https://dtc-webhook.netlify.app/webhook"
VERIFY_TOKEN="AkqMBZAI4JZCg9mAHwBBxKL9J8G8L0H7S3OL3pK8ha3GhqAo81gplkzaqw"

echo "🧪 Testing WhatsApp API Setup"
echo "=============================="

# Test 1: Webhook Verification
echo ""
echo "1️⃣ Testing Webhook Verification..."
VERIFY_RESPONSE=$(curl -s "${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=test123")
if [ "$VERIFY_RESPONSE" = "test123" ]; then
  echo "✅ Webhook verification: PASSED"
else
  echo "❌ Webhook verification: FAILED"
  echo "Response: $VERIFY_RESPONSE"
fi

# Test 2: Token Validation
echo ""
echo "2️⃣ Testing Token Validity..."
TOKEN_RESPONSE=$(curl -s "https://graph.facebook.com/v17.0/debug_token?input_token=${ACCESS_TOKEN}&access_token=${ACCESS_TOKEN}")
if echo "$TOKEN_RESPONSE" | grep -q '"is_valid":true'; then
  echo "✅ Token validation: PASSED"
else
  echo "❌ Token validation: FAILED"
  echo "$TOKEN_RESPONSE" | python3 -m json.tool
fi

# Test 3: Send Template Message
echo ""
echo "3️⃣ Sending Test Message..."
MSG_RESPONSE=$(curl -s -X POST "https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"messaging_product\": \"whatsapp\",
    \"to\": \"${TEST_PHONE}\",
    \"type\": \"template\",
    \"template\": {
      \"name\": \"hello_world\",
      \"language\": {
        \"code\": \"en_US\"
      }
    }
  }")

if echo "$MSG_RESPONSE" | grep -q '"id":"wamid'; then
  echo "✅ Message sending: PASSED"
  echo "$MSG_RESPONSE" | python3 -m json.tool
else
  echo "❌ Message sending: FAILED"
  echo "$MSG_RESPONSE" | python3 -m json.tool
fi

echo ""
echo "=============================="
echo "📊 Test Summary"
echo "=============================="
echo "✓ Check WhatsApp for received message"
echo "✓ Send a reply to test webhook reception"
echo "✓ Check Netlify Functions logs for activity"
```

## Troubleshooting Common Issues

### "Invalid phone number"
- Format: Country code + number (no + or 00)
- Example: `27823456789` not `+27823456789`

### "Template does not exist"
- Use `hello_world` for testing
- Check template name spelling

### "Token expired or invalid"
- Generate new token
- Check token has WhatsApp permissions

### "Number not registered"
- Add number as test number in Facebook
- Verify number with code

### No message received
- Check number is WhatsApp enabled
- Verify webhook is subscribed to messages
- Check Netlify logs for errors

## Success Indicators

✅ **Webhook**: Returns challenge correctly
✅ **Token**: Shows `is_valid: true`
✅ **Send**: Returns message ID
✅ **Receive**: Logs show incoming messages
✅ **Reply**: Auto-reply works
✅ **Logs**: No errors in Netlify Functions

## Next Steps After Testing

1. Add more test numbers (up to 5 free)
2. Create custom message templates
3. Implement business logic in webhook
4. Set up error monitoring
5. Plan for production deployment