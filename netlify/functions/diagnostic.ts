import { Handler, HandlerEvent } from '@netlify/functions';

const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || '';
const ACCESS_TOKEN = process.env.SYSTEM_USER_ACCESS_TOKEN || process.env.ACCESS_TOKEN || '';
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '';
const APP_SECRET = process.env.APP_SECRET || '';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  timestamp: string;
}

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, headers } = event;

  // Enable CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  if (httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const diagnostics: DiagnosticResult[] = [];

  // Test 1: Check environment variables
  diagnostics.push({
    test: 'Environment Variables',
    status: WEBHOOK_VERIFY_TOKEN && ACCESS_TOKEN && PHONE_NUMBER_ID ? 'pass' : 'fail',
    details: `Webhook Token: ${WEBHOOK_VERIFY_TOKEN ? 'Set' : 'Missing'}, ` +
             `Access Token: ${ACCESS_TOKEN ? 'Set' : 'Missing'}, ` +
             `Phone Number ID: ${PHONE_NUMBER_ID ? 'Set' : 'Missing'}`,
    timestamp: new Date().toISOString()
  });

  // Test 2: Token validation
  if (ACCESS_TOKEN) {
    try {
      const tokenResponse = await fetch(
        `https://graph.facebook.com/v17.0/debug_token?input_token=${ACCESS_TOKEN}&access_token=${ACCESS_TOKEN}`
      );
      const tokenData = await tokenResponse.json();
      
      diagnostics.push({
        test: 'Access Token Validation',
        status: tokenData.data?.is_valid ? 'pass' : 'fail',
        details: tokenData.data?.is_valid ? 
          `Token valid, Type: ${tokenData.data.type}, App ID: ${tokenData.data.app_id}` :
          `Token invalid: ${tokenData.error?.message || 'Unknown error'}`,
        timestamp: new Date().toISOString()
      });

      // Check scopes
      if (tokenData.data?.scopes) {
        const hasWhatsApp = tokenData.data.scopes.includes('whatsapp_business_messaging');
        diagnostics.push({
          test: 'WhatsApp Permissions',
          status: hasWhatsApp ? 'pass' : 'fail',
          details: hasWhatsApp ? 
            `Has WhatsApp permissions (${tokenData.data.scopes.length} total scopes)` :
            `Missing WhatsApp permissions. Current scopes: ${tokenData.data.scopes.join(', ')}`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      diagnostics.push({
        test: 'Access Token Validation',
        status: 'fail',
        details: `Error validating token: ${error}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Test 3: Phone Number verification
  if (PHONE_NUMBER_ID && ACCESS_TOKEN) {
    try {
      const phoneResponse = await fetch(
        `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}?access_token=${ACCESS_TOKEN}`
      );
      const phoneData = await phoneResponse.json();
      
      diagnostics.push({
        test: 'Phone Number Verification',
        status: phoneData.id ? 'pass' : 'fail',
        details: phoneData.id ? 
          `Valid Phone Number: ${phoneData.display_phone_number || PHONE_NUMBER_ID}` :
          `Invalid Phone Number: ${phoneData.error?.message || 'Unknown error'}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      diagnostics.push({
        test: 'Phone Number Verification',
        status: 'fail',
        details: `Error verifying phone number: ${error}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Test 4: Webhook configuration
  diagnostics.push({
    test: 'Webhook Configuration',
    status: WEBHOOK_VERIFY_TOKEN ? 'pass' : 'fail',
    details: WEBHOOK_VERIFY_TOKEN ? 
      'Webhook token configured and ready' : 
      'Webhook token not configured',
    timestamp: new Date().toISOString()
  });

  // Test 5: App Secret
  diagnostics.push({
    test: 'Signature Verification',
    status: APP_SECRET ? 'pass' : 'warning',
    details: APP_SECRET ? 
      'App secret configured for signature verification' : 
      'App secret not set - signatures cannot be verified',
    timestamp: new Date().toISOString()
  });

  // Calculate summary
  const summary = {
    total: diagnostics.length,
    passed: diagnostics.filter(d => d.status === 'pass').length,
    failed: diagnostics.filter(d => d.status === 'fail').length,
    warnings: diagnostics.filter(d => d.status === 'warning').length,
    timestamp: new Date().toISOString(),
    recommendations: generateRecommendations(diagnostics)
  };

  return {
    statusCode: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: summary.failed === 0 ? 'healthy' : 'issues_detected',
      summary,
      diagnostics,
      webhook_url: `${event.headers.host || 'dtc-webhook.netlify.app'}/webhook`,
      api_version: 'v17.0'
    }, null, 2)
  };
};

function generateRecommendations(diagnostics: DiagnosticResult[]): string[] {
  const recommendations: string[] = [];

  diagnostics.forEach(diag => {
    if (diag.status === 'fail') {
      switch (diag.test) {
        case 'Environment Variables':
          recommendations.push('Set missing environment variables in Netlify dashboard');
          break;
        case 'Access Token Validation':
          recommendations.push('Generate a new access token or use System User token');
          break;
        case 'WhatsApp Permissions':
          recommendations.push('Add whatsapp_business_messaging permission to your token');
          break;
        case 'Phone Number Verification':
          recommendations.push('Verify your Phone Number ID in Facebook Developer Console');
          break;
        case 'Webhook Configuration':
          recommendations.push('Set WEBHOOK_VERIFY_TOKEN environment variable');
          break;
      }
    }
  });

  if (recommendations.length === 0) {
    recommendations.push('All systems operational. Ready to send and receive messages.');
  }

  return recommendations;
}

export { handler };