# DTC WhatsApp Webhook

WhatsApp Cloud API webhook for receiving and responding to WhatsApp messages, deployed on Netlify.

## Quick Start

### 1. Prerequisites

- Node.js 18+
- Netlify account
- Facebook Developer account with WhatsApp Business API access

### 2. Setup

```bash
# Clone and enter directory
cd dtc-webhook

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your actual values
```

### 3. Environment Variables

Get these from Facebook Developer Console:

- `WEBHOOK_VERIFY_TOKEN`: Create a secure random token
- `APP_SECRET`: Facebook App Secret (Settings > Basic)
- `PHONE_NUMBER_ID`: WhatsApp phone number ID
- `ACCESS_TOKEN`: Permanent access token for WhatsApp API

### 4. Local Development

```bash
# Run locally with Netlify Dev
npm run dev

# Webhook available at: http://localhost:8888/webhook
```

### 5. Deploy to Netlify

#### Option A: CLI Deployment

```bash
# Login to Netlify
npx netlify login

# Initialize site
npx netlify init

# Deploy to production
npm run deploy
```

#### Option B: Git Deployment

1. Push to GitHub/GitLab/Bitbucket
2. Import project on [Netlify](https://app.netlify.com)
3. Add environment variables in site settings
4. Deploy automatically on push

### 6. Configure WhatsApp Webhook

1. Get your Netlify URL: `https://your-site.netlify.app/webhook`
2. In Facebook Developer Console:
   - Go to WhatsApp > Configuration > Webhook
   - Callback URL: Your Netlify URL
   - Verify Token: Your `WEBHOOK_VERIFY_TOKEN`
   - Subscribe to: messages, message_deliveries, message_reads
3. Click "Verify and Save"

## Features

- ✅ Webhook verification
- ✅ Message receiving (text, image, document, audio, video, location)
- ✅ Auto-reply functionality
- ✅ Signature verification for security
- ✅ Status updates tracking
- ✅ TypeScript support

## Project Structure

```
dtc-webhook/
├── netlify/
│   └── functions/
│       └── webhook.ts      # Main webhook handler
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── netlify.toml            # Netlify configuration
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── README.md               # This file
```

## Testing

### Test Webhook Verification

```bash
curl "https://your-site.netlify.app/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test"
```

### Send Test Message

Send any WhatsApp message to your business number and check Netlify Functions logs.

## Monitoring

View logs in Netlify dashboard:
1. Go to Functions tab
2. Select "webhook" function
3. View real-time logs

## Customization

Edit `netlify/functions/webhook.ts` to customize:

- `handleMessage()`: Process incoming messages
- `sendWhatsAppMessage()`: Send replies
- Add new message types or business logic

## Security

- Always verify webhook signatures
- Keep environment variables secret
- Use HTTPS (automatic with Netlify)
- Rotate access tokens regularly

## Limits

### Netlify Free Tier
- 125,000 function invocations/month
- 100 hours runtime/month
- 10 second timeout

### WhatsApp API
- Rate limits apply
- Check Facebook documentation for current limits

## Support

- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)

## License

Private - DTC Internal Use Only# dtc-whatsapp-webhk
