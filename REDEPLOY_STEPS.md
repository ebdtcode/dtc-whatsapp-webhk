# Redeploy Netlify Site After Environment Variable Changes

## The environment variable is set but needs deployment to take effect!

### Option 1: Trigger Deploy from Netlify Dashboard

1. **Go to Deploys tab** in your Netlify dashboard
2. Click **"Trigger deploy"** dropdown
3. Select **"Clear cache and deploy site"**
4. Wait for deployment to complete (usually 1-2 minutes)

### Option 2: Push a Small Change to Git

1. Make any small change to trigger rebuild:
```bash
cd dtc-webhook
echo "# Updated $(date)" >> README.md
git add .
git commit -m "Trigger rebuild for env vars"
git push
```

### Option 3: Use Netlify CLI

```bash
netlify deploy --prod
```

## After Deployment

Test the webhook again:
```bash
./test-production-webhook.sh
```

Should return:
- Status: 200
- Body: test-challenge-12345

## Then Configure Facebook Webhook

Once the test passes:

1. Go to Facebook Developer Console
2. WhatsApp > Configuration > Webhook
3. Enter:
   - **Callback URL**: `https://dtc-webhook.netlify.app/webhook`
   - **Verify Token**: `AkqMBZAI4JZCg9mAHwBBxKL9J8G8L0H7S3OL3pK8ha3GhqAo81gplkzaqw`
4. Click "Verify and Save"

## Important Notes

- Environment variables are NOT immediately available
- You MUST redeploy after adding/changing env vars
- The "updated a few seconds ago" means the variable is saved, not deployed
- Check the Deploys tab to see when last deployment was

## Verify Deployment Status

In Netlify dashboard:
1. Go to **Deploys** tab
2. Check the timestamp of the latest deploy
3. If it's before you added the env var, you need to redeploy
4. After deploying, check Functions > webhook logs to see if env var is loaded