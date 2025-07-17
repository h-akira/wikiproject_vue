const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  
  // 本番環境では絶対パス、開発環境では相対パス
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  
  // 本番ビルド設定
  productionSourceMap: false,
  
  // PWA設定（必要に応じて）
  pwa: {
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true
    }
  },
  
  // ビルド出力設定
  outputDir: 'dist',
  assetsDir: 'static',
  
  // 開発サーバー設定
  devServer: {
    port: 8080,
    host: 'localhost',
    // SPA用のhistoryモード対応
    historyApiFallback: {
      index: '/index.html'
    }
  },
  
  // Webpack設定のカスタマイズ
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          common: {
            name: 'chunk-common',
            minChunks: 2,
            priority: 5,
            chunks: 'initial'
          }
        }
      }
    }
  }
})
