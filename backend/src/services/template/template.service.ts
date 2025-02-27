import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../../index';
import { AppError } from '../../middlewares/error.middleware';

/**
 * テンプレートサービス
 * プロジェクトテンプレートの管理と適用を行う
 */
export class TemplateService {
  // テンプレートの種類
  static readonly TEMPLATE_TYPES = {
    REACT_SPA: 'react-spa',
    REACT_NEXT: 'react-next',
    NODE_EXPRESS: 'node-express',
    PYTHON_FLASK: 'python-flask',
    STATIC_HTML: 'static-html',
    BLOG: 'blog',
    ECOMMERCE: 'ecommerce',
    DASHBOARD: 'dashboard',
    CHAT_APP: 'chat-app',
  };

  /**
   * 利用可能なテンプレート一覧を取得
   * @returns テンプレート一覧
   */
  static async getTemplates(): Promise<Template[]> {
    // 実際の実装では、テンプレートをDBから取得するか、ファイルシステムから読み込む
    return [
      {
        id: this.TEMPLATE_TYPES.REACT_SPA,
        name: 'React SPA',
        description: 'React + React Router + Chakra UIを使用したシングルページアプリケーション',
        category: 'frontend',
        tags: ['react', 'spa', 'chakra-ui'],
        thumbnail: '/templates/react-spa.png',
      },
      {
        id: this.TEMPLATE_TYPES.REACT_NEXT,
        name: 'Next.js App',
        description: 'Next.jsを使用したReactアプリケーション（SSRサポート）',
        category: 'fullstack',
        tags: ['react', 'next.js', 'ssr'],
        thumbnail: '/templates/react-next.png',
      },
      {
        id: this.TEMPLATE_TYPES.NODE_EXPRESS,
        name: 'Node.js API',
        description: 'Express.jsを使用したRESTful API',
        category: 'backend',
        tags: ['node.js', 'express', 'api'],
        thumbnail: '/templates/node-express.png',
      },
      {
        id: this.TEMPLATE_TYPES.PYTHON_FLASK,
        name: 'Python Flask API',
        description: 'Flaskを使用したPython RESTful API',
        category: 'backend',
        tags: ['python', 'flask', 'api'],
        thumbnail: '/templates/python-flask.png',
      },
      {
        id: this.TEMPLATE_TYPES.STATIC_HTML,
        name: 'Static HTML/CSS/JS',
        description: '基本的なHTML/CSS/JavaScriptのウェブサイト',
        category: 'frontend',
        tags: ['html', 'css', 'javascript'],
        thumbnail: '/templates/static-html.png',
      },
      {
        id: this.TEMPLATE_TYPES.BLOG,
        name: 'ブログサイト',
        description: 'マークダウン対応のシンプルなブログサイト',
        category: 'fullstack',
        tags: ['blog', 'markdown', 'react'],
        thumbnail: '/templates/blog.png',
      },
      {
        id: this.TEMPLATE_TYPES.ECOMMERCE,
        name: 'ECサイト',
        description: '基本的なECサイト（商品一覧、詳細、カート機能）',
        category: 'fullstack',
        tags: ['ecommerce', 'react', 'node.js'],
        thumbnail: '/templates/ecommerce.png',
      },
      {
        id: this.TEMPLATE_TYPES.DASHBOARD,
        name: '管理ダッシュボード',
        description: 'データ可視化とユーザー管理機能を備えた管理画面',
        category: 'fullstack',
        tags: ['dashboard', 'charts', 'admin'],
        thumbnail: '/templates/dashboard.png',
      },
      {
        id: this.TEMPLATE_TYPES.CHAT_APP,
        name: 'チャットアプリ',
        description: 'リアルタイムチャット機能を備えたアプリケーション',
        category: 'fullstack',
        tags: ['chat', 'socket.io', 'realtime'],
        thumbnail: '/templates/chat-app.png',
      },
    ];
  }

