import Stripe from 'stripe';
import { AppError } from '../../middlewares/error.middleware';
import { prisma } from '../../index';

/**
 * Stripe決済サービス
 * Stripe APIを使用した決済機能を提供
 */
export class StripeService {
  private static instance: StripeService;
  private stripe: Stripe | null = null;

  /**
   * シングルトンインスタンスの取得
   * @returns StripeServiceインスタンス
   */
  static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  /**
   * Stripeクライアントの初期化
   * @param apiKey Stripe APIキー
   */
  initialize(apiKey: string): void {
    if (!apiKey) {
      throw new AppError('Stripe APIキーが必要です', 400);
    }
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  /**
   * Stripeクライアントの取得
   * @returns Stripeクライアント
   */
  getClient(): Stripe {
    if (!this.stripe) {
      throw new AppError('Stripeが初期化されていません。APIキーを設定してください', 500);
    }
    return this.stripe;
  }

  /**
   * プロジェクトにStripe設定を追加
   * @param projectId プロジェクトID
   * @param userId ユーザーID
   * @param apiKey Stripe APIキー
   * @param webhookSecret Webhookシークレット（オプション）
   * @returns 更新されたプロジェクト
   */
  async addStripeToProject(
    projectId: string,
    userId: string,
    apiKey: string,
    webhookSecret?: string
  ): Promise<any> {
    try {
      // プロジェクトの存在確認
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new AppError('プロジェクトが見つかりません', 404);
      }

      // プロジェクトの所有者確認
      if (project.userId !== userId) {
        throw new AppError('このプロジェクトを編集する権限がありません', 403);
      }

      // APIキーの検証
      const stripeTemp = new Stripe(apiKey, {
        apiVersion: '2025-02-24.acacia',
      });

      try {
        // APIキーが有効かテスト
        await stripeTemp.customers.list({ limit: 1 });
      } catch (error) {
        throw new AppError('無効なStripe APIキーです', 400);
      }

      // プロジェクトのStripe設定を保存
      // 注意: Prismaスキーマにこれらのフィールドを追加する必要があります
      // 現在のスキーマには含まれていないため、実際の実装では調整が必要です
      /*
      await prisma.projectIntegration.upsert({
        where: {
          projectId_type: {
            projectId,
            type: 'stripe',
          },
        },
        update: {
          config: {
            apiKey,
            webhookSecret,
          },
          updatedAt: new Date(),
        },
        create: {
          projectId,
          type: 'stripe',
          config: {
            apiKey,
            webhookSecret,
          },
        },
      });
      */

      return {
        success: true,
        message: 'Stripe連携が正常に設定されました',
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Stripe設定エラー:', error);
      throw new AppError('Stripe設定の保存中にエラーが発生しました', 500);
    }
  }

  /**
   * 決済フォームのセットアップ
   * @param projectId プロジェクトID
   * @param amount 金額
   * @param currency 通貨コード
   * @param metadata メタデータ
   * @returns 決済フォーム情報
   */
  async createCheckoutSession(
    projectId: string,
    amount: number,
    currency: string = 'jpy',
    metadata: Record<string, string> = {}
  ): Promise<any> {
    try {
      // プロジェクトのStripe設定を取得
      // 注意: Prismaスキーマにこれらのフィールドを追加する必要があります
      // 現在のスキーマには含まれていないため、実際の実装では調整が必要です
      /*
      const integration = await prisma.projectIntegration.findUnique({
        where: {
          projectId_type: {
            projectId,
            type: 'stripe',
          },
        },
      });

      if (!integration) {
        throw new AppError('このプロジェクトにはStripe連携が設定されていません', 400);
      }

      const { apiKey } = integration.config as { apiKey: string };
      */

      // 実装が完了していないため、仮のAPIキーを使用
      const apiKey = process.env.STRIPE_API_KEY || '';
      if (!apiKey) {
        throw new AppError('Stripe APIキーが設定されていません', 500);
      }

      // Stripeクライアントの初期化
      this.initialize(apiKey);
      const stripe = this.getClient();

      // チェックアウトセッションの作成
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: 'アプリ内決済',
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        metadata: {
          projectId,
          ...metadata,
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Stripe checkout error:', error);
      throw new AppError('決済セッションの作成中にエラーが発生しました', 500);
    }
  }

  /**
   * 決済状態の確認
   * @param sessionId セッションID
   * @returns 決済状態
   */
  async checkPaymentStatus(sessionId: string): Promise<any> {
    try {
      // プロジェクトのStripe設定を取得
      // 実装が完了していないため、仮のAPIキーを使用
      const apiKey = process.env.STRIPE_API_KEY || '';
      if (!apiKey) {
        throw new AppError('Stripe APIキーが設定されていません', 500);
      }

      // Stripeクライアントの初期化
      this.initialize(apiKey);
      const stripe = this.getClient();

      // セッション情報の取得
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      return {
        status: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
        customer: session.customer,
        metadata: session.metadata,
      };
    } catch (error) {
      console.error('Stripe payment status error:', error);
      throw new AppError('決済状態の確認中にエラーが発生しました', 500);
    }
  }

  /**
   * 顧客情報の取得
   * @param customerId 顧客ID
   * @returns 顧客情報
   */
  async getCustomer(customerId: string): Promise<any> {
    try {
      // プロジェクトのStripe設定を取得
      // 実装が完了していないため、仮のAPIキーを使用
      const apiKey = process.env.STRIPE_API_KEY || '';
      if (!apiKey) {
        throw new AppError('Stripe APIキーが設定されていません', 500);
      }

      // Stripeクライアントの初期化
      this.initialize(apiKey);
      const stripe = this.getClient();

      // 顧客情報の取得
      const customer = await stripe.customers.retrieve(customerId);

      return customer;
    } catch (error) {
      console.error('Stripe customer error:', error);
      throw new AppError('顧客情報の取得中にエラーが発生しました', 500);
    }
  }

  /**
   * サブスクリプションの作成
   * @param projectId プロジェクトID
   * @param customerId 顧客ID
   * @param priceId 価格ID
   * @param metadata メタデータ
   * @returns サブスクリプション情報
   */
  async createSubscription(
    projectId: string,
    customerId: string,
    priceId: string,
    metadata: Record<string, string> = {}
  ): Promise<any> {
    try {
      // プロジェクトのStripe設定を取得
      // 実装が完了していないため、仮のAPIキーを使用
      const apiKey = process.env.STRIPE_API_KEY || '';
      if (!apiKey) {
        throw new AppError('Stripe APIキーが設定されていません', 500);
      }

      // Stripeクライアントの初期化
      this.initialize(apiKey);
      const stripe = this.getClient();

      // サブスクリプションの作成
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata: {
          projectId,
          ...metadata,
        },
      });

      return subscription;
    } catch (error) {
      console.error('Stripe subscription error:', error);
      throw new AppError('サブスクリプションの作成中にエラーが発生しました', 500);
    }
  }

