#!/bin/bash

# Test POST request to webhook
WEBHOOK_URL=${1:-"https://dtc-webhook.netlify.app/webhook"}

echo "Testing POST request to: $WEBHOOK_URL"
echo ""

# Send test message
RESPONSE=$(curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d @test-message.json \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_BODY=$(echo "$RESPONSE" | sed -n '1,/^HTTP_STATUS:/p' | sed '$d')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)

echo "Response Status: $HTTP_STATUS"
echo "Response Body: $HTTP_BODY"

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Message received successfully!"
else
  echo "❌ Message processing failed!"
fi