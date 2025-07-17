# WikiProject Vue Frontend

WikiProject_stgをVue.jsで再構築したモダンなWikiアプリケーションのフロントエンドです。

## 機能

- **認証システム**: AWS Cognitoマネージドログインページによるセキュアな認証
- **Wiki記事管理**: 記事の作成・編集・閲覧・削除
- **共有機能**: 共有IDによる記事の公開閲覧
- **ファイルストレージ**: S3を利用したファイルアップロード・管理
- **Markdownサポート**: リッチなコンテンツ作成
- **レスポンシブデザイン**: モバイル対応

## 技術スタック

- **Vue.js 3**: Composition API対応
- **Vue Router 4**: SPA routing
- **Vuex 4**: 状態管理
- **Bulma**: CSS フレームワーク
- **EasyMDE**: Markdownエディタ
- **Marked**: Markdownパーサー
- **Highlight.js**: シンタックスハイライト
- **Axios**: HTTP クライアント
- **AWS Cognito**: 認証・認可

## 設定システム

### 設定ファイル (`src/config.js`)

アプリケーションの設定は `src/config.js` で中央管理されています。hadx_simple_appの形式を踏襲した構造になっています。

```javascript
export const config = {
  // アプリケーション基本設定
  app: { name, version, description },
  
  // API設定（エンドポイント、タイムアウト等）
  api: { baseURL, endpoints: { auth, wiki, share, storage } },
  
  // 認証設定（プロバイダー、リダイレクト先等）
  auth: { provider, protectedRoutes, redirects },
  
  // UI設定（サイドバー、エディタ、テーマ等）
  ui: { sidebar, editor, theme },
  
  // ストレージ設定（アップロード制限等）
  storage: { upload: { maxFileSize, allowedTypes } },
  
  // デバッグ設定
  debug: { enabled, logLevel, showApiRequests }
}
```

### ヘルパー関数

- `validateConfig()`: 設定の検証
- `getEndpointURL(path, params)`: パラメータ付きURL生成

### 使用例

```javascript
import { config, getEndpointURL } from './config'

// エンドポイントURL取得
const url = getEndpointURL(config.api.endpoints.wiki.articleDetail, { id: '123' })
// → '/api/wiki/articles/123'

// 設定値の参照
const maxFileSize = config.storage.upload.maxFileSize
const editorConfig = config.ui.editor
```

## 認証システム（Cognitoマネージドログインページ）

このアプリケーションは、AWS Cognitoのマネージドログインページを使用したセキュアな認証システムを採用しています。

### 認証フロー

```
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐
│   ユーザー    │    │  Vue Frontend   │    │  Backend API    │    │   Cognito    │
└─────────────┘    └─────────────────┘    └─────────────────┘    └──────────────┘
       │                      │                      │                     │
       │ 1. ログインボタンクリック │                      │                     │
       ├──────────────────────▶│                      │                     │
       │                      │ 2. 認証URL取得       │                     │
       │                      ├─────────────────────▶│                     │
       │                      │                      │                     │
       │                      │ 3. login_url         │                     │
       │                      │◀─────────────────────┤                     │
       │                      │                      │                     │
       │ 4. Cognitoページリダイレクト│                      │                     │
       │◀─────────────────────┤                      │                     │
       │                      │                      │                     │
       │ 5. ユーザー認証        │                      │                     │
       ├──────────────────────────────────────────────────────────────────▶│
       │                      │                      │                     │
       │ 6. 認証コード付きリダイレクト │                      │                     │
       │◀──────────────────────────────────────────────────────────────────┤
       │                      │                      │                     │
       │                      │ 7. 認証コード送信     │                     │
       │                      ├─────────────────────▶│                     │
       │                      │                      │ 8. トークン交換      │
       │                      │                      ├──────────────────────▶│
       │                      │                      │                     │
       │                      │                      │ 9. JWT tokens        │
       │                      │                      │◀──────────────────────┤
       │                      │                      │                     │
       │                      │ 10. クッキー設定      │                     │
       │                      │◀─────────────────────┤                     │
       │                      │                      │                     │
       │ 11. ホームページリダイレクト│                      │                     │
       │◀─────────────────────┤                      │                     │
```

### 認証の特徴

- **セキュリティ**: AWS Cognitoの堅牢なセキュリティ基盤を活用
- **マネージド**: ログイン画面はAWSが提供・保守
- **HttpOnly Cookie**: XSS攻撃を防ぐセキュアなクッキー認証
- **自動リフレッシュ**: トークンの自動更新でシームレスな体験
- **外部認証対応**: Cognitoの設定により、Google、Facebook等とも連携可能

### 認証API

