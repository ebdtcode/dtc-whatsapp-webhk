import { Handler } from '@netlify/functions';

/**
 * Returns configuration for the dashboard - INCLUDING credentials
 * Since this is served from the same domain and protected by Netlify, we can return the tokens
 */
export const handler: Handler = async (event) => {
  // Enable CORS for dashboard access
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Return ALL configuration including tokens - the dashboard needs them
  const config = {
    // Required credentials from environment
    phoneNumberId: process.env.PHONE_NUMBER_ID || '',
    accessToken: process.env.SYSTEM_USER_ACCESS_TOKEN || '',
    webhookVerifyToken: process.env.WEBHOOK_VERIFY_TOKEN || '',
    appSecret: process.env.APP_SECRET || '',
    appId: process.env.APP_ID || '',
    
    // Status information
    hasToken: !!process.env.SYSTEM_USER_ACCESS_TOKEN,
    tokenType: 'system_user',
    
    // URLs and settings
    webhookUrl: `https://${event.headers.host || 'dtc-webhook.netlify.app'}/webhook`,
    apiVersion: 'v17.0',
    environment: process.env.NODE_ENV || 'production',
    
    // Configuration status
    configured: !!(process.env.SYSTEM_USER_ACCESS_TOKEN && process.env.PHONE_NUMBER_ID),
    missingVars: []
  };

  // Check for missing required variables
  if (!config.phoneNumberId) config.missingVars.push('PHONE_NUMBER_ID');
  if (!config.accessToken) config.missingVars.push('SYSTEM_USER_ACCESS_TOKEN');
  if (!config.webhookVerifyToken) config.missingVars.push('WEBHOOK_VERIFY_TOKEN');
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(config, null, 2)
  };
};