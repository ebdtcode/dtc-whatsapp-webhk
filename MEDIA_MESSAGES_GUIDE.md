# WhatsApp Media Messages Guide

## Yes! You can send images with text captions and much more!

## Supported Media Types

### 1. Images with Caption
Send images with accompanying text messages

**Supported Formats:** JPEG, PNG
**Max Size:** 5MB
**Requirements:** Publicly accessible URL or Media ID

### 2. Documents with Caption
Send PDFs, Word docs, spreadsheets with descriptions

**Supported Formats:** PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
**Max Size:** 100MB
**Can include:** Filename and caption

### 3. Videos with Caption
Share videos with text descriptions

**Supported Formats:** MP4, 3GP
**Max Size:** 16MB
**Codec:** H.264 video, AAC audio

### 4. Audio Messages
Send voice notes or audio files

**Supported Formats:** MP3, OGG, AMR, AAC, M4A
**Max Size:** 16MB

## Sending Image with Text

### Using cURL
```bash
curl -X POST "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "27823456789",
    "type": "image",
    "image": {
      "link": "https://example.com/your-image.jpg",
      "caption": "This is your text message that appears with the image!"
    }
  }'
```

### Using Postman
**Body (JSON):**
```json
{
  "messaging_product": "whatsapp",
  "to": "27823456789",
  "type": "image",
  "image": {
    "link": "https://example.com/image.jpg",
    "caption": "📸 Product Update!\n\nCheck out our new product line.\n\nFeatures:\n• Feature 1\n• Feature 2\n• Feature 3\n\nVisit our website for more!"
  }
}
```

## Advanced Examples

### 1. Product Showcase
```json
{
  "messaging_product": "whatsapp",
  "to": "27823456789",
  "type": "image",
  "image": {
    "link": "https://yourstore.com/product-image.jpg",
    "caption": "🛍️ NEW ARRIVAL!\n\nProduct: Premium Headphones\nPrice: R1,299\nStock: Limited\n\n📦 Free delivery on orders over R500\n\nReply 'YES' to order now!"
  }
}
```

### 2. Event Invitation
```json
{
  "messaging_product": "whatsapp",
  "to": "27823456789",
  "type": "image",
  "image": {
    "link": "https://events.com/invitation.jpg",
    "caption": "🎉 You're Invited!\n\n📅 Date: 15 Dec 2024\n📍 Location: Cape Town\n⏰ Time: 18:00\n\nRSVP by replying 'ATTEND' or 'DECLINE'"
  }
}
```

### 3. Document Sharing
```json
{
  "messaging_product": "whatsapp",
  "to": "27823456789",
  "type": "document",
  "document": {
    "link": "https://yoursite.com/invoice.pdf",
    "caption": "📄 Invoice #12345\n\nAmount Due: R5,000\nDue Date: 30 Dec 2024\n\nPlease review and confirm receipt.",
    "filename": "Invoice_12345.pdf"
  }
}
```

## Using Media IDs (Uploaded Media)

Instead of URLs, you can upload media first and use Media IDs:

### Step 1: Upload Media
```bash
curl -X POST "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/media" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "type=image/jpeg" \
  -F "messaging_product=whatsapp"
```

Returns:
```json
{
  "id": "MEDIA_ID_HERE"
}
```

### Step 2: Send Using Media ID
```json
{
  "messaging_product": "whatsapp",
  "to": "27823456789",
  "type": "image",
  "image": {
    "id": "MEDIA_ID_HERE",
    "caption": "Your message here"
  }
}
```

## Quick Test Script

Run the interactive media sender:
```bash
cd dtc-webhook
./send-media.sh
```

Choose option 5 for a quick test with a sample image.

## Best Practices

### 1. Image Requirements
- Use HTTPS URLs only
- Ensure images are publicly accessible
- Optimize size (under 5MB)
- Use common formats (JPEG, PNG)

### 2. Caption Guidelines
- Max 1024 characters
- Support emojis and formatting
- Include clear call-to-action
- Use line breaks for readability

### 3. Error Handling
Common errors and solutions:

**"Media download failed"**
- Check URL is publicly accessible
- Verify HTTPS (not HTTP)
- Ensure correct content-type headers

**"Unsupported media type"**
- Check file format
- Verify file size limits
- Use supported codecs for video/audio

## Interactive Media

### Buttons with Images
```json
{
  "messaging_product": "whatsapp",
  "to": "27823456789",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "header": {
      "type": "image",
      "image": {
        "link": "https://example.com/image.jpg"
      }
    },
    "body": {
      "text": "Choose an option:"
    },
    "action": {
      "buttons": [
        {
          "type": "reply",
          "reply": {
            "id": "btn_1",
            "title": "Buy Now"
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "btn_2",
            "title": "Learn More"
          }
        }
      ]
    }
  }
}
```

## Testing Media Messages

1. **Test with public image:**
```bash
curl -X POST "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "YOUR_TEST_NUMBER",
    "type": "image",
    "image": {
      "link": "https://via.placeholder.com/600x400/4A90E2/FFFFFF?text=Test+Image",
      "caption": "Test message with image from WhatsApp API"
    }
  }'
```

2. **Check delivery:**
- Message should appear immediately
- Image loads with caption below
- User can tap to view full size

## Rate Limits

- Business initiated: 1000 msgs/sec per phone number
- User initiated: 80 msgs/sec (replies)
- Media uploads: 100/hour

## Next Steps

1. Test sending images with captions
2. Try different media types
3. Implement media upload for local files
4. Add interactive buttons with images
5. Build media management system