| エンドポイント | メソッド | 説明 |
|----------------|----------|------|
| `/api/auth/urls` | GET | Cognitoログイン・サインアップURLを取得 |
| `/api/auth/token` | POST | 認証コードをJWTトークンに交換 |
| `/api/auth/status` | GET | 現在の認証状態を確認 |
| `/api/auth/logout` | POST | ログアウト処理 |

## 開発環境のセットアップ

### 前提条件

- Node.js 16以上
- npm または yarn
- 動作するバックエンドAPI（AWS Lambda + API Gateway）

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run serve

# ビルド（本番用）
npm run build

# Lint チェック
npm run lint
```

## プロジェクト構造

```
src/
├── components/          # 再利用可能なコンポーネント
│   └── layout/         # レイアウト関連コンポーネント
├── views/              # ページコンポーネント
│   ├── auth/           # 認証関連ページ
│   ├── wiki/           # Wiki関連ページ
│   └── storage/        # ファイルストレージページ
├── store/              # Vuex ストア
│   └── modules/        # ストアモジュール
│     ├── auth.js       # 認証状態管理
│     ├── wiki.js       # Wiki記事管理
│     └── storage.js    # ファイルストレージ管理
├── router/             # Vue Router設定
├── assets/             # 静的ファイル
├── config.js           # アプリケーション設定（中央管理）
└── main.js             # エントリーポイント
```

## 環境変数

### 設定ファイル

以下の環境変数を設定してください。`.env.local` または `.env.development` / `.env.production` ファイルで管理します。

```bash
# API ベースURL（バックエンドAPI）
VUE_APP_API_BASE_URL=https://your-api-gateway-url.execute-api.ap-northeast-1.amazonaws.com/prod

# 開発環境用
# VUE_APP_API_BASE_URL=http://localhost:3000

# アプリケーション名
VUE_APP_NAME=WikiProject

# ログレベル（開発時のみ）
VUE_APP_LOG_LEVEL=info
```

### 環境変数ファイルの例

`.env.development`:
```bash
VUE_APP_API_BASE_URL=http://localhost:3000
VUE_APP_NAME=WikiProject (Dev)
VUE_APP_LOG_LEVEL=debug
```

`.env.production`:
```bash
VUE_APP_API_BASE_URL=https://api.wiki2.h-akira.net
VUE_APP_NAME=WikiProject
VUE_APP_LOG_LEVEL=warn
```

## バックエンドAPI

このフロントエンドは、AWS Lambda + API Gateway + Cognitoで構築されるバックエンドAPIと連携します。

### 必要なバックエンドリソース

- AWS Cognito User Pool（認証）
- AWS Lambda Function（ビジネスロジック）
- API Gateway（APIエンドポイント）
- DynamoDB（データストレージ）
- S3（ファイルストレージ）

## デプロイメント

### 本番環境へのデプロイ

```bash
# 本番用ビルド
npm run build

# distフォルダをS3 + CloudFrontにデプロイ
# または、その他のホスティングサービスにアップロード
```

### CloudFrontでの設定

SPA（Single Page Application）として動作するため、CloudFrontで以下の設定が必要です：

- **エラーページ**: 404エラーを`/index.html`にリダイレクト
- **キャッシュ**: `/static/*`は長期キャッシュ、`/index.html`はキャッシュなし

## 開発時の注意点

### CORS設定

開発時は、バックエンドAPIでCORS設定が必要です：

```javascript
// 許可するOrigin
'http://localhost:8080'  // 開発環境
'https://wiki2.h-akira.net'  // 本番環境
```

### 認証デバッグ

認証関連の問題をデバッグする際は：

1. ブラウザのDevToolsでネットワークタブを確認
2. `/api/auth/status`のレスポンスを確認
3. Cookieが適切に設定されているかを確認
4. バックエンドのCloudWatch Logsを確認

### 設定のカスタマイズ

`src/config.js` で以下の設定をカスタマイズできます：

- **エディタ設定**: toolbar、spellChecker、codeSyntaxHighlighting
- **UI設定**: サイドバー幅、テーマカラー
- **ストレージ設定**: アップロード可能ファイルサイズ、許可する拡張子
- **認証設定**: リダイレクト先、保護されたルート

## トラブルシューティング

### 認証エラー

- Cognitoの設定でコールバックURLが正しいか確認
- バックエンドのSSMパラメータが正しく設定されているか確認
- CORS設定がフロントエンドのドメインを許可しているか確認

### API接続エラー

- `VUE_APP_API_BASE_URL`が正しく設定されているか確認
- バックエンドAPIが正常に動作しているか確認
- ネットワークタブでAPIリクエストの詳細を確認

### 設定エラー

- ブラウザコンソールで設定検証エラーがないか確認
- `config.js`の必須設定が漏れていないか確認
- 環境変数が適切に読み込まれているか確認
