#!/bin/bash

# Fixed script for sending WhatsApp messages
# The error "messaging_product is required" usually means the JSON isn't being sent

# Load environment variables
source ../utilities/load-env.sh

# Use environment variables
PHONE_NUMBER_ID="${PHONE_NUMBER_ID}"
ACCESS_TOKEN="${SYSTEM_USER_ACCESS_TOKEN}"
RECIPIENT="${1:-27823456789}"  # Can pass as argument or use default

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