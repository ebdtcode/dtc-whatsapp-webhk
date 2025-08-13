import { Handler, HandlerEvent } from '@netlify/functions';

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '';
const ACCESS_TOKEN = process.env.SYSTEM_USER_ACCESS_TOKEN || '';
const API_BASE = 'https://graph.facebook.com/v17.0';

interface PropertyListing {
  id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  features: string[];
  images: PropertyImage[];
  contactNumber: string;
}

interface PropertyImage {
  url: string;
  caption: string;
  order: number;
}

interface SendOptions {
  recipient: string;
  property: PropertyListing;
  sendDelay?: number; // Delay between images in ms
  includeDetails?: boolean;
}

/**
 * Send property listing with multiple images via WhatsApp
 */
const handler: Handler = async (event: HandlerEvent) => {
  // Enable CORS
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
    const payload: SendOptions = JSON.parse(event.body || '{}');
    
    if (!payload.recipient || !payload.property) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing recipient or property data' })
      };
    }

    const results = await sendPropertyListing(payload);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        results,
        summary: {
          total: results.length,
          sent: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      })
    };
  } catch (error: any) {
    console.error('Error sending property listing:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to send property listing',
        details: error.message 
      })
    };
  }
};

/**
 * Send complete property listing with images
 */
async function sendPropertyListing(options: SendOptions): Promise<any[]> {
  const { recipient, property, sendDelay = 1000, includeDetails = true } = options;
  const results: any[] = [];

  try {
    // Step 1: Send property details as text message
    if (includeDetails) {
      const detailsMessage = formatPropertyDetails(property);
      const detailsResult = await sendWhatsAppMessage(recipient, 'text', {
        text: { body: detailsMessage }
      });
      results.push({
        type: 'details',
        success: !!detailsResult.messages,
        messageId: detailsResult.messages?.[0]?.id,
        error: detailsResult.error
      });
      
      // Small delay after details
      await delay(sendDelay);
    }

    // Step 2: Send location if available
    if (property.location) {
      const locationResult = await sendLocationMessage(recipient, property.location);
      results.push({
        type: 'location',
        success: !!locationResult.messages,
        messageId: locationResult.messages?.[0]?.id,
        error: locationResult.error
      });
      
      await delay(sendDelay);
    }

    // Step 3: Send images in sequence
    const sortedImages = property.images.sort((a, b) => a.order - b.order);
    
    for (const image of sortedImages) {
      try {
        // Validate image URL
        if (!isValidImageUrl(image.url)) {
          results.push({
            type: 'image',
            success: false,
            error: `Invalid image URL: ${image.url}`,
            caption: image.caption
          });
          continue;
        }

        // Send image with caption
        const imageResult = await sendWhatsAppMessage(recipient, 'image', {
          image: {
            link: image.url,
            caption: formatImageCaption(image.caption, property)
          }
        });

        results.push({
          type: 'image',
          success: !!imageResult.messages,
          messageId: imageResult.messages?.[0]?.id,
          caption: image.caption,
          url: image.url,
          error: imageResult.error
        });

        // Delay between images to avoid rate limiting
        if (sendDelay > 0 && sortedImages.indexOf(image) < sortedImages.length - 1) {
          await delay(sendDelay);
        }
      } catch (imageError: any) {
        console.error(`Failed to send image ${image.caption}:`, imageError);
        results.push({
          type: 'image',
          success: false,
          caption: image.caption,
          error: imageError.message
        });
      }
    }

    // Step 4: Send contact button (interactive message)
    if (property.contactNumber) {
      const contactResult = await sendContactButton(recipient, property);
      results.push({
        type: 'contact',
        success: !!contactResult.messages,
        messageId: contactResult.messages?.[0]?.id,
        error: contactResult.error
      });
    }

  } catch (error: any) {
    console.error('Error in sendPropertyListing:', error);
    throw error;
  }

  return results;
}

/**
 * Send WhatsApp message
 */
async function sendWhatsAppMessage(to: string, type: string, content: any): Promise<any> {
  try {
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

    const data = await response.json();
    
    if (!response.ok) {
      console.error('WhatsApp API error:', data);
    }
    
    return data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

/**
 * Send location message
 */
async function sendLocationMessage(to: string, location: string): Promise<any> {
  // Parse location coordinates if provided
  // Format: "latitude,longitude" or just address text
  const coords = parseCoordinates(location);
  
  if (coords) {
    return sendWhatsAppMessage(to, 'location', {
      location: {
        latitude: coords.lat,
        longitude: coords.lng,
        name: 'Property Location',
        address: location
      }
    });
  } else {
    // Send as text if no coordinates
    return sendWhatsAppMessage(to, 'text', {
      text: { body: `📍 Location: ${location}` }
    });
  }
}

/**
 * Send interactive contact button
 */
async function sendContactButton(to: string, property: PropertyListing): Promise<any> {
  return sendWhatsAppMessage(to, 'interactive', {
    interactive: {
      type: 'button',
      body: {
        text: `Interested in ${property.title}? Contact us for more information.`
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: `inquire_${property.id}`,
              title: 'Request Info'
            }
          },
          {
            type: 'reply',
            reply: {
              id: `schedule_${property.id}`,
              title: 'Schedule Viewing'
            }
          }
        ]
      }
    }
  });
}

/**
 * Format property details for text message
 */
function formatPropertyDetails(property: PropertyListing): string {
  let message = `🏠 *${property.title}*\n\n`;
  message += `💰 Price: ${property.price}\n`;
  message += `📍 Location: ${property.location}\n\n`;
  message += `${property.description}\n\n`;
  
  if (property.features && property.features.length > 0) {
    message += `✨ Features:\n`;
    property.features.forEach(feature => {
      message += `• ${feature}\n`;
    });
  }
  
  message += `\n📸 ${property.images.length} photos following...`;
  
  return message;
}

/**
 * Format image caption with property context
 */
function formatImageCaption(caption: string, property: PropertyListing): string {
  // Add property reference to maintain context
  return `${caption}\n🏠 ${property.title} - ${property.price}`;
}

/**
 * Validate image URL
 */
function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Must be HTTPS
    if (parsed.protocol !== 'https:') return false;
    // Check for image extensions or common image hosting patterns
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
    const imageHosts = /(cloudinary|imgur|s3|googleapis|blob\.core|drive\.google)/i;
    return imageExtensions.test(parsed.pathname) || imageHosts.test(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * Parse coordinates from location string
 */
function parseCoordinates(location: string): { lat: string; lng: string } | null {
  // Try to parse "lat,lng" format
  const match = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (match) {
    return { lat: match[1], lng: match[2] };
  }
  return null;
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { handler };