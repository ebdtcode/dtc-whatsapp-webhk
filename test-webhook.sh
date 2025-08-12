#!/bin/bash

# Test webhook verification locally
# Usage: ./test-webhook.sh <your-verify-token>

VERIFY_TOKEN=${1:-"test-token"}
WEBHOOK_URL="http://localhost:8888/webhook"

echo "Testing webhook verification..."
echo "URL: $WEBHOOK_URL"
echo "Token: $VERIFY_TOKEN"
echo ""

# Test verification request
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  "$WEBHOOK_URL?hub.mode=subscribe&hub.verify_token=$VERIFY_TOKEN&hub.challenge=test-challenge-123")

HTTP_BODY=$(echo "$RESPONSE" | sed -n '1,/^HTTP_STATUS:/p' | sed '$d')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)

echo "Response Status: $HTTP_STATUS"
echo "Response Body: $HTTP_BODY"

if [ "$HTTP_STATUS" = "200" ] && [ "$HTTP_BODY" = "test-challenge-123" ]; then
  echo "✅ Webhook verification successful!"
else
  echo "❌ Webhook verification failed!"
fi