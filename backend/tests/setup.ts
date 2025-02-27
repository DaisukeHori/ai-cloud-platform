// テスト環境のセットアップ
import dotenv from 'dotenv';

// 環境変数のロード
dotenv.config();

// モックの設定
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    projectFile: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    projectCollaborator: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    deployment: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    chatMessage: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// OpenAI APIのモック
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: 'モックされたAI応答',
                },
              },
            ],
          }),
        },
      },
    })),
  };
});

// Anthropic APIのモック
jest.mock('@anthropic-ai/sdk', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [
            {
              type: 'text',
              text: 'モックされたAI応答',
            },
          ],
        }),
      },
    })),
  };
});

// Axiosのモック
jest.mock('axios', () => {
  return {
    post: jest.fn().mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: 'モックされたAI応答',
            },
          },
        ],
      },
    }),
    get: jest.fn().mockResolvedValue({
      data: {},
    }),
    create: jest.fn().mockReturnValue({
      post: jest.fn().mockResolvedValue({
        data: {},
      }),
      get: jest.fn().mockResolvedValue({
        data: {},
      }),
    }),
  };
});

// AWS Bedrockのモック
jest.mock('@aws-sdk/client-bedrock-runtime', () => {
  const mockSend = jest.fn().mockResolvedValue({
    body: Buffer.from(
      JSON.stringify({
        content: [{ text: 'モックされたAI応答' }],
        generation: 'モックされたAI応答',
        results: [{ outputText: 'モックされたAI応答' }],
        generations: [{ text: 'モックされたAI応答' }],
      })
    ),
  });

  return {
    BedrockRuntimeClient: jest.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    InvokeModelCommand: jest.fn().mockImplementation((params) => params),
  };
});

// Stripeのモック
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      list: jest.fn().mockResolvedValue({ data: [] }),
      retrieve: jest.fn().mockResolvedValue({}),
    },
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'test_session_id',
          url: 'https://test-checkout-url.com',
        }),
        retrieve: jest.fn().mockResolvedValue({
          payment_status: 'paid',
          amount_total: 1000,
          currency: 'jpy',
          customer: 'cus_test',
          metadata: {},
        }),
      },
    },
    subscriptions: {
      create: jest.fn().mockResolvedValue({}),
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {},
        },
      }),
    },
  }));
});

// グローバルなモック
global.console = {
  ...console,
  error: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// テスト後のクリーンアップ
afterAll(() => {
  jest.clearAllMocks();
});