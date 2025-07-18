import axios from 'axios'
import { config } from '@/config.js'

// Axiosインスタンス設定
const api = axios.create({
  baseURL: config.api.baseURL,
  withCredentials: true // Cookieを含める
})

export default {
  namespaced: true,
  state: {
    user: null,
    isAuthenticated: false,
    loading: false
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
      state.isAuthenticated = true
    },
    LOGOUT(state) {
      state.user = null
      state.isAuthenticated = false
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    }
  },
  actions: {
    // 認証コードをトークンに交換
    async exchangeCodeForToken({ commit }, code) {
      console.log('🔄 認証コード交換開始:', code)
      console.log('📡 API_BASE_URL:', config.api.baseURL)
      console.log('🎯 tokenExchange endpoint:', config.api.endpoints.tokenExchange)
      console.log('🔗 完全なURL:', config.api.baseURL + config.api.endpoints.tokenExchange)
      
      try {
        commit('SET_LOADING', true)
        
        const payload = { 
          code: code
        }
        console.log('📤 送信データ:', payload)
        
        console.log('🚀 POSTリクエスト送信中...')
        const response = await api.post(config.api.endpoints.tokenExchange, payload)
        
        console.log('✅ トークン交換成功:', response.data)
        console.log('📊 レスポンスステータス:', response.status)
        
        // 認証状態を更新
        await this.dispatch('auth/checkAuthStatus')
        
        return { success: true, data: response.data }
      } catch (error) {
        console.error('❌ トークン交換エラー詳細:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data
          }
        })
        return { 
          success: false, 
          error: error.response?.data?.error || error.message || 'トークン交換に失敗しました' 
        }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // 認証状態をチェック
    async checkAuthStatus({ commit }) {
      console.log('🔍 認証状態チェック開始')
      
      try {
        commit('SET_LOADING', true)
        
        const response = await api.get(config.api.endpoints.authStatus)
        
        console.log('🔍 認証状態レスポンス:', response.data)
        
        if (response.data.authenticated) {
          console.log('✅ 認証済み - ユーザー情報:', response.data.user)
          commit('SET_USER', response.data.user)
        } else {
          console.log('❌ 未認証')
          commit('LOGOUT')
        }
        
        return response.data
      } catch (error) {
        console.error('❌ 認証状態チェックエラー:', error)
        commit('LOGOUT')
        return { authenticated: false, user: null }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // ログアウト
    async logout({ commit }) {
      console.log('🚪 ログアウト開始')
      
      try {
        commit('SET_LOADING', true)
        
        // バックエンドでCognitoサインアウト & Cookie削除
        await api.post(config.api.endpoints.logout)
        
        console.log('✅ ログアウト完了')
        
      } catch (error) {
        console.error('❌ ログアウトエラー:', error)
      } finally {
        // ローカル状態をクリア（成功・失敗関係なく）
        commit('LOGOUT')
        commit('SET_LOADING', false)
        
        // ホームページにリダイレクト
        console.log('🏠 ホームページにリダイレクト')
        window.location.href = '/'
      }
    },

    // Cognitoログインページにリダイレクト
    redirectToLogin() {
      console.log('🔐 Cognitoログインページにリダイレクト')
      window.location.href = config.cognito.loginURL
    },

    // Cognitoサインアップページにリダイレクト
    redirectToSignup() {
      console.log('📝 Cognitoサインアップページにリダイレクト')
      window.location.href = config.cognito.signupURL
    }
  },
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    user: state => state.user,
    loading: state => state.loading
  }
}
