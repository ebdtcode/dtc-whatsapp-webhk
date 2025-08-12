# Send WhatsApp Message via Postman

## Postman Configuration

### Request Details

**Method:** POST

**URL:** `https://graph.facebook.com/v17.0/12405166565/messages`

### Headers
- `Authorization`: Bearer EAAL3XBJiLL8BPLVcvdZAZCoi2UQZAkqMBZAI4JZCg9mAHwBBxKL9J8G8L0H7S3OL3pK8ha3Vxth74zfttWDp0V14ybRSfsQVLCnCDHTAZBKTbVnXVOM8gCpCGSEjVfdhhl59IbZCN1XVtP53c4TDfABwCGRE8Y5QzttqBX3HfFB5ZCBICNi9LnuRQAdGZCGTC665khF1d06xyfSPofKlFnYOZC9vHilOj5cuXIBdEEtZBfQc2ZAscRPKXJ5dMEIZD
- `Content-Type`: application/json

### Body (raw JSON)
```json
{
  "messaging_product": "whatsapp",
  "to": "27123456789",
  "type": "text",
  "text": {
    "body": "Hello! This is a test message from DTC webhook."
  }
}
```

## Setup Steps in Postman

1. **Create New Request**
   - Click "New" > "HTTP Request"

2. **Configure Request**
   - Set Method to: POST
   - Enter URL: `https://graph.facebook.com/v17.0/12405166565/messages`

3. **Add Headers**
   - Go to "Headers" tab
   - Add:
     - Key: `Authorization`
     - Value: `Bearer EAAL3XBJiLL8BPLVcvdZAZCoi2UQZAkqMBZAI4JZCg9mAHwBBxKL9J8G8L0H7S3OL3pK8ha3Vxth74zfttWDp0V14ybRSfsQVLCnCDHTAZBKTbVnXVOM8gCpCGSEjVfdhhl59IbZCN1XVtP53c4TDfABwCGRE8Y5QzttqBX3HfFB5ZCBICNi9LnuRQAdGZCGTC665khF1d06xyfSPofKlFnYOZC9vHilOj5cuXIBdEEtZBfQc2ZAscRPKXJ5dMEIZD`
   - Add:
     - Key: `Content-Type`
     - Value: `application/json`

4. **Add Body**
   - Go to "Body" tab
   - Select "raw"
   - Select "JSON" from dropdown
   - Paste the JSON body and update the "to" field with your recipient's number

5. **Send Request**
   - Click "Send"

## Important Notes

### Phone Number Format
- Must include country code without + or 00
- Example: `27823456789` for South Africa (+27)
- Example: `1234567890` for USA (+1)

### Test Numbers
To test without sending to real numbers, use WhatsApp test numbers:
1. Go to WhatsApp > API Setup in Facebook Developer Console
2. Add test phone numbers
3. These numbers won't receive actual messages but API will return success

### Message Types

#### Text Message
```json
{
  "messaging_product": "whatsapp",
  "to": "27123456789",
  "type": "text",
  "text": {
    "body": "Your message here"
  }
}
```

#### Template Message (for initial contact)
```json
{
  "messaging_product": "whatsapp",
  "to": "27123456789",
  "type": "template",
  "template": {
    "name": "hello_world",
    "language": {
      "code": "en_US"
    }
  }
}
```

#### Image Message
```json
{
  "messaging_product": "whatsapp",
  "to": "27123456789",
  "type": "image",
  "image": {
    "link": "https://example.com/image.jpg",
    "caption": "Optional caption"
  }
}
```

## Response

### Success Response
```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "27123456789",
      "wa_id": "27123456789"
    }
  ],
  "messages": [
    {
      "id": "wamid.XXX"
    }
  ]
}
```

### Error Response
```json
{
  "error": {
    "message": "Error description",
    "type": "OAuthException",
    "code": 190,
    "error_subcode": 2018001
  }
}
```

## Common Errors

1. **Invalid token** - Check ACCESS_TOKEN is correct
2. **Number not registered** - Recipient must have WhatsApp
3. **Template required** - For first message to new contact, use template
4. **Rate limit** - Too many messages sent

## Testing Script

Use the provided curl command:
```bash
curl -X POST "https://graph.facebook.com/v17.0/12405166565/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "27123456789",
    "type": "text",
    "text": {
      "body": "Test message"
    }
  }'
```