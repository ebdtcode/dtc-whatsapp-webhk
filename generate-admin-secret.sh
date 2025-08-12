#!/bin/bash

echo "Generating secure ADMIN_SECRET..."
echo ""

# Generate a random 32-character secret
ADMIN_SECRET=$(openssl rand -hex 32)

echo "Your ADMIN_SECRET:"
echo "=================================="
echo "$ADMIN_SECRET"
echo "=================================="
echo ""
echo "What to do with this:"
echo "1. Copy the secret above"
echo "2. Add to Netlify Environment Variables:"
echo "   Key: ADMIN_SECRET"
echo "   Value: $ADMIN_SECRET"
echo ""
echo "3. Use it to access token manager:"
echo "   curl -H \"Authorization: Bearer $ADMIN_SECRET\" \\"
echo "        https://dtc-webhook.netlify.app/.netlify/functions/token-manager"
echo ""
echo "IMPORTANT: Save this secret securely! You'll need it to manage tokens."