  /**
   * テンプレートの詳細を取得
   * @param templateId テンプレートID
   * @returns テンプレート詳細
   */
  static async getTemplateDetails(templateId: string): Promise<TemplateDetails> {
    const templates = await this.getTemplates();
    const template = templates.find((t) => t.id === templateId);

    if (!template) {
      throw new AppError('テンプレートが見つかりません', 404);
    }

    // テンプレートの詳細情報（実際の実装ではDBから取得）
    const details: TemplateDetails = {
      ...template,
      features: [],
      dependencies: {},
      structure: [],
    };

    // テンプレートごとの詳細情報を設定
    switch (templateId) {
      case this.TEMPLATE_TYPES.REACT_SPA:
        details.features = [
          'React Router によるルーティング',
          'Chakra UI コンポーネント',
          'レスポンシブデザイン',
          'ダークモード対応',
        ];
        details.dependencies = {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
          'react-router-dom': '^6.21.3',
          '@chakra-ui/react': '^2.8.2',
          '@emotion/react': '^11.11.3',
          '@emotion/styled': '^11.11.0',
          'framer-motion': '^10.18.0',
        };
        details.structure = [
          'src/components - 再利用可能なコンポーネント',
          'src/pages - ページコンポーネント',
          'src/contexts - Reactコンテキスト',
          'src/hooks - カスタムフック',
          'src/utils - ユーティリティ関数',
        ];
        break;

      case this.TEMPLATE_TYPES.NODE_EXPRESS:
        details.features = [
          'RESTful API エンドポイント',
          'ミドルウェアによるエラーハンドリング',
          'JWT認証',
          'Prisma ORMによるデータベース操作',
        ];
        details.dependencies = {
          express: '^4.18.2',
          'express-validator': '^7.0.1',
          'jsonwebtoken': '^9.0.2',
          '@prisma/client': '^5.7.1',
          bcryptjs: '^2.4.3',
          cors: '^2.8.5',
          dotenv: '^16.3.1',
          morgan: '^1.10.0',
        };
        details.structure = [
          'src/controllers - ルートハンドラ',
          'src/middlewares - ミドルウェア',
          'src/routes - ルート定義',
          'src/services - ビジネスロジック',
          'src/models - データモデル',
          'src/utils - ユーティリティ関数',
        ];
        break;

      // 他のテンプレートも同様に設定
    }

    return details;
  }

  /**
   * テンプレートからプロジェクトを作成
   * @param userId ユーザーID
   * @param templateId テンプレートID
   * @param projectName プロジェクト名
   * @param description 説明
   * @returns 作成されたプロジェクト
   */
  static async createProjectFromTemplate(
    userId: string,
    templateId: string,
    projectName: string,
    description?: string
  ): Promise<any> {
    try {
      // テンプレートの存在確認
      const templates = await this.getTemplates();
      const template = templates.find((t) => t.id === templateId);

      if (!template) {
        throw new AppError('テンプレートが見つかりません', 404);
      }

      // プロジェクトの作成
      const project = await prisma.project.create({
        data: {
          name: projectName,
          description,
          userId,
          status: 'active',
        },
      });

      // テンプレートファイルの取得
      const templateFiles = await this.getTemplateFiles(templateId);

      // ファイルの作成
      const rootDir = await prisma.projectFile.create({
        data: {
          name: 'root',
          path: '/',
          content: '',
          type: 'directory',
          projectId: project.id,
        },
      });

      // テンプレートファイルをプロジェクトに追加
      for (const file of templateFiles) {
        await prisma.projectFile.create({
          data: {
            name: path.basename(file.path),
            path: file.path,
            content: file.content,
            type: file.type,
            projectId: project.id,
            parentId: rootDir.id,
          },
        });
      }

      return project;
    } catch (error) {
      console.error('Template project creation error:', error);
      throw new AppError('テンプレートからのプロジェクト作成に失敗しました', 500);
    }
  }