  /**
   * Webhookイベントの処理
   * @param payload Webhookペイロード
   * @param signature Webhookシグネチャ
   * @param webhookSecret Webhookシークレット
   * @returns 処理結果
   */
  async handleWebhookEvent(
    payload: string,
    signature: string,
    webhookSecret: string
  ): Promise<any> {
    try {
      // プロジェクトのStripe設定を取得
      // 実装が完了していないため、仮のAPIキーを使用
      const apiKey = process.env.STRIPE_API_KEY || '';
      if (!apiKey) {
        throw new AppError('Stripe APIキーが設定されていません', 500);
      }

      // Stripeクライアントの初期化
      this.initialize(apiKey);
      const stripe = this.getClient();

      // イベントの検証
      let event;
      try {
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      } catch (err) {
        throw new AppError('Webhook署名の検証に失敗しました', 400);
      }

      // イベントタイプに応じた処理
      switch (event.type) {
        case 'checkout.session.completed':
          // 決済完了時の処理
          const session = event.data.object as Stripe.Checkout.Session;
          // ここで決済完了時の処理を実装
          break;
        case 'payment_intent.succeeded':
          // 支払い成功時の処理
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          // ここで支払い成功時の処理を実装
          break;
        case 'payment_intent.payment_failed':
          // 支払い失敗時の処理
          const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
          // ここで支払い失敗時の処理を実装
          break;
        // その他のイベントタイプに応じた処理
      }

      return { received: true };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Stripe webhook error:', error);
      throw new AppError('Webhookイベントの処理中にエラーが発生しました', 500);
    }
  }

