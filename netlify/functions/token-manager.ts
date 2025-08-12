import { Handler, HandlerEvent } from '@netlify/functions';
import crypto from 'crypto';

const APP_ID = process.env.APP_ID || '';
const APP_SECRET = process.env.APP_SECRET || '';
const SYSTEM_USER_ACCESS_TOKEN = process.env.SYSTEM_USER_ACCESS_TOKEN || '';
const ADMIN_SECRET = process.env.ADMIN_SECRET || '';

interface TokenInfo {
  access_token: string;
  token_type: string;
  expires_in?: number;
  error?: any;
}

/**
 * Token Manager endpoint for WhatsApp Business API
 * Handles token validation and provides token info
 */
const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, headers, body } = event;

  // Verify admin access
  const authHeader = headers['authorization'];
  if (!authHeader || authHeader !== `Bearer ${ADMIN_SECRET}`) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  if (httpMethod === 'GET') {
    // Validate current token
    try {
      const tokenInfo = await validateToken(SYSTEM_USER_ACCESS_TOKEN);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'active',
          token_info: tokenInfo,
          recommendations: getTokenRecommendations(tokenInfo)
        })
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Token validation failed',
          details: error
        })
      };
    }
  }

  if (httpMethod === 'POST') {
    // Exchange code for long-lived token (for initial setup)
    const payload = JSON.parse(body || '{}');
    const { code } = payload;

    if (!code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Code required for token exchange' })
      };
    }

    try {
      const tokenData = await exchangeCodeForToken(code);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          token_data: tokenData,
          instructions: 'Add this token to Netlify environment variables as SYSTEM_USER_ACCESS_TOKEN'
        })
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Token exchange failed',
          details: error
        })
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};

async function validateToken(token: string): Promise<TokenInfo> {
  const debugUrl = `https://graph.facebook.com/v17.0/debug_token?input_token=${token}&access_token=${token}`;
  
  const response = await fetch(debugUrl);
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }

  return {
    access_token: token,
    token_type: data.data.type || 'USER',
    expires_in: data.data.expires_at ? data.data.expires_at - Math.floor(Date.now() / 1000) : undefined,
    ...data.data
  };
}

async function exchangeCodeForToken(code: string): Promise<TokenInfo> {
  const tokenUrl = `https://graph.facebook.com/v17.0/oauth/access_token`;
  const params = new URLSearchParams({
    client_id: APP_ID,
    client_secret: APP_SECRET,
    code: code,
    redirect_uri: 'https://dtc-webhook.netlify.app/webhook'
  });

  const response = await fetch(`${tokenUrl}?${params}`);
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  // Exchange short-lived token for long-lived token
  if (data.access_token) {
    return await getLongLivedToken(data.access_token);
  }

  return data;
}

async function getLongLivedToken(shortLivedToken: string): Promise<TokenInfo> {
  const url = 'https://graph.facebook.com/v17.0/oauth/access_token';
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: APP_ID,
    client_secret: APP_SECRET,
    fb_exchange_token: shortLivedToken
  });

  const response = await fetch(`${url}?${params}`);
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data;
}

function getTokenRecommendations(tokenInfo: any): string[] {
  const recommendations = [];
  
  if (tokenInfo.expires_in) {
    const daysRemaining = Math.floor(tokenInfo.expires_in / (60 * 60 * 24));
    if (daysRemaining < 30) {
      recommendations.push(`Token expires in ${daysRemaining} days. Consider refreshing.`);
    }
  }

  if (tokenInfo.type !== 'SYSTEM') {
    recommendations.push('Consider using a System User token for better stability.');
  }

  if (!tokenInfo.scopes?.includes('whatsapp_business_messaging')) {
    recommendations.push('Token missing whatsapp_business_messaging scope.');
  }

  if (!tokenInfo.scopes?.includes('whatsapp_business_management')) {
    recommendations.push('Token missing whatsapp_business_management scope.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Token configuration looks good.');
  }

  return recommendations;
}

export { handler };