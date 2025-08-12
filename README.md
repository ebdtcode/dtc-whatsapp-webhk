# DTC WhatsApp Webhook

WhatsApp Cloud API webhook for receiving and responding to WhatsApp messages, deployed on Netlify.

## 📚 Documentation

### Setup & Configuration
- [Initial Setup Guide](docs/setup/WEBHOOK_SETUP.md)
- [Get Phone Number ID](docs/setup/GET_PHONE_NUMBER_ID.md)
- [System User Token Setup](docs/setup/SYSTEM_USER_SETUP.md)
- [Get Permanent Token](docs/setup/GET_PERMANENT_TOKEN.md)
- [Redeploy Steps](docs/setup/REDEPLOY_STEPS.md)

### Usage Guides
- [Testing Guide](docs/guides/TESTING_GUIDE.md)
- [WhatsApp Message Flow](docs/guides/WHATSAPP_MESSAGE_FLOW.md)
- [Image Message Guide](docs/guides/IMAGE_MESSAGE_GUIDE.md)
- [Media Messages Guide](docs/guides/MEDIA_MESSAGES_GUIDE.md)
- [Real Message Guide](docs/guides/REAL_MESSAGE_GUIDE.md)
- [Complete Test Setup](docs/guides/TEST_COMPLETE_SETUP.md)

### API Documentation
- [Postman Setup](docs/api/POSTMAN_SETUP.md)
- [Send Message via Postman](docs/api/SEND_MESSAGE_POSTMAN.md)
- [OpenAPI Specification](docs/api/openapi.yaml) *(coming soon)*

### Troubleshooting
- [Message Troubleshooting](docs/troubleshooting/TROUBLESHOOT_MESSAGE.md)

### Architecture
- [Compliance Report](docs/architecture/CLAUDE_COMPLIANCE_REPORT.md)
- [Architecture Decisions](docs/architecture/ADR-001-typescript-choice.md)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Netlify account
- Facebook Developer account with WhatsApp Business API access

### Setup
```bash
# Clone and enter directory
cd dtc-webhook

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your actual values
```

### Environment Variables
Get these from Facebook Developer Console:
- `WEBHOOK_VERIFY_TOKEN`: Create a secure random token
- `APP_SECRET`: Facebook App Secret (Settings > Basic)
- `PHONE_NUMBER_ID`: WhatsApp phone number ID
- `SYSTEM_USER_ACCESS_TOKEN`: System User token for WhatsApp API

### Local Development
```bash
# Run locally with Netlify Dev
npm run dev

# Run tests
npm test

# Webhook available at: http://localhost:8888/webhook
```

### Deploy to Netlify
```bash
# Deploy to production
npm run deploy
```

Or connect to GitHub for automatic deployments.

## 🎯 Features

- ✅ Webhook verification
- ✅ Message receiving (text, image, document, audio, video, location)
- ✅ Auto-reply functionality
- ✅ Signature verification for security
- ✅ Status updates tracking
- ✅ TypeScript support
- ✅ Test dashboard at `/test-dashboard.html`

## 📁 Project Structure

```
dtc-webhook/
├── config/                # Configuration files
│   ├── jest.config.js    # Jest testing config
│   ├── .eslintrc.js      # ESLint rules
│   ├── .prettierrc       # Prettier formatting
│   └── tsconfig.json     # TypeScript config
├── docs/                  # All documentation
│   ├── setup/            # Setup guides
│   ├── guides/           # Usage guides
│   ├── api/              # API documentation
│   ├── troubleshooting/  # Troubleshooting guides
│   └── architecture/     # Architecture decisions
├── netlify/
│   └── functions/        # Serverless functions
│       ├── webhook.ts    # Main webhook handler
│       ├── get-config.ts # Config endpoint
│       └── diagnostic.ts # Diagnostic endpoint
├── public/               # Static files
│   ├── index.html       # Landing page
│   └── test-dashboard.html # Testing interface
├── scripts/              # Executable scripts
│   ├── testing/         # Test scripts
│   ├── messaging/       # Message sending scripts
│   └── utilities/       # Helper scripts
├── test-data/           # Test JSON payloads
│   ├── send-*.json     # Message payloads
│   └── test-*.json     # Test data
├── tests/               # Unit tests
│   ├── webhook.test.ts # Webhook tests
│   └── get-config.test.ts # Config tests
├── .env.example        # Environment template
├── .gitignore          # Git ignore rules
├── netlify.toml        # Netlify configuration
├── package.json        # Dependencies
└── README.md           # This file
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Test Dashboard
Access the test dashboard at:
```
https://your-site.netlify.app/test-dashboard.html
```

### Manual Testing
```bash
# Test webhook verification
./scripts/testing/test-production-webhook.sh

# Test system token
./scripts/testing/test-system-token.sh

# Test image sending
./scripts/testing/test-image-message.sh
```

## 📊 Monitoring

View logs in Netlify dashboard:
1. Go to Functions tab
2. Select function (webhook, get-config, etc.)
3. View real-time logs

## 🔒 Security

- Webhook signature verification
- Environment-based configuration
- HTTPS enforced (automatic with Netlify)
- System User tokens for long-term access
- Rate limiting on API calls

## 📈 Limits

### Netlify Free Tier
- 125,000 function invocations/month
- 100 hours runtime/month
- 10 second timeout

### WhatsApp API
- Rate limits apply per phone number
- 24-hour messaging window rules
- Check Facebook documentation for current limits

## 🛠 Development

### Commands
```bash
npm run dev        # Start local development
npm run build      # Build for production
npm run test       # Run tests
npm run lint       # Lint code
npm run format     # Format code
npm run deploy     # Deploy to Netlify
```

### Contributing
1. Create feature branch
2. Add tests for new features
3. Ensure all tests pass
4. Update documentation
5. Submit pull request

## 📞 Support

- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- Internal: Contact DTC DevOps team

## 📄 License

Private - DTC Internal Use Only