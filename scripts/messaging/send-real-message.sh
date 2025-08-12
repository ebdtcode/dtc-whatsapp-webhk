#!/bin/bash

# Send a real WhatsApp message using the WhatsApp Cloud API
# Usage: ./send-real-message.sh <recipient_number>

# Load environment variables
source ../utilities/load-env.sh

RECIPIENT=${1:-"27823456789"}  # Replace with actual number
ACCESS_TOKEN="${SYSTEM_USER_ACCESS_TOKEN}"
PHONE_NUMBER_ID="${PHONE_NUMBER_ID}"

echo "Sending WhatsApp message to: $RECIPIENT"
echo ""

# First, try sending a template message (required for new conversations)
echo "Attempting to send template message..."
RESPONSE=$(curl -s -X POST \
  "https://graph.facebook.com/v17.0/$PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"messaging_product\": \"whatsapp\",
    \"to\": \"$RECIPIENT\",
    \"type\": \"template\",
    \"template\": {
      \"name\": \"hello_world\",
      \"language\": {
        \"code\": \"en_US\"
      }
    }
  }")

echo "Response:"
echo "$RESPONSE" | python3 -m json.tool

# Check if message was sent successfully
if echo "$RESPONSE" | grep -q "\"id\""; then
  echo ""
  echo "✅ Template message sent successfully!"
  echo ""
  echo "Now sending follow-up text message..."
  
  # Wait a moment before sending follow-up
  sleep 2
  
  # Send regular text message
  RESPONSE2=$(curl -s -X POST \
    "https://graph.facebook.com/v17.0/$PHONE_NUMBER_ID/messages" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"messaging_product\": \"whatsapp\",
      \"to\": \"$RECIPIENT\",
      \"type\": \"text\",
      \"text\": {
        \"body\": \"This is a test message from DTC webhook system. Time: $(date)\"
      }
    }")
  
  echo "Follow-up message response:"
  echo "$RESPONSE2" | python3 -m json.tool
  
  if echo "$RESPONSE2" | grep -q "\"id\""; then
    echo ""
    echo "✅ Text message sent successfully!"
  fi
else
  echo ""
  echo "❌ Failed to send message"
  echo "Common issues:"
  echo "1. Number must include country code without + (e.g., 27823456789)"
  echo "2. Recipient must have WhatsApp installed"
  echo "3. Check if number is in correct format"
  echo "4. For testing, add number as test number in Facebook Developer Console"
fi