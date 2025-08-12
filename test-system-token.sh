#!/bin/bash

# Test System User Token

# Load environment variables
source ./load-env.sh

# Use environment variable
SYSTEM_TOKEN="${SYSTEM_USER_ACCESS_TOKEN}"

echo "Testing System User Token..."
echo "================================"
echo ""

# Test 1: Validate token
echo "1. Validating token..."
VALIDATION=$(curl -s "https://graph.facebook.com/v17.0/debug_token?input_token=${SYSTEM_TOKEN}&access_token=${SYSTEM_TOKEN}")

echo "Response:"
echo "$VALIDATION" | python3 -m json.tool 2>/dev/null || echo "$VALIDATION"
echo ""

# Check if valid
if echo "$VALIDATION" | grep -q '"is_valid":true'; then
    echo "✅ Token is valid"
    
    # Extract details
    if echo "$VALIDATION" | grep -q '"type":"SYSTEM"'; then
        echo "✅ Token type: System User (Good!)"
    else
        echo "⚠️  Token type: Not a System User token"
    fi
    
    # Check expiration
    if echo "$VALIDATION" | grep -q '"expires_at":0'; then
        echo "✅ Token never expires"
    else
        echo "⚠️  Token has expiration date"
    fi
    
    # Check scopes
    if echo "$VALIDATION" | grep -q 'whatsapp_business_messaging'; then
        echo "✅ Has WhatsApp messaging permission"
    else
        echo "❌ Missing WhatsApp messaging permission"
    fi
    
    if echo "$VALIDATION" | grep -q 'whatsapp_business_management'; then
        echo "✅ Has WhatsApp management permission"
    else
        echo "❌ Missing WhatsApp management permission"
    fi
else
    echo "❌ Token is invalid or expired"
    echo ""
    echo "You need to generate a new System User token:"
    echo "1. Go to https://business.facebook.com/settings"
    echo "2. Navigate to Users > System Users"
    echo "3. Select your System User"
    echo "4. Click 'Generate New Token'"
    echo "5. Select your app"
    echo "6. Choose 'Never' for expiration (or 60 days)"
    echo "7. Add these permissions:"
    echo "   - whatsapp_business_messaging"
    echo "   - whatsapp_business_management"
    echo "   - business_management"
    echo "8. Copy the new token"
    echo "9. Update SYSTEM_USER_ACCESS_TOKEN in Netlify"
fi

echo ""
echo "================================"
echo ""

# Test 2: Try to get phone number info
if [ "$SYSTEM_TOKEN" != "YOUR_SYSTEM_USER_TOKEN" ]; then
    echo "2. Testing API access..."
    PHONE_NUMBER_ID="YOUR_PHONE_NUMBER_ID"
    
    if [ "$PHONE_NUMBER_ID" != "YOUR_PHONE_NUMBER_ID" ]; then
        API_TEST=$(curl -s "https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}?access_token=${SYSTEM_TOKEN}")
        
        if echo "$API_TEST" | grep -q '"id"'; then
            echo "✅ Can access WhatsApp API"
        else
            echo "❌ Cannot access WhatsApp API"
            echo "$API_TEST" | python3 -m json.tool 2>/dev/null || echo "$API_TEST"
        fi
    fi
fi