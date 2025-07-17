import axios from 'axios'
import { config } from '../../config'

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
        const response = await axios.get(config.api.endpoints.auth.urls)
        return { 
          success: true, 
          data: response.data 
        }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || '認証URLの取得に失敗しました' 
        }
      }
    },

    // 認証コードをトークンに交換
    async exchangeCodeForToken({ commit }, code) {
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
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        commit('LOGOUT')
      }
    },

    // 初期化時の認証チェック
    async checkAuth({ dispatch }) {
      await dispatch('checkAuthStatus')
    }
  },
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
    username: state => state.user?.['cognito:username'] || null
  }
}
