# Scripts Directory

All executable scripts are organized here by category.

## Directory Structure

```
scripts/
├── testing/          # Test and validation scripts
├── messaging/        # Message sending scripts
└── utilities/        # Helper and utility scripts
```

## Testing Scripts (`testing/`)

- `test-webhook.sh` - Test local webhook verification
- `test-production-webhook.sh` - Test production webhook on Netlify
- `test-system-token.sh` - Validate System User token
- `test-complete.sh` - Run complete test suite
- `test-post.sh` - Test POST requests to webhook
- `test-image-message.sh` - Test image message sending

## Messaging Scripts (`messaging/`)

- `send-image-now.sh` - Send image message immediately
- `send-media.sh` - Send various media types
- `send-message-fixed.sh` - Send message with fixes
- `send-real-message.sh` - Send real WhatsApp message

## Utility Scripts (`utilities/`)

- `load-env.sh` - Load environment variables (used by other scripts)
- `find-whatsapp-number.sh` - Find WhatsApp phone number ID
- `generate-admin-secret.sh` - Generate admin secret token

## Usage

All scripts should be run from the project root:

```bash
# From project root
./scripts/testing/test-webhook.sh
./scripts/messaging/send-image-now.sh
./scripts/utilities/find-whatsapp-number.sh
```

## Environment Variables

Most scripts depend on `utilities/load-env.sh` which loads variables from the `.env` file in the project root.

Required variables:
- `WEBHOOK_VERIFY_TOKEN`
- `SYSTEM_USER_ACCESS_TOKEN`
- `PHONE_NUMBER_ID`
- `APP_SECRET`