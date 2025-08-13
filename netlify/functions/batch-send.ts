import { Handler, HandlerEvent } from '@netlify/functions';

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '';
const ACCESS_TOKEN = process.env.SYSTEM_USER_ACCESS_TOKEN || '';
const API_BASE = 'https://graph.facebook.com/v17.0';

// Rate limiting configuration
const RATE_LIMIT = {
  messagesPerSecond: 10,  // WhatsApp limit
  messagesPerMinute: 60,  // Conservative limit
  messagesPerHour: 1000,  // WhatsApp business limit
};

interface BatchMessage {
  recipients: string[];
  messageType: 'text' | 'image' | 'document' | 'template';
  content: any;
  options?: {
    delayBetweenSends?: number;  // ms between each send
    continueOnError?: boolean;   // Continue if one fails
    trackDelivery?: boolean;     // Track delivery status
  };
}

interface BatchImageMessage {
  recipients: string[];
  images: Array<{
    url: string;
    caption?: string;
  }>;
  options?: {
    delayBetweenImages?: number;  // ms between images
    delayBetweenRecipients?: number; // ms between recipients
    sendAsAlbum?: boolean;  // Group images (future feature)
  };
}

interface BatchResult {
  recipient: string;
  success: boolean;
  messageIds?: string[];
  error?: string;
  timestamp: string;
}

/**
 * Batch message sender with rate limiting
 */
const handler: Handler = async (event: HandlerEvent) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { type, data } = payload;

    let results: BatchResult[] = [];

    switch (type) {
      case 'single':
        results = await sendBatchMessages(data as BatchMessage);
        break;
      case 'images':
        results = await sendBatchImages(data as BatchImageMessage);
        break;
      case 'broadcast':
        results = await broadcastMessage(data);
        break;
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid batch type' })
        };
    }

    // Calculate summary statistics
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      deliveryRate: `${((results.filter(r => r.success).length / results.length) * 100).toFixed(1)}%`
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        summary,
        results,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error: any) {
    console.error('Batch send error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Batch send failed',
        details: error.message
      })
    };
  }
};

/**
 * Send same message to multiple recipients
 */
async function sendBatchMessages(batch: BatchMessage): Promise<BatchResult[]> {
  const {
    recipients,
    messageType,
    content,
    options = {}
  } = batch;

  const {
    delayBetweenSends = 100,  // 100ms default
    continueOnError = true
  } = options;

  const results: BatchResult[] = [];
  const rateLimiter = new RateLimiter();

  for (const recipient of recipients) {
    try {
      // Rate limiting
      await rateLimiter.waitForSlot();

      // Send message
      const response = await sendMessage(recipient, messageType, content);
      
      results.push({
        recipient,
        success: !!response.messages,
        messageIds: response.messages?.map((m: any) => m.id),
        error: response.error?.message,
        timestamp: new Date().toISOString()
      });

      // Delay between sends
      if (delayBetweenSends > 0) {
        await delay(delayBetweenSends);
      }

    } catch (error: any) {
      console.error(`Failed to send to ${recipient}:`, error);
      
      results.push({
        recipient,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      if (!continueOnError) {
        throw error;
      }
    }
  }

  return results;
}

/**
 * Send multiple images to multiple recipients
 */
async function sendBatchImages(batch: BatchImageMessage): Promise<BatchResult[]> {
  const {
    recipients,
    images,
    options = {}
  } = batch;

  const {
    delayBetweenImages = 500,
    delayBetweenRecipients = 1000
  } = options;

  const results: BatchResult[] = [];
  const rateLimiter = new RateLimiter();

  for (const recipient of recipients) {
    const messageIds: string[] = [];
    let hasError = false;
    let errorMessage = '';

    try {
      // Send each image
      for (const image of images) {
        await rateLimiter.waitForSlot();

        const response = await sendMessage(recipient, 'image', {
          image: {
            link: image.url,
            caption: image.caption || ''
          }
        });

        if (response.messages) {
          messageIds.push(...response.messages.map((m: any) => m.id));
        } else if (response.error) {
          hasError = true;
          errorMessage = response.error.message;
          break;  // Stop sending more images to this recipient
        }

        // Delay between images
        if (delayBetweenImages > 0 && images.indexOf(image) < images.length - 1) {
          await delay(delayBetweenImages);
        }
      }

      results.push({
        recipient,
        success: !hasError && messageIds.length > 0,
        messageIds,
        error: errorMessage || undefined,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error(`Failed batch images to ${recipient}:`, error);
      results.push({
        recipient,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    // Delay between recipients
    if (delayBetweenRecipients > 0 && recipients.indexOf(recipient) < recipients.length - 1) {
      await delay(delayBetweenRecipients);
    }
  }

  return results;
}

/**
 * Broadcast template message to large audience
 */
async function broadcastMessage(data: any): Promise<BatchResult[]> {
  const { recipients, template, parameters = {} } = data;
  const results: BatchResult[] = [];
  const rateLimiter = new RateLimiter();

  // Use template for broadcasts (better for large audiences)
  const templateContent = {
    template: {
      name: template,
      language: { code: 'en_US' },
      components: parameters.components || []
    }
  };

  // Process in batches to avoid overwhelming the API
  const batchSize = 10;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    // Send batch in parallel
    const batchPromises = batch.map(async (recipient: string) => {
      await rateLimiter.waitForSlot();
      
      try {
        const response = await sendMessage(recipient, 'template', templateContent);
        return {
          recipient,
          success: !!response.messages,
          messageIds: response.messages?.map((m: any) => m.id),
          error: response.error?.message,
          timestamp: new Date().toISOString()
        };
      } catch (error: any) {
        return {
          recipient,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Delay between batches
    if (i + batchSize < recipients.length) {
      await delay(1000);  // 1 second between batches
    }
  }

  return results;
}

/**
 * Send individual message
 */
async function sendMessage(to: string, type: string, content: any): Promise<any> {
  const response = await fetch(`${API_BASE}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type,
      ...content
    })
  });

  return await response.json();
}

/**
 * Simple rate limiter
 */
class RateLimiter {
  private lastSendTime = 0;
  private messageCount = 0;
  private minuteStart = Date.now();
  private hourStart = Date.now();
  private messagesThisMinute = 0;
  private messagesThisHour = 0;

  async waitForSlot(): Promise<void> {
    const now = Date.now();

    // Reset counters if needed
    if (now - this.minuteStart > 60000) {
      this.minuteStart = now;
      this.messagesThisMinute = 0;
    }
    if (now - this.hourStart > 3600000) {
      this.hourStart = now;
      this.messagesThisHour = 0;
    }

    // Check rate limits
    if (this.messagesThisMinute >= RATE_LIMIT.messagesPerMinute) {
      const waitTime = 60000 - (now - this.minuteStart);
      await delay(waitTime);
      this.minuteStart = Date.now();
      this.messagesThisMinute = 0;
    }

    if (this.messagesThisHour >= RATE_LIMIT.messagesPerHour) {
      const waitTime = 3600000 - (now - this.hourStart);
      console.log(`Hour limit reached, waiting ${waitTime}ms`);
      await delay(waitTime);
      this.hourStart = Date.now();
      this.messagesThisHour = 0;
    }

    // Ensure minimum delay between messages
    const timeSinceLastSend = now - this.lastSendTime;
    const minDelay = 1000 / RATE_LIMIT.messagesPerSecond;
    
    if (timeSinceLastSend < minDelay) {
      await delay(minDelay - timeSinceLastSend);
    }

    this.lastSendTime = Date.now();
    this.messagesThisMinute++;
    this.messagesThisHour++;
  }
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { handler };