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
      try {
        const response = await axios.post(config.api.endpoints.auth.tokenExchange, { code })
        
        if (response.data.message === 'success') {
          // 認証成功後、ユーザー情報を取得
          await this.dispatch('auth/checkAuthStatus')
          return { success: true }
        } else {
          return { 
            success: false, 
            message: '認証に失敗しました' 
          }
        }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || '認証に失敗しました' 
        }
      }
    },
    
    // 認証状態確認（クッキーベース）
    async checkAuthStatus({ commit }) {
      try {
        const response = await axios.get(config.api.endpoints.auth.status)
        
        if (response.data.authenticated) {
          commit('SET_USER', response.data.user)
          return { success: true, authenticated: true }
        } else {
          commit('LOGOUT')
          return { success: true, authenticated: false }
        }
      } catch (error) {
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
