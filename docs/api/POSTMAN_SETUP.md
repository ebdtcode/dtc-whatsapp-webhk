# Postman Configuration for WhatsApp Webhook Testing

## GET Request - Webhook Verification

**URL:** `https://dtc-webhook.netlify.app/webhook`

**Method:** GET

**Query Parameters:**
- `hub.mode`: `subscribe`
- `hub.verify_token`: `YOUR_WEBHOOK_VERIFY_TOKEN`
- `hub.challenge`: `test123`

**Expected Response:** `test123` (plain text)

## POST Request - Message Testing

**URL:** `https://dtc-webhook.netlify.app/webhook`

**Method:** POST

**Headers:**
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123456789",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15551234567",
              "phone_number_id": "12405166565"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Test User"
                },
                "wa_id": "15551234567"
              }
            ],
            "messages": [
              {
                "from": "15551234567",
                "id": "wamid.test123",
                "timestamp": "1669233778",
                "type": "text",
                "text": {
                  "body": "Hello from Postman!"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

**Expected Response:** `OK` with Status 200

## Postman Setup Steps

1. **Create New Request**
   - Click "New" > "HTTP Request"

2. **For GET (Verification)**:
   - Method: GET
   - URL: `https://dtc-webhook.netlify.app/webhook`
   - Go to "Params" tab
   - Add the query parameters listed above

3. **For POST (Message)**:
   - Method: POST  
   - URL: `https://dtc-webhook.netlify.app/webhook`
   - Go to "Headers" tab
   - Add: `Content-Type: application/json`
   - Go to "Body" tab
   - Select "raw"
   - Select "JSON" from dropdown
   - Paste the JSON body above

## Common Issues

### "No body provided"
- Make sure Body tab is set to "raw"
- Ensure "JSON" is selected from dropdown
- Check that JSON is valid (no syntax errors)

### 403 Forbidden
- For GET requests: Verify token must match environment variable
- For POST requests: Signature verification may be failing

### 404 Not Found
- Check URL is correct: `https://dtc-webhook.netlify.app/webhook`
- Ensure function is deployed

## Testing with cURL

Instead of Postman, you can use the provided test scripts:

```bash
# Test GET (verification)
curl "https://dtc-webhook.netlify.app/webhook?hub.mode=subscribe&hub.verify_token=YOUR_WEBHOOK_VERIFY_TOKEN&hub.challenge=test123"

# Test POST (message)
cd dtc-webhook
./test-post.sh
```

## View Logs

Check Netlify Functions logs to see:
- Request received
- Processing details
- Any errors

Go to: Netlify Dashboard > Functions > webhook > View logs