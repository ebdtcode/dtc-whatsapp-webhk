# How to Get Your Correct WhatsApp Phone Number ID

## Steps to Find Your Phone Number ID

1. **Go to Facebook Developer Console**
   - https://developers.facebook.com

2. **Select Your App**
   - Click on your app from the dashboard

3. **Navigate to WhatsApp Section**
   - In left sidebar, click "WhatsApp" > "Getting Started" or "API Setup"

4. **Find Your Phone Number ID**
   - Look for section "From" or "Phone numbers"
   - You'll see something like:
     ```
     Phone number: +1 555 123 4567
     Phone number ID: 123456789012345
     ```
   - Copy the Phone number ID (it's usually 15-17 digits)

5. **Alternative: Use API**
   ```bash
   curl -X GET \
     "https://graph.facebook.com/v17.0/YOUR_WABA_ID/phone_numbers" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

## Getting Test Phone Number ID

If you haven't added a real phone number yet:

1. **Go to WhatsApp > API Setup**
2. **Look for "Add phone number"**
3. **Use the test phone number provided**
   - Facebook provides a test number like: +1 555 025 3483
   - This has its own Phone Number ID

## Verify Your Credentials

Test your Phone Number ID with this API call:

```bash
curl -X GET \
  "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Should return:
```json
{
  "verified_name": "Your Business Name",
  "display_phone_number": "+1 555 123 4567",
  "id": "YOUR_PHONE_NUMBER_ID"
}
```

## Update Your Configuration

Once you have the correct Phone Number ID:

1. **Update .env file:**
   ```
   PHONE_NUMBER_ID=YOUR_ACTUAL_PHONE_NUMBER_ID
   ACCESS_TOKEN=YOUR_ACTUAL_ACCESS_TOKEN
   ```

2. **Update Netlify Environment Variables:**
   - Go to Netlify Dashboard
   - Site Settings > Environment Variables
   - Update PHONE_NUMBER_ID

3. **Update send scripts:**
   - Edit `send-real-message.sh`
   - Replace the PHONE_NUMBER_ID value

## Common Issues

### "Object with ID does not exist"
- Wrong Phone Number ID
- Phone number not verified
- App doesn't have WhatsApp product added

### "Missing permissions"
- Access token doesn't have whatsapp_business_messaging permission
- Generate new token with correct permissions

### "Unsupported operation"
- Using wrong API version (use v17.0 or later)
- Phone number not set up for Cloud API

## Quick Check

Run this to verify your setup:
```bash
curl -X GET "https://graph.facebook.com/v17.0/me?access_token=YOUR_ACCESS_TOKEN"
```

This will show what your token has access to.