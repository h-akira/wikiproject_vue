// WikiProject アプリケーション設定
export const config = {
  // アプリケーション基本設定
  app: {
    name: 'WikiProject2',
    version: '1.0.0',
    description: 'Modern Wiki Application with Cognito Authentication'
  },

  // API設定
  api: {
    baseURL: '', // CloudFrontで同一ドメイン配信のため相対パス
    timeout: 10000,
    withCredentials: true, // Cognitoクッキー認証のため
    endpoints: {
      // 認証関連
      tokenExchange: '/api/auth/token',
      authStatus: '/api/auth/status',
      logout: '/api/auth/logout',
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

  // Cognito設定
  cognito: {
    // CognitoマネージドログインページのURL（環境変数から取得）
    loginURL: (() => {
      const loginURL = process.env.VUE_APP_COGNITO_LOGIN_URL;
      if (!loginURL) {
        throw new Error('環境変数 VUE_APP_COGNITO_LOGIN_URL が設定されていません');
      }
      return loginURL;
    })(),
    // CognitoマネージドサインアップページのURL（環境変数から取得）
    signupURL: (() => {
      const signupURL = process.env.VUE_APP_COGNITO_SIGNUP_URL;
      if (!signupURL) {
        throw new Error('環境変数 VUE_APP_COGNITO_SIGNUP_URL が設定されていません');
      }
      return signupURL;
    })()
  },

  // 認証設定
  auth: {
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