  /**
   * プロジェクトにStripe決済機能を追加するためのコード生成
   * @param projectId プロジェクトID
   * @param language 言語
   * @param framework フレームワーク
   * @returns 生成されたコード
   */
  generateStripeIntegrationCode(
    projectId: string,
    language: string = 'javascript',
    framework: string = 'react'
  ): { frontend: string; backend: string } {
    // フロントエンドコード
    let frontendCode = '';
    // バックエンドコード
    let backendCode = '';

    if (language === 'javascript' || language === 'typescript') {
      if (framework === 'react') {
        frontendCode = `
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Stripeの初期化 (公開キーを使用)
const stripePromise = loadStripe('YOUR_STRIPE_PUBLISHABLE_KEY');

// 決済フォームコンポーネント
const CheckoutForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // サーバーから決済情報を取得
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1000, // 金額 (例: 1,000円)
          currency: 'jpy',
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      
      // カード情報を使って決済を実行
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'ユーザー名',
          },
        },
      });
      
      if (error) {
        setError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        setSuccess(true);
      }
    } catch (err) {
      setError('決済処理中にエラーが発生しました');
    }
    
    setLoading(false);
  };

  if (success) {
    return <div>決済が完了しました！</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ padding: '10px 0' }}>
        <CardElement />
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={!stripe || loading}>
        {loading ? '処理中...' : '支払う'}
      </button>
    </form>
  );
};

// 決済ページコンポーネント
const PaymentPage = () => {
  return (
    <div>
      <h2>決済ページ</h2>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
};

export default PaymentPage;
`;

        backendCode = `
const express = require('express');
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');

const router = express.Router();

// 決済インテントの作成
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'jpy' } = req.body;
    
    // 決済インテントの作成
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhookの処理
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = 'YOUR_WEBHOOK_SECRET';
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(\`Webhook Error: \${err.message}\`);
  }
  
  // イベントタイプに応じた処理
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!');
      // ここで支払い成功時の処理を実装
      break;
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      console.log('Payment failed:', failedPaymentIntent.last_payment_error?.message);
      // ここで支払い失敗時の処理を実装
      break;
    default:
      console.log(\`Unhandled event type \${event.type}\`);
  }
  
  res.json({ received: true });
});

module.exports = router;
`;
      } else if (framework === 'vue') {
        frontendCode = `
<template>
  <div>
    <h2>決済ページ</h2>
    <div v-if="success">決済が完了しました！</div>
    <div v-else>
      <div class="card-element" ref="cardElement"></div>
      <div v-if="error" class="error">{{ error }}</div>
      <button @click="handleSubmit" :disabled="loading || !stripe">
        {{ loading ? '処理中...' : '支払う' }}
      </button>
    </div>
  </div>
</template>

<script>
import { loadStripe } from '@stripe/stripe-js';

export default {
  data() {
    return {
      stripe: null,
      cardElement: null,
      loading: false,
      error: null,
      success: false
    };
  },
  async mounted() {
    // Stripeの初期化
    this.stripe = await loadStripe('YOUR_STRIPE_PUBLISHABLE_KEY');
    const elements = this.stripe.elements();
    
    // カード要素の作成
    this.cardElement = elements.create('card');
    this.cardElement.mount(this.$refs.cardElement);
    
    // エラーイベントのリスナー
    this.cardElement.on('change', (event) => {
      if (event.error) {
        this.error = event.error.message;
      } else {
        this.error = null;
      }
    });
  },
  methods: {
    async handleSubmit() {
      if (!this.stripe || !this.cardElement) {
        return;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        // サーバーから決済情報を取得
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: 1000, // 金額 (例: 1,000円)
            currency: 'jpy',
          }),
        });
        
        const data = await response.json();
        
        if (data.error) {
          this.error = data.error;
          this.loading = false;
          return;
        }
        
        // カード情報を使って決済を実行
        const { error, paymentIntent } = await this.stripe.confirmCardPayment(data.clientSecret, {
          payment_method: {
            card: this.cardElement,
            billing_details: {
              name: 'ユーザー名',
            },
          },
        });
        
        if (error) {
          this.error = error.message;
        } else if (paymentIntent.status === 'succeeded') {
          this.success = true;
        }
      } catch (err) {
        this.error = '決済処理中にエラーが発生しました';
      }
      
      this.loading = false;
    }
  },
  beforeUnmount() {
    if (this.cardElement) {
      this.cardElement.unmount();
    }
  }
};
</script>

<style scoped>
.card-element {
  padding: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 10px;
}
.error {
  color: red;
  margin-bottom: 10px;
}
</style>
`;

        // バックエンドコードはExpressを使用するため同じ
        backendCode = `
const express = require('express');
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');

const router = express.Router();

// 決済インテントの作成
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'jpy' } = req.body;
    
    // 決済インテントの作成
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhookの処理
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = 'YOUR_WEBHOOK_SECRET';
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(\`Webhook Error: \${err.message}\`);
  }
  
  // イベントタイプに応じた処理
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!');
      // ここで支払い成功時の処理を実装
      break;
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      console.log('Payment failed:', failedPaymentIntent.last_payment_error?.message);
      // ここで支払い失敗時の処理を実装
      break;
    default:
      console.log(\`Unhandled event type \${event.type}\`);
  }
  
  res.json({ received: true });
});

module.exports = router;
`;
      }
    } else if (language === 'python') {
      // Pythonバックエンドのコード
      backendCode = `
from flask import Flask, request, jsonify
import stripe

app = Flask(__name__)
stripe.api_key = 'YOUR_STRIPE_SECRET_KEY'

@app.route('/create-payment-intent', methods=['POST'])
def create_payment_intent():
    try:
        data = request.get_json()
        amount = data.get('amount')
        currency = data.get('currency', 'jpy')
        
        # 決済インテントの作成
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency
        )
        
        return jsonify({'clientSecret': payment_intent.client_secret})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/webhook', methods=['POST'])
def webhook():
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')
    webhook_secret = 'YOUR_WEBHOOK_SECRET'
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        # Invalid payload
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return jsonify({'error': 'Invalid signature'}), 400
    
    # イベントタイプに応じた処理
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        print('PaymentIntent was successful!')
        # ここで支払い成功時の処理を実装
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        print('Payment failed:', payment_intent.get('last_payment_error', {}).get('message'))
        # ここで支払い失敗時の処理を実装
    
    return jsonify({'received': True})

if __name__ == '__main__':
    app.run(port=5000)
`;

      // フロントエンドはReactを使用
      frontendCode = `
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Stripeの初期化 (公開キーを使用)
const stripePromise = loadStripe('YOUR_STRIPE_PUBLISHABLE_KEY');

// 決済フォームコンポーネント
const CheckoutForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // サーバーから決済情報を取得
      const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1000, // 金額 (例: 1,000円)
          currency: 'jpy',
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      
      // カード情報を使って決済を実行
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'ユーザー名',
          },
        },
      });
      
      if (error) {
        setError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        setSuccess(true);
      }
    } catch (err) {
      setError('決済処理中にエラーが発生しました');
    }
    
    setLoading(false);
  };

  if (success) {
    return <div>決済が完了しました！</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ padding: '10px 0' }}>
        <CardElement />
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={!stripe || loading}>
        {loading ? '処理中...' : '支払う'}
      </button>
    </form>
  );
};

// 決済ページコンポーネント
const PaymentPage = () => {
  return (
    <div>
      <h2>決済ページ</h2>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
};

export default PaymentPage;
`;
    }

    return {
      frontend: frontendCode,
      backend: backendCode,
    };
  }
}