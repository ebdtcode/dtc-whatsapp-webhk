#!/bin/bash

# WhatsApp API Complete Test Suite

# Load environment variables
source ../utilities/load-env.sh

# Use environment variables with defaults
PHONE_NUMBER_ID="${PHONE_NUMBER_ID}"
ACCESS_TOKEN="${SYSTEM_USER_ACCESS_TOKEN}"
TEST_PHONE="${1:-27823456789}"  # Can pass as argument or use default
WEBHOOK_URL="https://dtc-webhook.netlify.app/webhook"
VERIFY_TOKEN="${WEBHOOK_VERIFY_TOKEN}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 WhatsApp API Complete Test Suite"
echo "===================================="
echo ""

# Check if configuration is updated
if [ "$PHONE_NUMBER_ID" = "YOUR_PHONE_NUMBER_ID" ]; then
  echo -e "${RED}❌ Please update PHONE_NUMBER_ID in this script first!${NC}"
  echo "Get it from: https://developers.facebook.com > Your App > WhatsApp > API Setup"
  exit 1
fi

if [ "$ACCESS_TOKEN" = "YOUR_ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Please update ACCESS_TOKEN in this script first!${NC}"
  exit 1
fi

# Test 1: Webhook Verification
echo "1️⃣  Testing Webhook Verification..."
echo "   URL: $WEBHOOK_URL"
VERIFY_RESPONSE=$(curl -s "${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=test-challenge-123")

if [ "$VERIFY_RESPONSE" = "test-challenge-123" ]; then
  echo -e "   ${GREEN}✅ Webhook verification: PASSED${NC}"
else
  echo -e "   ${RED}❌ Webhook verification: FAILED${NC}"
  echo "   Response: $VERIFY_RESPONSE"
  echo "   Check: WEBHOOK_VERIFY_TOKEN in Netlify environment variables"
fi

# Test 2: Token Validation
echo ""
echo "2️⃣  Validating Access Token..."
TOKEN_RESPONSE=$(curl -s "https://graph.facebook.com/v17.0/debug_token?input_token=${ACCESS_TOKEN}&access_token=${ACCESS_TOKEN}")

if echo "$TOKEN_RESPONSE" | grep -q '"is_valid":true'; then
  echo -e "   ${GREEN}✅ Token validation: PASSED${NC}"
  
  # Extract token details
  if echo "$TOKEN_RESPONSE" | grep -q '"type":"SYSTEM"'; then
    echo "   Token Type: System User (Recommended)"
  else
    echo "   Token Type: Regular User"
  fi
  
  # Check for WhatsApp permissions
  if echo "$TOKEN_RESPONSE" | grep -q 'whatsapp_business_messaging'; then
    echo "   ✓ Has WhatsApp messaging permission"
  else
    echo -e "   ${YELLOW}⚠ Missing whatsapp_business_messaging permission${NC}"
  fi
else
  echo -e "   ${RED}❌ Token validation: FAILED${NC}"
  echo "   Response:"
  echo "$TOKEN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$TOKEN_RESPONSE"
fi

# Test 3: Phone Number Verification
echo ""
echo "3️⃣  Verifying Phone Number ID..."
PHONE_RESPONSE=$(curl -s -X GET \
  "https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}?access_token=${ACCESS_TOKEN}")

if echo "$PHONE_RESPONSE" | grep -q '"id"'; then
  echo -e "   ${GREEN}✅ Phone Number ID: VALID${NC}"
  DISPLAY_NUMBER=$(echo "$PHONE_RESPONSE" | grep -o '"display_phone_number":"[^"]*' | cut -d'"' -f4)
  echo "   Business Number: $DISPLAY_NUMBER"
else
  echo -e "   ${RED}❌ Phone Number ID: INVALID${NC}"
  echo "   Response:"
  echo "$PHONE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$PHONE_RESPONSE"
fi

# Test 4: Send Template Message
echo ""
echo "4️⃣  Sending Test Template Message..."
echo "   To: $TEST_PHONE"

MSG_RESPONSE=$(curl -s -X POST "https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"messaging_product\": \"whatsapp\",
    \"to\": \"${TEST_PHONE}\",
    \"type\": \"template\",
    \"template\": {
      \"name\": \"hello_world\",
      \"language\": {
        \"code\": \"en_US\"
      }
    }
  }")

if echo "$MSG_RESPONSE" | grep -q '"id":"wamid'; then
  echo -e "   ${GREEN}✅ Message sent successfully!${NC}"
  MSG_ID=$(echo "$MSG_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  echo "   Message ID: $MSG_ID"
  echo -e "   ${YELLOW}📱 Check WhatsApp on $TEST_PHONE for the message${NC}"
else
  echo -e "   ${RED}❌ Message sending: FAILED${NC}"
  echo "   Response:"
  echo "$MSG_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$MSG_RESPONSE"
  
  # Common error explanations
  if echo "$MSG_RESPONSE" | grep -q "does not exist"; then
    echo -e "   ${YELLOW}Hint: Check your PHONE_NUMBER_ID is correct${NC}"
  fi
  if echo "$MSG_RESPONSE" | grep -q "Token"; then
    echo -e "   ${YELLOW}Hint: Your access token may be invalid or expired${NC}"
  fi
  if echo "$MSG_RESPONSE" | grep -q "template"; then
    echo -e "   ${YELLOW}Hint: The hello_world template might not be available${NC}"
  fi
fi

# Test 5: Webhook Reception Test
echo ""
echo "5️⃣  Testing Webhook Message Reception..."
echo -e "   ${YELLOW}Action Required:${NC}"
echo "   1. Send a WhatsApp message to your business number"
echo "   2. Check Netlify Functions logs at:"
echo "      https://app.netlify.com/sites/dtc-webhook/functions/webhook"
echo "   3. Look for 'Received message' in the logs"

# Summary
echo ""
echo "===================================="
echo "📊 TEST SUMMARY"
echo "===================================="

echo ""
echo "✓ To complete testing:"
echo "  1. Check if you received the test message on WhatsApp"
echo "  2. Reply to the message to test webhook reception"
echo "  3. Check Netlify logs for incoming messages"
echo ""
echo "📚 Documentation:"
echo "  - Webhook logs: https://app.netlify.com/sites/dtc-webhook/functions"
echo "  - Facebook console: https://developers.facebook.com"
echo ""

# Save test results
echo "Test completed at: $(date)" > test-results.txt
echo "Webhook URL: $WEBHOOK_URL" >> test-results.txt
echo "Phone Number ID: $PHONE_NUMBER_ID" >> test-results.txt
echo ""
echo "Results saved to: test-results.txt"