# WhatsApp Message Flow - IMPORTANT!

## The 24-Hour Rule

WhatsApp has strict rules about when you can send messages:

### First Contact (No Previous Conversation)
- **MUST use Template Message** (like hello_world)
- Cannot send custom text messages
- This is why you see the "Hello World. Welcome and congratulations..." message

### After User Responds (24-Hour Window)
- **Can send ANY message type**: text, images, documents
- Window stays open for 24 hours after their last message
- This is when you can send your custom messages

### After 24 Hours of No Response
- Must use Template Message again to restart conversation

## How to Send Custom Messages

### Step 1: Start Conversation (First Time Only)
1. In dashboard, select **"Template (Hello World - First Contact Only)"**
2. Send to recipient
3. They receive: "Hello World. Welcome and congratulations..."
4. **Wait for them to reply** (even just "Hi")

### Step 2: Send Your Custom Messages
1. Once they reply, select **"Text Message (Your Custom Message)"**
2. Type your actual message in the text box
3. Send - they'll receive YOUR message, not the template

## Quick Test Flow

```bash
# 1. Send template to start conversation
curl -X POST "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_TOKEN" \
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

# 2. After they reply, send your custom message
curl -X POST "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "RECIPIENT_NUMBER",
    "type": "text",
    "text": {
      "body": "Your actual custom message here!"
    }
  }'
```

## Dashboard Usage

### For New Conversations:
1. Select: **"Template (Hello World - First Contact Only)"**
2. Send template
3. Wait for reply
4. Switch to: **"Text Message (Your Custom Message)"**
5. Send your actual messages

### For Existing Conversations (Within 24 Hours):
1. Select: **"Text Message (Your Custom Message)"** 
2. Type your message
3. Send directly

## Common Mistakes

❌ **Wrong**: Trying to send custom text as first message
✅ **Right**: Send template first, then custom text after reply

❌ **Wrong**: Using template for ongoing conversation
✅ **Right**: Use text messages within 24-hour window

## Error Messages

### "Message failed to send"
- Usually means trying to send text without 24-hour window
- Solution: Send template first

### Getting "Hello World" instead of your message
- You selected "Template" instead of "Text Message"
- Solution: Select "Text Message" option

## Testing with Yourself

1. Add your number as test number
2. Send template to yourself
3. Reply from your WhatsApp
4. Now send custom messages for 24 hours

## Production Flow

For real customers:
1. Customer initiates (best) - they message you first
2. You can immediately send custom messages
3. Keep conversation going within 24 hours

OR

1. You initiate with approved template
2. Wait for response
3. Send custom messages after they reply