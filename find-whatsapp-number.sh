#!/bin/bash

# Script to find your WhatsApp Business Account ID and Phone Numbers
ACCESS_TOKEN="EAAL3XBJiLL8BPLVcvdZAZCoi2UQZAkqMBZAI4JZCg9mAHwBBxKL9J8G8L0H7S3OL3pK8ha3Vxth74zfttWDp0V14ybRSfsQVLCnCDHTAZBKTbVnXVOM8gCpCGSEjVfdhhl59IbZCN1XVtP53c4TDfABwCGRE8Y5QzttqBX3HfFB5ZCBICNi9LnuRQAdGZCGTC665khF1d06xyfSPofKlFnYOZC9vHilOj5cuXIBdEEtZBfQc2ZAscRPKXJ5dMEIZD"

echo "Finding your WhatsApp Business Account details..."
echo ""

# Step 1: Get your Facebook App's WhatsApp Business Account ID
echo "Step 1: Getting WhatsApp Business Account ID..."
WABA_RESPONSE=$(curl -s -X GET \
  "https://graph.facebook.com/v17.0/debug_token?input_token=$ACCESS_TOKEN&access_token=$ACCESS_TOKEN")

echo "Token info:"
echo "$WABA_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$WABA_RESPONSE"
echo ""

# Step 2: Try to get WhatsApp Business Account
echo "Step 2: Getting WhatsApp Business Accounts..."
ACCOUNTS_RESPONSE=$(curl -s -X GET \
  "https://graph.facebook.com/v17.0/10225976887842566/accounts?access_token=$ACCESS_TOKEN")

echo "Accounts:"
echo "$ACCOUNTS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ACCOUNTS_RESPONSE"
echo ""

# Step 3: Try the test phone number (Facebook's default test number)
echo "Step 3: Trying test phone number..."
TEST_PHONE_ID="243683422157584"  # Common test phone number ID
TEST_RESPONSE=$(curl -s -X GET \
  "https://graph.facebook.com/v17.0/$TEST_PHONE_ID?access_token=$ACCESS_TOKEN")

echo "Test phone response:"
echo "$TEST_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$TEST_RESPONSE"
echo ""

# Step 4: Instructions
echo "========================================="
echo "IMPORTANT: To find your Phone Number ID:"
echo "========================================="
echo ""
echo "1. Go to: https://developers.facebook.com/apps/"
echo "2. Select your app"
echo "3. Click 'WhatsApp' in the left menu"
echo "4. Click 'API Setup' or 'Getting Started'"
echo "5. Look for a section showing:"
echo "   - Test number: +1 555 025 3483 (or similar)"
echo "   - Phone number ID: [15-17 digit number]"
echo ""
echo "6. The Phone Number ID will look like: 112233445566778899"
echo ""
echo "If you don't see WhatsApp in your app:"
echo "1. Go to App Dashboard"
echo "2. Click '+ Add Product'"
echo "3. Find 'WhatsApp' and click 'Set Up'"
echo "4. Follow the setup process"