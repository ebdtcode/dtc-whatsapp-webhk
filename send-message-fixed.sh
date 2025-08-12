#!/bin/bash

# Fixed script for sending WhatsApp messages
# The error "messaging_product is required" usually means the JSON isn't being sent

# UPDATE THESE VALUES
PHONE_NUMBER_ID="YOUR_PHONE_NUMBER_ID"
ACCESS_TOKEN="YOUR_ACCESS_TOKEN"
RECIPIENT="27823456789"  # Phone number to send to (no + sign)

echo "Sending WhatsApp message..."
echo ""

# Method 1: Using a JSON file (most reliable)
cat > /tmp/whatsapp-message.json << EOF
{
  "messaging_product": "whatsapp",
  "to": "${RECIPIENT}",
  "type": "template",
  "template": {
    "name": "hello_world",
    "language": {
      "code": "en_US"
    }
  }
}
EOF

echo "JSON payload:"
cat /tmp/whatsapp-message.json
echo ""

# Send the message
echo "Sending..."
curl -X POST "https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d @/tmp/whatsapp-message.json

echo ""
echo ""

# Method 2: Direct JSON (with proper escaping)
echo "Alternative method - direct JSON:"
curl -X POST "https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  --data-raw '{
    "messaging_product": "whatsapp",
    "to": "'"${RECIPIENT}"'",
    "type": "template",
    "template": {
      "name": "hello_world",
      "language": {
        "code": "en_US"
      }
    }
  }'

echo ""
echo ""
echo "If you still get 'messaging_product is required' error, try:"
echo "1. Check that PHONE_NUMBER_ID is not empty"
echo "2. Verify ACCESS_TOKEN is valid"
echo "3. Use Postman with raw JSON body"