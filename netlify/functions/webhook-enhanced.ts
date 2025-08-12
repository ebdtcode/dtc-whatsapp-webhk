import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import crypto from 'crypto';

// Environment variables
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || '';
const APP_SECRET = process.env.APP_SECRET || '';
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '';
const ACCESS_TOKEN = process.env.SYSTEM_USER_ACCESS_TOKEN || process.env.ACCESS_TOKEN || '';
const APP_ID = process.env.APP_ID || '';

// Token refresh configuration
let tokenExpiryTime: number | null = null;
let isRefreshing = false;

interface TokenValidationResult {
  isValid: boolean;
  expiresAt?: number;
  needsRefresh: boolean;
  error?: string;
}

/**
 * Enhanced webhook handler with token management
 */
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const { httpMethod, queryStringParameters, headers, body } = event;

  // Check token before processing
  const tokenStatus = await checkTokenStatus();
  if (tokenStatus.needsRefresh && !isRefreshing) {
    console.warn('Token needs refresh:', tokenStatus);
    // In production, trigger alert/notification here
    await notifyTokenExpiry(tokenStatus);
  }

  // Handle GET request (webhook verification)
  if (httpMethod === 'GET') {
    const mode = queryStringParameters?.['hub.mode'];
    const token = queryStringParameters?.['hub.verify_token'];
    const challenge = queryStringParameters?.['hub.challenge'];

    if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
      console.log('Webhook verified successfully');
      return {
        statusCode: 200,
        body: challenge || '',
      };
    } else {
      console.error('Webhook verification failed');
      return {
        statusCode: 403,
        body: 'Forbidden',
      };
    }
  }

  // Handle POST request (webhook events)
  if (httpMethod === 'POST') {
    // Verify webhook signature
    if (APP_SECRET && !verifyWebhookSignature(body || '', headers)) {
      return {
        statusCode: 401,
        body: 'Unauthorized',
      };
    }

    try {
      const payload = JSON.parse(body || '{}');
      
      if (payload.object === 'whatsapp_business_account') {
        for (const entry of payload.entry || []) {
          for (const change of entry.changes || []) {
            const value = change.value;
            
            // Process messages with token retry
            if (value.messages) {
              for (const message of value.messages) {
                await handleMessageWithRetry(message);
              }
            }
            
            // Process status updates
            if (value.statuses) {
              for (const status of value.statuses) {
                console.log('Status update:', status);
              }
            }
          }
        }
        
        return {
          statusCode: 200,
          body: 'EVENT_RECEIVED',
        };
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      return {
        statusCode: 500,
        body: 'Internal Server Error',
      };
    }
  }

  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};

/**
 * Check token status and expiration
 */
async function checkTokenStatus(): Promise<TokenValidationResult> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v17.0/debug_token?input_token=${ACCESS_TOKEN}&access_token=${ACCESS_TOKEN}`
    );
    
    const data = await response.json();
    
    if (data.error) {
      return {
        isValid: false,
        needsRefresh: true,
        error: data.error.message
      };
    }
    
    const tokenData = data.data;
    const expiresAt = tokenData.expires_at;
    
    // Check if token expires soon (within 7 days)
    const now = Math.floor(Date.now() / 1000);
    const sevenDaysInSeconds = 7 * 24 * 60 * 60;
    const needsRefresh = expiresAt > 0 && (expiresAt - now) < sevenDaysInSeconds;
    
    // Cache expiry time
    tokenExpiryTime = expiresAt;
    
    return {
      isValid: tokenData.is_valid,
      expiresAt: expiresAt,
      needsRefresh: needsRefresh,
      error: tokenData.is_valid ? undefined : 'Token is invalid'
    };
  } catch (error) {
    console.error('Error checking token status:', error);
    return {
      isValid: false,
      needsRefresh: true,
      error: 'Failed to validate token'
    };
  }
}

/**
 * Handle message with automatic retry on token failure
 */
async function handleMessageWithRetry(message: any, retryCount = 0): Promise<void> {
  try {
    await handleMessage(message);
  } catch (error: any) {
    console.error('Message handling error:', error);
    
    // Check if error is token-related
    if (error.message?.includes('token') || error.message?.includes('expired')) {
      if (retryCount < 1) {
        console.log('Token error detected, checking token status...');
        const tokenStatus = await checkTokenStatus();
        
        if (!tokenStatus.isValid) {
          console.error('Token is invalid/expired. Manual intervention required.');
          await notifyTokenExpiry(tokenStatus);
        }
      }
    }
  }
}

/**
 * Handle incoming message
 */
async function handleMessage(message: any): Promise<void> {
  console.log('Processing message:', {
    from: message.from,
    type: message.type,
    text: message.text?.body
  });

  // Auto-reply based on message type
  switch (message.type) {
    case 'text':
      if (message.text?.body) {
        await sendWhatsAppMessageWithRetry(
          message.from,
          `Received: "${message.text.body}"`
        );
      }
      break;
    case 'image':
      await sendWhatsAppMessageWithRetry(message.from, 'Thanks for the image!');
      break;
    case 'document':
      await sendWhatsAppMessageWithRetry(message.from, 'Document received!');
      break;
    default:
      console.log('Unsupported message type:', message.type);
  }
}

/**
 * Send WhatsApp message with retry logic
 */
async function sendWhatsAppMessageWithRetry(
  to: string,
  text: string,
  retryCount = 0
): Promise<any> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: text }
        })
      }
    );
    
    const data = await response.json();
    
    if (data.error) {
      // Check for token expiration errors
      if (data.error.code === 190 || data.error.message?.includes('token')) {
        throw new Error(`Token error: ${data.error.message}`);
      }
      throw new Error(data.error.message);
    }
    
    console.log('Message sent successfully:', data.messages?.[0]?.id);
    return data;
    
  } catch (error: any) {
    console.error(`Send message error (attempt ${retryCount + 1}):`, error.message);
    
    // Only retry once for token errors
    if (retryCount < 1 && error.message?.includes('token')) {
      console.log('Checking token status before retry...');
      const tokenStatus = await checkTokenStatus();
      
      if (!tokenStatus.isValid) {
        await notifyTokenExpiry(tokenStatus);
        throw new Error('Token expired - manual refresh required');
      }
    }
    
    throw error;
  }
}

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(body: string, headers: any): boolean {
  const signature = headers['x-hub-signature-256'];
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', APP_SECRET)
    .update(body)
    .digest('hex');

  return signature === `sha256=${expectedSignature}`;
}

/**
 * Notify about token expiry (implement your notification method)
 */
async function notifyTokenExpiry(tokenStatus: TokenValidationResult): Promise<void> {
  const message = tokenStatus.expiresAt
    ? `Token expires at ${new Date(tokenStatus.expiresAt * 1000).toISOString()}`
    : 'Token is invalid or expired';
    
  console.error('🚨 TOKEN ALERT:', message);
  
  // In production, you could:
  // 1. Send email notification
  // 2. Post to Slack
  // 3. Create monitoring alert
  // 4. Log to external service
  
  // Example: Log to monitoring service
  try {
    // await fetch('your-monitoring-endpoint', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     alert: 'WhatsApp Token Expiry',
    //     message: message,
    //     severity: 'high',
    //     tokenStatus: tokenStatus
    //   })
    // });
  } catch (error) {
    console.error('Failed to send token expiry notification:', error);
  }
}

export { handler };