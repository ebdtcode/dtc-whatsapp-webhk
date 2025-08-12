#!/bin/bash

# UPDATE THESE TWO VALUES!
PHONE_NUMBER_ID="YOUR_PHONE_NUMBER_ID"
ACCESS_TOKEN="YOUR_ACCESS_TOKEN"
RECIPIENT="27823456789"  # Phone to send to

# Create the JSON file
cat > image-message.json << EOF
{
  "messaging_product": "whatsapp",
  "to": "${RECIPIENT}",
  "type": "image",
  "image": {
    "link": "https://via.placeholder.com/600x400/4A90E2/FFFFFF?text=WhatsApp+Test+Image",
    "caption": "📸 Test Image Message\\n\\nThis message has both an image and text!\\n\\nTime: $(date '+%Y-%m-%d %H:%M:%S')"
  }
}
EOF

echo "Sending image message to ${RECIPIENT}..."
echo ""
echo "JSON being sent:"
cat image-message.json
echo ""
echo "Response:"

# Send using the JSON file
curl -X POST "https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d @image-message.json

echo ""
echo ""
echo "If you get 'messaging_product is required', check:"
echo "1. PHONE_NUMBER_ID is set correctly (not YOUR_PHONE_NUMBER_ID)"
echo "2. ACCESS_TOKEN is set correctly"
echo "3. Try using Postman instead with the exact JSON from image-message.json"