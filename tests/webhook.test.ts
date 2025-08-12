import { handler } from '../netlify/functions/webhook';
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

describe('Webhook Handler', () => {
  const mockContext: HandlerContext = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'webhook',
    functionVersion: '1',
    invokedFunctionArn: '',
    memoryLimitInMB: '128',
    awsRequestId: '',
    logGroupName: '',
    logStreamName: '',
    getRemainingTimeInMillis: () => 1000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };

  beforeEach(() => {
    // Reset environment variables
    process.env.WEBHOOK_VERIFY_TOKEN = 'test-verify-token';
    process.env.APP_SECRET = 'test-app-secret';
    process.env.SYSTEM_USER_ACCESS_TOKEN = 'test-access-token';
    process.env.PHONE_NUMBER_ID = '123456789';
  });

  describe('GET requests (webhook verification)', () => {
    it('should verify webhook with correct token', async () => {
      const event: HandlerEvent = {
        rawUrl: 'https://test.com/webhook',
        rawQuery: '',
        path: '/webhook',
        httpMethod: 'GET',
        headers: {},
        multiValueHeaders: {},
        queryStringParameters: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'test-verify-token',
          'hub.challenge': 'test-challenge-123',
        },
        multiValueQueryStringParameters: {},
        body: null,
        isBase64Encoded: false,
      };

      const response = await handler(event, mockContext);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe('test-challenge-123');
    });

    it('should reject webhook with incorrect token', async () => {
      const event: HandlerEvent = {
        rawUrl: 'https://test.com/webhook',
        rawQuery: '',
        path: '/webhook',
        httpMethod: 'GET',
        headers: {},
        multiValueHeaders: {},
        queryStringParameters: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'wrong-token',
          'hub.challenge': 'test-challenge-123',
        },
        multiValueQueryStringParameters: {},
        body: null,
        isBase64Encoded: false,
      };

      const response = await handler(event, mockContext);

      expect(response.statusCode).toBe(403);
      expect(response.body).toBe('Forbidden - Token mismatch');
    });

    it('should reject webhook with missing parameters', async () => {
      const event: HandlerEvent = {
        rawUrl: 'https://test.com/webhook',
        rawQuery: '',
        path: '/webhook',
        httpMethod: 'GET',
        headers: {},
        multiValueHeaders: {},
        queryStringParameters: {
          'hub.mode': 'subscribe',
        },
        multiValueQueryStringParameters: {},
        body: null,
        isBase64Encoded: false,
      };

      const response = await handler(event, mockContext);

      expect(response.statusCode).toBe(400);
      expect(response.body).toBe('Bad Request - Missing parameters');
    });
  });

  describe('POST requests (message handling)', () => {
    it('should accept valid WhatsApp message', async () => {
      const messageBody = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: '123456789',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '15551234567',
                    phone_number_id: '123456789',
                  },
                  messages: [
                    {
                      from: '27823456789',
                      id: 'msg_id_123',
                      timestamp: '1234567890',
                      text: {
                        body: 'Hello, World!',
                      },
                      type: 'text',
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const event: HandlerEvent = {
        rawUrl: 'https://test.com/webhook',
        rawQuery: '',
        path: '/webhook',
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        multiValueHeaders: {},
        queryStringParameters: {},
        multiValueQueryStringParameters: {},
        body: JSON.stringify(messageBody),
        isBase64Encoded: false,
      };

      const response = await handler(event, mockContext);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe('EVENT_RECEIVED');
    });

    it('should handle status updates', async () => {
      const statusBody = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: '123456789',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '15551234567',
                    phone_number_id: '123456789',
                  },
                  statuses: [
                    {
                      id: 'msg_id_123',
                      status: 'delivered',
                      timestamp: '1234567890',
                      recipient_id: '27823456789',
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const event: HandlerEvent = {
        rawUrl: 'https://test.com/webhook',
        rawQuery: '',
        path: '/webhook',
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        multiValueHeaders: {},
        queryStringParameters: {},
        multiValueQueryStringParameters: {},
        body: JSON.stringify(statusBody),
        isBase64Encoded: false,
      };

      const response = await handler(event, mockContext);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe('EVENT_RECEIVED');
    });

    it('should reject invalid JSON body', async () => {
      const event: HandlerEvent = {
        rawUrl: 'https://test.com/webhook',
        rawQuery: '',
        path: '/webhook',
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        multiValueHeaders: {},
        queryStringParameters: {},
        multiValueQueryStringParameters: {},
        body: 'invalid json',
        isBase64Encoded: false,
      };

      const response = await handler(event, mockContext);

      expect(response.statusCode).toBe(400);
      expect(response.body).toContain('Invalid JSON');
    });
  });

  describe('Unsupported methods', () => {
    it('should reject PUT requests', async () => {
      const event: HandlerEvent = {
        rawUrl: 'https://test.com/webhook',
        rawQuery: '',
        path: '/webhook',
        httpMethod: 'PUT',
        headers: {},
        multiValueHeaders: {},
        queryStringParameters: {},
        multiValueQueryStringParameters: {},
        body: null,
        isBase64Encoded: false,
      };

      const response = await handler(event, mockContext);

      expect(response.statusCode).toBe(405);
      expect(response.body).toBe('Method Not Allowed');
    });

    it('should reject DELETE requests', async () => {
      const event: HandlerEvent = {
        rawUrl: 'https://test.com/webhook',
        rawQuery: '',
        path: '/webhook',
        httpMethod: 'DELETE',
        headers: {},
        multiValueHeaders: {},
        queryStringParameters: {},
        multiValueQueryStringParameters: {},
        body: null,
        isBase64Encoded: false,
      };

      const response = await handler(event, mockContext);

      expect(response.statusCode).toBe(405);
      expect(response.body).toBe('Method Not Allowed');
    });
  });
});