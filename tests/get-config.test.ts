import { handler } from '../netlify/functions/get-config';
import { HandlerEvent, HandlerContext } from '@netlify/functions';

describe('Get Config Handler', () => {
  const mockContext: HandlerContext = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'get-config',
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

  const mockEvent: HandlerEvent = {
    rawUrl: 'https://test.com/.netlify/functions/get-config',
    rawQuery: '',
    path: '/.netlify/functions/get-config',
    httpMethod: 'GET',
    headers: {
      host: 'test.netlify.app',
    },
    multiValueHeaders: {},
    queryStringParameters: {},
    multiValueQueryStringParameters: {},
    body: null,
    isBase64Encoded: false,
  };

  beforeEach(() => {
    // Reset environment variables
    delete process.env.PHONE_NUMBER_ID;
    delete process.env.SYSTEM_USER_ACCESS_TOKEN;
    delete process.env.WEBHOOK_VERIFY_TOKEN;
    delete process.env.APP_SECRET;
    delete process.env.APP_ID;
  });

  it('should return configuration with all environment variables set', async () => {
    // Set all environment variables
    process.env.PHONE_NUMBER_ID = '123456789';
    process.env.SYSTEM_USER_ACCESS_TOKEN = 'test-token';
    process.env.WEBHOOK_VERIFY_TOKEN = 'verify-token';
    process.env.APP_SECRET = 'app-secret';
    process.env.APP_ID = 'app-123';

    const response = await handler(mockEvent, mockContext);
    const config = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(config.phoneNumberId).toBe('123456789');
    expect(config.accessToken).toBe('test-token');
    expect(config.webhookVerifyToken).toBe('verify-token');
    expect(config.appSecret).toBe('app-secret');
    expect(config.appId).toBe('app-123');
    expect(config.configured).toBe(true);
    expect(config.missingVars).toEqual([]);
  });

  it('should return configuration with missing variables noted', async () => {
    // Set only some environment variables
    process.env.PHONE_NUMBER_ID = '123456789';

    const response = await handler(mockEvent, mockContext);
    const config = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(config.phoneNumberId).toBe('123456789');
    expect(config.accessToken).toBe('');
    expect(config.configured).toBe(false);
    expect(config.missingVars).toContain('SYSTEM_USER_ACCESS_TOKEN');
    expect(config.missingVars).toContain('WEBHOOK_VERIFY_TOKEN');
  });

  it('should include correct webhook URL', async () => {
    const response = await handler(mockEvent, mockContext);
    const config = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(config.webhookUrl).toBe('https://test.netlify.app/webhook');
  });

  it('should include CORS headers', async () => {
    const response = await handler(mockEvent, mockContext);

    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(response.headers['Access-Control-Allow-Headers']).toBe('Content-Type');
    expect(response.headers['Content-Type']).toBe('application/json');
  });

  it('should indicate token type', async () => {
    process.env.SYSTEM_USER_ACCESS_TOKEN = 'test-token';

    const response = await handler(mockEvent, mockContext);
    const config = JSON.parse(response.body);

    expect(config.hasToken).toBe(true);
    expect(config.tokenType).toBe('system_user');
  });

  it('should handle missing host header gracefully', async () => {
    const eventWithoutHost: HandlerEvent = {
      ...mockEvent,
      headers: {},
    };

    const response = await handler(eventWithoutHost, mockContext);
    const config = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(config.webhookUrl).toBe('https://dtc-webhook.netlify.app/webhook');
  });
});