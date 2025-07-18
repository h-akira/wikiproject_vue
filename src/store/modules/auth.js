import axios from 'axios'
import { config } from '@/config.js'

export default {
  namespaced: true,
  state: {
    user: null,
    isAuthenticated: false
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
      state.isAuthenticated = true
    },
    LOGOUT(state) {
      state.user = null
      state.isAuthenticated = false
    }
  },
  actions: {
    // Cognitoマネージドログインページの認証URLs取得
    async getAuthUrls() {
      try {
        // 環境変数から直接Cognito URLを取得
        if (!config.auth.cognitoLoginUrl || !config.auth.cognitoSignupUrl) {
          throw new Error('Cognito URL設定が不完全です')
        }
        
        return { 
          success: true, 
          data: {
            login_url: config.auth.cognitoLoginUrl,
            signup_url: config.auth.cognitoSignupUrl
          }
        }
      } catch (error) {
        return { 
          success: false, 
          message: error.message || '認証URLの取得に失敗しました' 
        }
      }
    },

    // 認証コードをトークンに交換
    async exchangeCodeForToken(_, code) {
      const apiUrl = config.api.baseURL + config.api.endpoints.auth.tokenExchange
      console.log('🌐 API呼び出し:', {
        url: apiUrl,
        baseURL: config.api.baseURL,
        endpoint: config.api.endpoints.auth.tokenExchange,
        code: code,
        withCredentials: config.api.withCredentials
      })
      
      try {
        const response = await axios.post(config.api.endpoints.auth.tokenExchange, { code })
        
        console.log('🌐 API レスポンス:', response.data)
        
        if (response.data.message === 'success') {
          // 認証成功後、ユーザー情報を取得
          console.log('✅ 認証成功、ユーザー情報を取得中...')
          await this.dispatch('auth/checkAuthStatus')
          return { success: true }
        } else {
          console.log('❌ 認証失敗 - レスポンス:', response.data)
          return { 
            success: false, 
            message: '認証に失敗しました' 
          }
        }
      } catch (error) {
        console.error('❌ API呼び出しエラー:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL
          }
        })
        
        return { 
          success: false, 
          message: error.response?.data?.message || 'API呼び出しに失敗しました: ' + error.message
        }
      }
    },
    
    // 認証状態確認（クッキーベース）
    async checkAuthStatus({ commit }) {
      console.log('🔍 認証状態確認中...')
      
      try {
        const response = await axios.get(config.api.endpoints.auth.status)
        
        console.log('🔍 認証状態レスポンス:', response.data)
        
        if (response.data.authenticated) {
          console.log('✅ 認証済み - ユーザー情報:', response.data.user)
          commit('SET_USER', response.data.user)
          return { success: true, authenticated: true }
        } else {
          console.log('❌ 未認証')
          commit('LOGOUT')
          return { success: true, authenticated: false }
        }
      } catch (error) {
        console.error('❌ 認証状態確認エラー:', error)
        commit('LOGOUT')
        return { success: false, authenticated: false }
      }
    },

    // ログアウト
    async logout({ commit }) {
      try {
        await axios.post(config.api.endpoints.auth.logout)
        commit('LOGOUT')
        return { success: true }
      } catch (error) {
        // ログアウトは失敗してもローカル状態をクリア
        commit('LOGOUT')
        return { success: false, message: 'ログアウト処理でエラーが発生しました' }
      }
    }
  },
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    user: state => state.user
  }
}
