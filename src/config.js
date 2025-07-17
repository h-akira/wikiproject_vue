// WikiProject アプリケーション設定
export const config = {
  // アプリケーション基本設定
  app: {
    name: process.env.VUE_APP_NAME || 'WikiProject',
    version: '1.0.0',
    description: 'Modern Wiki Application with Cognito Authentication'
  },

  // API設定
  api: {
    baseURL: process.env.VUE_APP_API_BASE_URL || (
      process.env.NODE_ENV === 'production' 
        ? 'https://your-api-gateway-url.execute-api.ap-northeast-1.amazonaws.com/prod'
        : 'http://localhost:3000'
    ),
    timeout: 10000,
    withCredentials: true, // Cognitoクッキー認証のため
    endpoints: {
      // 認証関連
      auth: {
        urls: '/api/auth/urls',
        tokenExchange: '/api/auth/token',
        status: '/api/auth/status',
        logout: '/api/auth/logout'
      },
      // Wiki記事関連
      wiki: {
        articles: '/api/wiki/articles',
        articleDetail: '/api/wiki/articles/:id'
      },
      // 共有関連
      share: {
        article: '/api/share/:shareId'
      },
      // ストレージ関連
      storage: {
        upload: '/api/storage/upload',
        fileDetail: '/api/storage/files/:fileId'
      }
    }
  },

  // 認証設定
  auth: {
    // 認証方式: Cognitoマネージドログインページ
    provider: 'cognito-managed',
    // 認証状態の確認間隔（ミリ秒）
    statusCheckInterval: 300000, // 5分
    // 認証が必要なルート
    protectedRoutes: ['/create', '/edit', '/storage'],
    // 認証後のデフォルトリダイレクト先
    defaultRedirectAfterLogin: '/',
    // ログアウト後のリダイレクト先
    defaultRedirectAfterLogout: '/login'
  },

  // UI設定
  ui: {
    // サイドバー設定
    sidebar: {
      defaultOpen: false,
      width: '250px'
    },
    // エディタ設定
    editor: {
      spellChecker: false,
      codeSyntaxHighlighting: true,
      toolbar: [
        'bold', 'italic', 'heading', '|',
        'quote', 'unordered-list', 'ordered-list', '|',
        'link', 'image', 'table', '|',
        'code', 'horizontal-rule', '|',
        'preview', 'side-by-side', 'fullscreen', '|',
        'guide'
      ]
    },
    // テーマ設定
    theme: {
      primaryColor: '#3273dc',
      framework: 'bulma'
    }
  },

  // ストレージ設定
  storage: {
    // アップロード設定
    upload: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'text/markdown',
        'application/json', 'text/csv'
      ],
      chunkSize: 1024 * 1024 // 1MB chunks
    }
  },

  // デバッグ設定
  debug: {
    enabled: process.env.NODE_ENV === 'development',
    logLevel: process.env.VUE_APP_LOG_LEVEL || 'info',
    showApiRequests: process.env.NODE_ENV === 'development'
  }
}

// 設定検証関数
export function validateConfig() {
  const errors = []

  // 必要な環境変数のチェック
  if (!config.api.baseURL) {
    errors.push('API Base URL is not configured')
  }

  if (errors.length > 0) {
    console.error('Configuration errors:', errors)
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`)
  }

  return true
}

// エンドポイントURL生成ヘルパー
export function getEndpointURL(path, params = {}) {
  let url = config.api.baseURL + path
  
  // パラメータ置換（:id → 実際の値）
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key])
  })
  
  return url
}

// 開発時のデバッグ出力
if (config.debug.enabled) {
  console.log('WikiProject Configuration:', config)
  validateConfig()
} 