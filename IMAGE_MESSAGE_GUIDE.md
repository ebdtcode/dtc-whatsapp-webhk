# WhatsApp Image Message Guide

## Quick Test

Use the test script:
```bash
./test-image-message.sh
```

Or use the dashboard:
https://dtc-webhook.netlify.app/test-dashboard.html

## Image Requirements

### ✅ Must Have
- **HTTPS URL** (not HTTP)
- **Publicly accessible** (not localhost, not private)
- **Under 5MB** in size
- **Supported formats**: JPEG, PNG

### ❌ Won't Work
- HTTP URLs (must be HTTPS)
- Local files (file:// URLs)
- Private/authenticated URLs
- Files over 5MB
- Unsupported formats (GIF, BMP, etc.)

## Working Test Images

These URLs are guaranteed to work for testing:

```
https://picsum.photos/400/300
https://picsum.photos/800/600
https://via.placeholder.com/400x300.png
https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png
```

## Send Image with cURL

```bash
# Load environment
source ./load-env.sh

# Send image
curl -X POST "https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages" \
  -H "Authorization: Bearer ${SYSTEM_USER_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "RECIPIENT_NUMBER",
    "type": "image",
    "image": {
      "link": "https://picsum.photos/400/300",
      "caption": "Beautiful random image!"
    }
  }'
```

## Common Errors and Solutions

### Error: "Unsupported post request"
**Cause**: Invalid Phone Number ID  
**Solution**: Get correct ID from Facebook Developer Console

### Error: "Invalid parameter"
**Cause**: Image URL issues  
**Solutions**:
- Ensure URL uses HTTPS
- Check URL is publicly accessible
- Verify image is under 5MB
- Try a known working test URL

### Error: "24 hours have passed"
**Cause**: No active conversation window  
**Solution**: 
1. Send template message first
2. Wait for recipient to reply
3. Then send image

### Error: "Media download failed"
**Cause**: WhatsApp can't access the image  
**Solutions**:
- URL must be publicly accessible
- No authentication required
- Not behind firewall/VPN
- Not on localhost

## Testing Flow

### Step 1: Verify Setup
```bash
# Test your token
./test-system-token.sh

# Test webhook
./test-production-webhook.sh
```

### Step 2: Open Conversation
Send template message first (if needed):
```bash
curl -X POST "https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages" \
  -H "Authorization: Bearer ${SYSTEM_USER_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "RECIPIENT_NUMBER",
    "type": "template",
    "template": {
      "name": "hello_world",
      "language": {"code": "en_US"}
    }
  }'
```

### Step 3: Send Image
After recipient replies:
```bash
./test-image-message.sh
```

## Dashboard Usage

1. Go to: https://dtc-webhook.netlify.app/test-dashboard.html
2. Select "Image with Caption"
3. Use one of these test URLs:
   - `https://picsum.photos/400/300` (random image)
   - `https://via.placeholder.com/400x300.png` (placeholder)
4. Add optional caption
5. Click "Send Message"

## Hosting Your Own Images

### Option 1: Use Image Hosting Services
- [Imgur](https://imgur.com) - Free image hosting
- [Cloudinary](https://cloudinary.com) - Developer-friendly
- [ImgBB](https://imgbb.com) - Simple and free

### Option 2: Use GitHub
1. Upload image to a public GitHub repo
2. Get raw URL (click "Raw" button)
3. Use that URL in your messages

### Option 3: Use CDN
- Upload to your website/CDN
- Ensure HTTPS is enabled
- Make sure no authentication required

## Advanced: Multiple Images

To send multiple images, send them as separate messages:

```javascript
// Send first image
await sendImage(recipient, 'https://picsum.photos/400/300', 'Image 1');

// Wait a moment
await new Promise(resolve => setTimeout(resolve, 1000));

// Send second image
await sendImage(recipient, 'https://picsum.photos/400/301', 'Image 2');
```

## Troubleshooting Checklist

- [ ] URL starts with `https://` (not `http://`)
- [ ] Image is publicly accessible (test in incognito browser)
- [ ] Image is under 5MB
- [ ] Format is JPEG or PNG
- [ ] Recipient has replied within 24 hours
- [ ] Phone Number ID is correct
- [ ] Access token is valid

## Need Help?

1. Test with known working URL: `https://picsum.photos/400/300`
2. Check error message for specific issue
3. Use dashboard for better error messages
4. Verify all requirements above