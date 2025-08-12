#!/bin/bash

# Load environment variables
source ./load-env.sh

# Test the production webhook verification
WEBHOOK_URL="https://dtc-webhook.netlify.app/webhook"
VERIFY_TOKEN="${WEBHOOK_VERIFY_TOKEN}"

echo "Testing webhook verification at: $WEBHOOK_URL"
echo "Using token: $VERIFY_TOKEN"
echo ""

# Test verification request
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  "${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=test-challenge-12345")

HTTP_BODY=$(echo "$RESPONSE" | sed -n '1,/^HTTP_STATUS:/p' | sed '$d')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)

echo "Response Status: $HTTP_STATUS"
echo "Response Body: $HTTP_BODY"
echo ""

if [ "$HTTP_STATUS" = "200" ] && [ "$HTTP_BODY" = "test-challenge-12345" ]; then
  echo "✅ Webhook verification WORKING!"
  echo ""
  echo "The webhook is correctly configured."
  echo "Use this exact token in Facebook: $VERIFY_TOKEN"
else
  echo "❌ Webhook verification FAILED!"
  echo ""
  echo "Possible issues:"
  echo "1. Environment variable WEBHOOK_VERIFY_TOKEN not set in Netlify"
  echo "2. Deployment not updated after adding environment variables"
  echo "3. Token mismatch"
  echo ""
  echo "To fix:"
  echo "1. Go to Netlify Dashboard > Site Settings > Environment Variables"
  echo "2. Add: WEBHOOK_VERIFY_TOKEN = $VERIFY_TOKEN"
  echo "3. Trigger a new deployment"
fi