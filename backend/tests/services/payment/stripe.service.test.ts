import { StripeService } from '../../../src/services/payment/stripe.service';
import { AppError } from '../../../src/middlewares/error.middleware';

// Stripeのモック
const mockStripe = {
  customers: {
    list: jest.fn(),
    retrieve: jest.fn(),
  },
  checkout: {
    sessions: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
  },
  subscriptions: {
    create: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
};

// Stripeコンストラクタのモック
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => mockStripe);
});

// prismaのモック
jest.mock('../../../src/index', () => ({
  prisma: {
    project: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    projectIntegration: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
    deployment: {
      create: jest.fn(),
      update: jest.fn(),
    },
  },
  io: {
    to: jest.fn().mockReturnValue({
      emit: jest.fn(),
    }),
  },
}));

describe('StripeService', () => {
  let stripeService: StripeService;
  
  beforeEach(() => {
    // テスト前にモックをリセット
    jest.clearAllMocks();
    
    // テスト用のサービスインスタンスを取得
    stripeService = StripeService.getInstance();
    
    // モックレスポンスの設定
    mockStripe.checkout.sessions.create.mockResolvedValue({
      id: 'test_session_id',
      url: 'https://test-checkout-url.com',
    });
    
    mockStripe.checkout.sessions.retrieve.mockResolvedValue({
      payment_status: 'paid',
      amount_total: 1000,
      currency: 'jpy',
      customer: 'cus_test',
      metadata: { projectId: 'test-project-id' },
    });
    
    mockStripe.customers.retrieve.mockResolvedValue({
      id: 'cus_test',
      email: 'test@example.com',
      name: 'Test User',
    });
    
    mockStripe.subscriptions.create.mockResolvedValue({
      id: 'sub_test',
      status: 'active',
      current_period_end: 1672531200,
    });
    
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'test_session_id',
          payment_status: 'paid',
        },
      },
    });
  });
  
  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = StripeService.getInstance();
      const instance2 = StripeService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
  
  describe('initialize', () => {
    it('should initialize Stripe client with API key', () => {
      stripeService.initialize('test-api-key');
      
      // Stripeコンストラクタが正しく呼ばれたか確認
      expect(require('stripe')).toHaveBeenCalledWith('test-api-key', {
        apiVersion: '2025-02-24.acacia',
      });
    });
    
    it('should throw error if API key is not provided', () => {
      expect(() => stripeService.initialize('')).toThrow(AppError);
      expect(() => stripeService.initialize('')).toThrow('Stripe APIキーが必要です');
    });
  });
  
  describe('getClient', () => {
    it('should return initialized Stripe client', () => {
      stripeService.initialize('test-api-key');
      const client = stripeService.getClient();
      
      expect(client).toBe(mockStripe);
    });
    
    it('should throw error if client is not initialized', () => {
      // 初期化前の状態に戻す
      stripeService = new StripeService();
      
      expect(() => stripeService.getClient()).toThrow(AppError);
      expect(() => stripeService.getClient()).toThrow('Stripeが初期化されていません');
    });
  });
  
  describe('createCheckoutSession', () => {
    beforeEach(() => {
      // Stripeクライアントを初期化
      stripeService.initialize('test-api-key');
      
      // 環境変数のモック
      process.env.FRONTEND_URL = 'http://localhost:3000';
      process.env.STRIPE_API_KEY = 'test-api-key';
    });
    
    it('should create a checkout session with correct parameters', async () => {
      const result = await stripeService.createCheckoutSession(
        'test-project-id',
        1000,
        'jpy',
        { productName: 'テスト商品' }
      );
      
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method_types: ['card'],
          line_items: [
            expect.objectContaining({
              price_data: expect.objectContaining({
                currency: 'jpy',
                unit_amount: 1000,
              }),
              quantity: 1,
            }),
          ],
          mode: 'payment',
          success_url: expect.stringContaining('http://localhost:3000/payment/success'),
          cancel_url: expect.stringContaining('http://localhost:3000/payment/cancel'),
          metadata: expect.objectContaining({
            projectId: 'test-project-id',
            productName: 'テスト商品',
          }),
        })
      );
      
      expect(result).toEqual({
        sessionId: 'test_session_id',
        url: 'https://test-checkout-url.com',
      });
    });
    
    it('should handle API errors', async () => {
      mockStripe.checkout.sessions.create.mockRejectedValue(new Error('API error'));
      
      await expect(stripeService.createCheckoutSession('test-project-id', 1000)).rejects.toThrow(AppError);
      await expect(stripeService.createCheckoutSession('test-project-id', 1000)).rejects.toThrow('決済セッションの作成中にエラーが発生しました');
    });
  });
  
  describe('checkPaymentStatus', () => {
    beforeEach(() => {
      // Stripeクライアントを初期化
      stripeService.initialize('test-api-key');
      process.env.STRIPE_API_KEY = 'test-api-key';
    });
    
    it('should retrieve payment status correctly', async () => {
      const result = await stripeService.checkPaymentStatus('test_session_id');
      
      expect(mockStripe.checkout.sessions.retrieve).toHaveBeenCalledWith('test_session_id');
      
      expect(result).toEqual({
        status: 'paid',
        amountTotal: 1000,
        currency: 'jpy',
        customer: 'cus_test',
        metadata: { projectId: 'test-project-id' },
      });
    });
    
    it('should handle API errors', async () => {
      mockStripe.checkout.sessions.retrieve.mockRejectedValue(new Error('API error'));
      
      await expect(stripeService.checkPaymentStatus('test_session_id')).rejects.toThrow(AppError);
      await expect(stripeService.checkPaymentStatus('test_session_id')).rejects.toThrow('決済状態の確認中にエラーが発生しました');
    });
  });
  
  describe('getCustomer', () => {
    beforeEach(() => {
      // Stripeクライアントを初期化
      stripeService.initialize('test-api-key');
      process.env.STRIPE_API_KEY = 'test-api-key';
    });
    
    it('should retrieve customer information correctly', async () => {
      const result = await stripeService.getCustomer('cus_test');
      
      expect(mockStripe.customers.retrieve).toHaveBeenCalledWith('cus_test');
      
      expect(result).toEqual({
        id: 'cus_test',
        email: 'test@example.com',
        name: 'Test User',
      });
    });
    
    it('should handle API errors', async () => {
      mockStripe.customers.retrieve.mockRejectedValue(new Error('API error'));
      
      await expect(stripeService.getCustomer('cus_test')).rejects.toThrow(AppError);
      await expect(stripeService.getCustomer('cus_test')).rejects.toThrow('顧客情報の取得中にエラーが発生しました');
    });
  });
  
  describe('createSubscription', () => {
    beforeEach(() => {
      // Stripeクライアントを初期化
      stripeService.initialize('test-api-key');
      process.env.STRIPE_API_KEY = 'test-api-key';
    });
    
    it('should create a subscription with correct parameters', async () => {
      const result = await stripeService.createSubscription(
        'test-project-id',
        'cus_test',
        'price_test',
        { plan: 'premium' }
      );
      
      expect(mockStripe.subscriptions.create).toHaveBeenCalledWith({
        customer: 'cus_test',
        items: [{ price: 'price_test' }],
        metadata: {
          projectId: 'test-project-id',
          plan: 'premium',
        },
      });
      
      expect(result).toEqual({
        id: 'sub_test',
        status: 'active',
        current_period_end: 1672531200,
      });
    });
    
    it('should handle API errors', async () => {
      mockStripe.subscriptions.create.mockRejectedValue(new Error('API error'));
      
      await expect(stripeService.createSubscription('test-project-id', 'cus_test', 'price_test')).rejects.toThrow(AppError);
      await expect(stripeService.createSubscription('test-project-id', 'cus_test', 'price_test')).rejects.toThrow('サブスクリプションの作成中にエラーが発生しました');
    });
  });
  
  describe('handleWebhookEvent', () => {
    beforeEach(() => {
      // Stripeクライアントを初期化
      stripeService.initialize('test-api-key');
    });
    
    it('should validate and process webhook events', async () => {
      const payload = '{"type":"checkout.session.completed"}';
      const signature = 'test-signature';
      const webhookSecret = 'test-webhook-secret';
      
      const result = await stripeService.handleWebhookEvent(payload, signature, webhookSecret);
      
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(payload, signature, webhookSecret);
      expect(result).toEqual({ received: true });
    });
    
    it('should handle signature verification errors', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });
      
      await expect(stripeService.handleWebhookEvent('payload', 'signature', 'secret')).rejects.toThrow(AppError);
      await expect(stripeService.handleWebhookEvent('payload', 'signature', 'secret')).rejects.toThrow('Webhook署名の検証に失敗しました');
    });
  });
  
  describe('generateStripeIntegrationCode', () => {
    it('should generate React integration code', () => {
      const code = stripeService.generateStripeIntegrationCode('test-project-id', 'javascript', 'react');
      
      expect(code.frontend).toContain('import { loadStripe } from \'@stripe/stripe-js\'');
      expect(code.frontend).toContain('import { Elements, CardElement, useStripe, useElements } from \'@stripe/react-stripe-js\'');
      expect(code.backend).toContain('const express = require(\'express\')');
      expect(code.backend).toContain('const stripe = require(\'stripe\')(\'YOUR_STRIPE_SECRET_KEY\')');
    });
    
    it('should generate Vue integration code', () => {
      const code = stripeService.generateStripeIntegrationCode('test-project-id', 'javascript', 'vue');
      
      expect(code.frontend).toContain('import { loadStripe } from \'@stripe/stripe-js\'');
      expect(code.frontend).toContain('<template>');
      expect(code.backend).toContain('const express = require(\'express\')');
      expect(code.backend).toContain('const stripe = require(\'stripe\')(\'YOUR_STRIPE_SECRET_KEY\')');
    });
  });
});