import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import crypto from 'crypto';

const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || '';
const APP_SECRET = process.env.APP_SECRET || '';
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || '';

interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: {
    body: string;
  };
  image?: {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  document?: {
    id: string;
    mime_type: string;
    sha256: string;
    filename?: string;
    caption?: string;
  };
  audio?: {
    id: string;
    mime_type: string;
  };
  video?: {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  [key: string]: any;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const { httpMethod, queryStringParameters, body, headers } = event;

  // Handle GET request for webhook verification
  if (httpMethod === 'GET') {
    const mode = queryStringParameters?.['hub.mode'];
    const token = queryStringParameters?.['hub.verify_token'];
    const challenge = queryStringParameters?.['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        return {
          statusCode: 200,
          body: challenge || '',
        };
      } else {
        return {
          statusCode: 403,
          body: 'Forbidden',
        };
      }
    } else {
      return {
        statusCode: 400,
        body: 'Bad Request',
      };
    }
  }

  // Handle POST request for incoming messages
  if (httpMethod === 'POST') {
    if (!body) {
      return {
        statusCode: 400,
        body: 'No body provided',
      };
    }

    // Verify webhook signature
    const signature = headers['x-hub-signature-256'];
    if (signature && APP_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', APP_SECRET)
        .update(body)
        .digest('hex');
      
      if (signature !== `sha256=${expectedSignature}`) {
        console.error('Signature verification failed');
        return {
          statusCode: 403,
          body: 'Signature verification failed',
        };
      }
    }

    try {
      const payload = JSON.parse(body);

      if (payload.object === 'whatsapp_business_account') {
        for (const entry of payload.entry || []) {
          for (const change of entry.changes || []) {
            const value = change.value;
            
            // Handle messages
            if (value.messages) {
              for (const message of value.messages) {
                await handleMessage(message);
              }
            }
            
            // Handle status updates
            if (value.statuses) {
              for (const status of value.statuses) {
                console.log('Status update:', {
                  id: status.id,
                  status: status.status,
                  timestamp: status.timestamp,
                  recipient: status.recipient_id
                });
              }
            }
          }
        }
        
        return {
          statusCode: 200,
          body: 'OK',
        };
      } else {
        return {
          statusCode: 404,
          body: 'Not a WhatsApp webhook event',
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

  // Method not allowed
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};

async function handleMessage(message: WhatsAppMessage) {
  console.log('Received message:', {
    from: message.from,
    type: message.type,
    text: message.text?.body || 'Non-text message'
  });

  // Handle different message types
  switch (message.type) {
    case 'text':
      if (message.text?.body) {
        await sendWhatsAppMessage(message.from, `Received: "${message.text.body}"`);
      }
      break;
    case 'image':
      console.log('Image received:', message.image);
      await sendWhatsAppMessage(message.from, 'Received your image');
      break;
    case 'document':
      console.log('Document received:', message.document);
      await sendWhatsAppMessage(message.from, `Received document: ${message.document?.filename || 'document'}`);
      break;
    case 'audio':
      console.log('Audio received:', message.audio);
      await sendWhatsAppMessage(message.from, 'Received your audio message');
      break;
    case 'video':
      console.log('Video received:', message.video);
      await sendWhatsAppMessage(message.from, 'Received your video');
      break;
    case 'location':
      console.log('Location received:', message.location);
      await sendWhatsAppMessage(message.from, `Received location: ${message.location?.name || 'location'}`);
      break;
    default:
      console.log('Unknown message type:', message.type);
  }
}

async function sendWhatsAppMessage(to: string, text: string): Promise<any> {
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
          text: {
            body: text
          }
        })
      }
    );
    
    const data = await response.json();
    console.log('Message sent:', data);
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export { handler };