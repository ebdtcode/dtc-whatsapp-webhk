#!/bin/bash

# Test sending image message with caption

# Load environment variables
source ../utilities/load-env.sh

echo "Testing WhatsApp Image Message..."
echo "================================="
echo ""

# Check if phone number ID is set
if [ -z "$PHONE_NUMBER_ID" ] || [ "$PHONE_NUMBER_ID" = "718426688024411" ]; then
    echo "❌ Error: PHONE_NUMBER_ID not set correctly in .env"
    echo "Please update PHONE_NUMBER_ID with the value from Facebook Developer Console"
    exit 1
fi

# Prompt for recipient
echo -n "Enter recipient WhatsApp number (with country code, e.g., 27823456789): "
read RECIPIENT

# Use a public test image
IMAGE_URL="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png"
CAPTION="Test image from WhatsApp API - sent at $(date '+%Y-%m-%d %H:%M:%S')"

echo ""
echo "Sending image to: $RECIPIENT"
echo "Image URL: $IMAGE_URL"
echo "Caption: $CAPTION"
echo ""

# Create JSON payload
JSON_PAYLOAD=$(cat <<EOF
{
  "messaging_product": "whatsapp",
  "to": "$RECIPIENT",
  "type": "image",
  "image": {
    "link": "$IMAGE_URL",
    "caption": "$CAPTION"
  }
}
EOF
)

echo "Payload:"
echo "$JSON_PAYLOAD" | python3 -m json.tool
echo ""

# Send the request
echo "Sending request..."
RESPONSE=$(curl -s -X POST "https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages" \
  -H "Authorization: Bearer ${SYSTEM_USER_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$JSON_PAYLOAD")

echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if successful
if echo "$RESPONSE" | grep -q '"messages"'; then
    echo "✅ Image message sent successfully!"
    MESSAGE_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "Message ID: $MESSAGE_ID"
else
    echo "❌ Failed to send image message"
    
    # Parse error
    if echo "$RESPONSE" | grep -q '"error"'; then
        ERROR_MSG=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('error', {}).get('message', 'Unknown error'))" 2>/dev/null || echo "Could not parse error")
        echo "Error: $ERROR_MSG"
        echo ""
        echo "Common issues:"
        echo "1. Image URL must be publicly accessible (not localhost or private URLs)"
        echo "2. Image must be in supported format (JPEG, PNG)"
        echo "3. Image size must be under 5MB"
        echo "4. Recipient must be a registered test number"
        echo "5. You must have an active 24-hour window (recipient replied recently)"
    fi
fi