  /**
   * テンプレートファイルの取得
   * @param templateId テンプレートID
   * @returns テンプレートファイル
   */
  private static async getTemplateFiles(templateId: string): Promise<TemplateFile[]> {
    // 実際の実装では、テンプレートファイルをDBから取得するか、ファイルシステムから読み込む
    // ここでは簡易的な実装として、テンプレートIDに応じたファイルを返す
    const files: TemplateFile[] = [];

    switch (templateId) {
      case this.TEMPLATE_TYPES.REACT_SPA:
        files.push(
          {
            path: '/index.html',
            content: `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React SPA</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`,
            type: 'file',
          },
          {
            path: '/src/main.jsx',
            content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
)`,
            type: 'file',
          },
          {
            path: '/src/App.jsx',
            content: `import { Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import Home from './pages/Home'
import About from './pages/About'
import Layout from './components/Layout'

function App() {
  return (
    <Box>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </Box>
  )
}

export default App`,
            type: 'file',
          },
          {
            path: '/src/index.css',
            content: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`,
            type: 'file',
          },
          {
            path: '/src/components/Layout.jsx',
            content: `import { Box, Container, Flex } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

function Layout() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      <Container as="main" maxW="container.xl" flex="1" py={8}>
        <Outlet />
      </Container>
      <Footer />
    </Box>
  )
}

export default Layout`,
            type: 'file',
          },
          {
            path: '/src/components/Navbar.jsx',
            content: `import { Box, Flex, Link, Button, useColorMode } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'

function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Box as="nav" bg="brand.500" color="white" px={4} py={3}>
      <Flex maxW="container.xl" mx="auto" align="center" justify="space-between">
        <Flex align="center">
          <Link as={RouterLink} to="/" fontSize="xl" fontWeight="bold" mr={8}>
            React SPA
          </Link>
          <Link as={RouterLink} to="/" mr={4}>
            Home
          </Link>
          <Link as={RouterLink} to="/about" mr={4}>
            About
          </Link>
        </Flex>
        <Button onClick={toggleColorMode} size="sm">
          {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        </Button>
      </Flex>
    </Box>
  )
}

export default Navbar`,
            type: 'file',
          },
          {
            path: '/src/components/Footer.jsx',
            content: `import { Box, Text } from '@chakra-ui/react'

function Footer() {
  return (
    <Box as="footer" bg="gray.100" color="gray.700" py={4} textAlign="center">
      <Text>&copy; {new Date().getFullYear()} React SPA Template. All rights reserved.</Text>
    </Box>
  )
}

export default Footer`,
            type: 'file',
          },
          {
            path: '/src/pages/Home.jsx',
            content: `import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react'

function Home() {
  return (
    <VStack spacing={8} align="center" py={10}>
      <Heading as="h1" size="2xl">Welcome to React SPA</Heading>
      <Text fontSize="xl" textAlign="center" maxW="container.md">
        This is a template for a React Single Page Application with Chakra UI and React Router.
      </Text>
      <Button colorScheme="blue" size="lg">Get Started</Button>
    </VStack>
  )
}

export default Home`,
            type: 'file',
          },
          {
            path: '/src/pages/About.jsx',
            content: `import { Box, Heading, Text, VStack } from '@chakra-ui/react'

function About() {
  return (
    <VStack spacing={6} align="start">
      <Heading as="h1">About</Heading>
      <Text>
        This is the about page of our React SPA template.
        You can customize this page to include information about your project or organization.
      </Text>
      <Text>
        The template includes React Router for navigation, Chakra UI for styling,
        and a responsive layout that works on all devices.
      </Text>
    </VStack>
  )
}

export default About`,
            type: 'file',
          },
          {
            path: '/package.json',
            content: `{
  "name": "react-spa-template",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@chakra-ui/icons": "^2.1.1",
    "@chakra-ui/react": "^2.8.2",
    "@emotion/react": "^11.11.3",
    "@emotion/styled": "^11.11.0",
    "framer-motion": "^10.18.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}`,
            type: 'file',
          },
          {
            path: '/vite.config.js',
            content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,
            type: 'file',
          }
        );
        break;

      // 他のテンプレートも同様に設定
      case this.TEMPLATE_TYPES.STATIC_HTML:
        files.push(
          {
            path: '/index.html',
            content: `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Static HTML Template</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <nav>
      <div class="logo">Static HTML</div>
      <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section class="hero">
      <h1>Welcome to Static HTML Template</h1>
      <p>A simple and clean HTML/CSS/JS template to start your project</p>
      <button class="btn">Get Started</button>
    </section>

    <section class="features">
      <h2>Features</h2>
      <div class="feature-grid">
        <div class="feature">
          <h3>Responsive Design</h3>
          <p>Works on all devices and screen sizes</p>
        </div>
        <div class="feature">
          <h3>Clean Code</h3>
          <p>Well-structured HTML, CSS, and JavaScript</p>
        </div>
        <div class="feature">
          <h3>Easy to Customize</h3>
          <p>Simple to modify and extend</p>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <p>&copy; 2025 Static HTML Template. All rights reserved.</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>`,
            type: 'file',
          },
          {
            path: '/style.css',
            content: `/* Base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
}

a {
  text-decoration: none;
  color: #333;
}

ul {
  list-style: none;
}

/* Header and Navigation */
header {
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #0066cc;
}

.nav-links {
  display: flex;
}

.nav-links li {
  margin-left: 2rem;
}

.nav-links a:hover {
  color: #0066cc;
}

/* Main content */
main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 4rem 0;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #666;
}

.btn {
  display: inline-block;
  background-color: #0066cc;
  color: #fff;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #0052a3;
}

/* Features section */
.features {
  padding: 4rem 0;
}

.features h2 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature {
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}

.feature h3 {
  margin-bottom: 1rem;
  color: #0066cc;
}

/* Footer */
footer {
  background-color: #f5f5f5;
  text-align: center;
  padding: 2rem;
  margin-top: 2rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .hero h1 {
    font-size: 2rem;
  }
  
  .hero p {
    font-size: 1rem;
  }
}`,
            type: 'file',
          },
          {
            path: '/script.js',
            content: `// JavaScript for the Static HTML Template
document.addEventListener('DOMContentLoaded', () => {
  console.log('Static HTML Template loaded');
  
  // Example: Add click event to the button
  const button = document.querySelector('.btn');
  if (button) {
    button.addEventListener('click', () => {
      alert('Button clicked! Add your custom functionality here.');
    });
  }
  
  // Example: Simple animation for features
  const features = document.querySelectorAll('.feature');
  features.forEach((feature, index) => {
    setTimeout(() => {
      feature.style.opacity = '0';
      feature.style.transform = 'translateY(20px)';
      feature.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      
      setTimeout(() => {
        feature.style.opacity = '1';
        feature.style.transform = 'translateY(0)';
      }, 100);
    }, index * 200);
  });
});`,
            type: 'file',
          },
          {
            path: '/about.html',
            content: `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About - Static HTML Template</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <nav>
      <div class="logo">Static HTML</div>
      <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section>
      <h1>About Us</h1>
      <p>This is the about page of our static HTML template. You can customize this page to include information about your project or organization.</p>
      <p>The template includes responsive design, clean HTML/CSS structure, and basic JavaScript functionality.</p>
    </section>
  </main>

  <footer>
    <p>&copy; 2025 Static HTML Template. All rights reserved.</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>`,
            type: 'file',
          },
          {
            path: '/contact.html',
            content: `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact - Static HTML Template</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <nav>
      <div class="logo">Static HTML</div>
      <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section>
      <h1>Contact Us</h1>
      <form id="contact-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" name="name" required>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" name="message" rows="5" required></textarea>
        </div>
        <button type="submit" class="btn">Send Message</button>
      </form>
    </section>
  </main>

  <footer>
    <p>&copy; 2025 Static HTML Template. All rights reserved.</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>`,
            type: 'file',
          }
        );
        break;

      // 他のテンプレートも同様に設定
    }

    return files;
  }
}

/**
 * テンプレート情報
 */
interface Template {
  id: string;
  name: string;
  description: string;
  category: 'frontend' | 'backend' | 'fullstack';
  tags: string[];
  thumbnail: string;
}

/**
 * テンプレート詳細情報
 */
interface TemplateDetails extends Template {
  features: string[];
  dependencies: Record<string, string>;
  structure: string[];
}

/**
 * テンプレートファイル
 */
interface TemplateFile {
  path: string;
  content: string;
  type: 'file' | 'directory';
}