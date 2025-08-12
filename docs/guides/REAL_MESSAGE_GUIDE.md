# Sending Real WhatsApp Messages

## Important: Webhook vs API

- **Webhook** (`/webhook`): RECEIVES messages from WhatsApp
- **WhatsApp API** (`graph.facebook.com`): SENDS messages to WhatsApp

Your webhook at `dtc-webhook.netlify.app/webhook` only receives incoming messages. To send real messages, use the WhatsApp Cloud API directly.

## Method 1: Using Script

```bash
cd dtc-webhook
./send-real-message.sh 27823456789
```

Replace `27823456789` with the actual recipient number.

## Method 2: Using Postman

### Send Template Message (Required for New Conversations)

**URL:** `https://graph.facebook.com/v17.0/12405166565/messages`

**Method:** POST

**Headers:**
```
Authorization: Bearer EAAL3XBJiLL8BPLVcvdZAZCoi2UQZYOUR_WEBHOOK_VERIFY_TOKENL0H7S3OL3pK8ha3Vxth74zfttWDp0V14ybRSfsQVLCnCDHTAZBKTbVnXVOM8gCpCGSEjVfdhhl59IbZCN1XVtP53c4TDfABwCGRE8Y5QzttqBX3HfFB5ZCBICNi9LnuRQAdGZCGTC665khF1d06xyfSPofKlFnYOZC9vHilOj5cuXIBdEEtZBfQc2ZAscRPKXJ5dMEIZD
Content-Type: application/json
```

**Body:**
```json
{
  "messaging_product": "whatsapp",
  "to": "27823456789",
  "type": "template",
  "template": {
    "name": "hello_world",
    "language": {
      "code": "en_US"
    }
  }
}
```

### Send Text Message (After Template)

Same URL and headers, different body:

```json
{
  "messaging_product": "whatsapp",
  "to": "27823456789",
  "type": "text",
  "text": {
    "body": "Your custom message here"
  }
}
```

## Phone Number Requirements

1. **Format**: Country code + number (no + or 00)
   - ✅ Correct: `27823456789`
   - ❌ Wrong: `+27823456789` or `0823456789`

2. **Recipient must have WhatsApp installed**

3. **For testing**: Add number as test number in Facebook Developer Console
   - Go to WhatsApp > API Setup
   - Add phone number to test numbers
   - Generate verification code

## Message Flow

1. **First Contact**: Must use approved template message
2. **24-Hour Window**: After user responds, you can send regular messages for 24 hours
3. **Session Expired**: After 24 hours, must use template again

## Test Numbers Setup

1. Go to [Facebook Developer Console](https://developers.facebook.com)
2. Select your app
3. WhatsApp > API Setup
4. Add test phone numbers (up to 5)
5. These numbers can receive messages without charges

## Verify Message Delivery

1. **Check API Response**: Look for message ID
2. **Check WhatsApp**: Message should appear immediately
3. **Check Webhook**: Status updates come to your webhook

## Common Issues

### "Invalid parameter"
- Check phone number format
- Ensure number has WhatsApp

### "Message undeliverable" 
- Number might be blocked
- Template not approved
- Outside 24-hour window

### "Token invalid"
- Access token expired
- Generate new token in Facebook Developer Console

## Success Response Example

```json
{
  "messaging_product": "whatsapp",
  "contacts": [{
    "input": "27823456789",
    "wa_id": "27823456789"
  }],
  "messages": [{
    "id": "wamid.HBgNMjc4MjM0NTY3ODkVAgARGBI2QkVFNTQ3MzI5NjlGNjRGNDIA"
  }]
}
```

The `id` field confirms the message was accepted for delivery.