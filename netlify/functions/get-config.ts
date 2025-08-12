import { Handler } from '@netlify/functions';

/**
 * Returns non-sensitive configuration for the dashboard
 * This allows the dashboard to auto-populate fields without exposing tokens in frontend code
 */
export const handler: Handler = async (event) => {
  // Enable CORS for dashboard access
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Only return non-sensitive info by default
  const config = {
    phoneNumberId: process.env.PHONE_NUMBER_ID || '',
    webhookUrl: `https://${event.headers.host || 'dtc-webhook.netlify.app'}/webhook`,
    apiVersion: 'v17.0',
    hasToken: !!process.env.SYSTEM_USER_ACCESS_TOKEN || !!process.env.ACCESS_TOKEN,
    tokenType: process.env.SYSTEM_USER_ACCESS_TOKEN ? 'system_user' : 'standard',
    environment: process.env.NODE_ENV || 'production'
  };

  // Check if request includes auth header for sensitive data
  const authHeader = event.headers.authorization;
  const adminSecret = process.env.ADMIN_SECRET;
  
  if (authHeader === `Bearer ${adminSecret}` && adminSecret) {
    // Return token only with proper authentication
    config['accessToken'] = process.env.SYSTEM_USER_ACCESS_TOKEN || process.env.ACCESS_TOKEN || '';
    config['appId'] = process.env.APP_ID || '';
  } else {
    // Return instructions for getting token
    config['tokenInstructions'] = 'To auto-load token, set ADMIN_SECRET and use authorization header';
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(config, null, 2)
  };
};