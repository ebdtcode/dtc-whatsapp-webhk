# WhatsApp Webhook Setup Checklist

## 1. Environment Variables in Netlify

Make sure these are set in Netlify Dashboard > Site Settings > Environment Variables:

```
WEBHOOK_VERIFY_TOKEN=YOUR_WEBHOOK_VERIFY_TOKEN
APP_SECRET=YOUR_APP_SECRET
PHONE_NUMBER_ID=12405166565
ACCESS_TOKEN=EAAL3XBJiLL8BPLVcvdZAZCoi2UQZYOUR_WEBHOOK_VERIFY_TOKENL0H7S3OL3pK8ha3Vxth74zfttWDp0V14ybRSfsQVLCnCDHTAZBKTbVnXVOM8gCpCGSEjVfdhhl59IbZCN1XVtP53c4TDfABwCGRE8Y5QzttqBX3HfFB5ZCBICNi9LnuRQAdGZCGTC665khF1d06xyfSPofKlFnYOZC9vHilOj5cuXIBdEEtZBfQc2ZAscRPKXJ5dMEIZD
```

## 2. Redeploy After Adding Environment Variables

After adding environment variables:
1. Trigger a new deploy in Netlify
2. Wait for deployment to complete
3. Check Function logs to confirm variables are loaded

## 3. Test Webhook Locally

```bash
cd dtc-webhook
npm install
npm run dev

# In another terminal:
./test-webhook.sh YOUR_WEBHOOK_VERIFY_TOKEN
```

## 4. Test Production Webhook

```bash
curl "https://your-site.netlify.app/webhook?hub.mode=subscribe&hub.verify_token=YOUR_WEBHOOK_VERIFY_TOKEN&hub.challenge=test123"
```

Should return: `test123`

## 5. Facebook Webhook Configuration

In Facebook Developer Console:

1. Go to WhatsApp > Configuration
2. Click "Edit" on Webhook
3. Enter:
   - **Callback URL**: `https://your-site.netlify.app/webhook`
   - **Verify Token**: `YOUR_WEBHOOK_VERIFY_TOKEN`
4. Click "Verify and Save"

## 6. Check Netlify Function Logs

1. Go to Netlify Dashboard
2. Click on "Functions" tab
3. Click on "webhook" function
4. View real-time logs to see verification attempts

## Common Issues

### "The callback URL or verify token couldn't be validated"

**Causes:**
1. Environment variables not set in Netlify
2. Deployment not updated after adding env vars
3. Token mismatch (check for spaces/typos)
4. Function not responding correctly

**Solutions:**
1. Verify env vars are set in Netlify
2. Redeploy site after adding env vars
3. Check function logs for error messages
4. Test with curl command first

### Function Timeout

- Netlify functions have 10-second timeout
- Check if function is taking too long
- Remove any heavy processing from verification

### 403 Forbidden

- Token mismatch
- Check WEBHOOK_VERIFY_TOKEN in Netlify matches Facebook

## Debug Information

The webhook now logs:
- All incoming requests
- Verification parameters
- Token comparison
- Success/failure reasons

Check Netlify Function logs to see exactly what's happening.