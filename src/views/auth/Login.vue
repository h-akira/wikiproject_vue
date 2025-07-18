<template>
  <div class="auth-container">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-4">
          <div class="card">
            <div class="card-content">
              <h1 class="title has-text-centered">ログイン</h1>
              
              <div v-if="loading || processing" class="has-text-centered">
                <div class="loader"></div>
                <p class="mt-4">{{ processing ? '認証処理中...' : '読み込み中...' }}</p>
              </div>
              
              <div v-else>
                <div class="field">
                  <div class="control">
                    <button 
                      class="button is-primary is-fullwidth is-large"
                      @click="handleLogin"
                      :disabled="loading"
                    >
                      <span class="icon">
                        <i class="fas fa-sign-in-alt"></i>
                      </span>
                      <span>ログイン</span>
                    </button>
                  </div>
                </div>
                
                <div class="field mt-4">
                  <div class="control">
                    <button 
                      class="button is-info is-fullwidth"
                      @click="handleSignup"
                      :disabled="loading"
                    >
                      <span class="icon">
                        <i class="fas fa-user-plus"></i>
                      </span>
                      <span>アカウント作成</span>
                    </button>
                  </div>
                </div>
                
                <div v-if="errorMessage" class="notification is-danger mt-4">
                  {{ errorMessage }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'LoginPage',
  data() {
    return {
      processing: false,
      errorMessage: ''
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'loading'])
  },
  watch: {
    isAuthenticated(newVal) {
      if (newVal) {
        this.$router.push('/')
      }
    }
  },
  async mounted() {
    // 既に認証済みの場合はホームにリダイレクト
    if (this.isAuthenticated) {
      this.$router.push('/')
      return
    }

    // URLパラメータから認証コードをチェック
    const urlParams = new URLSearchParams(window.location.search)
    const authCode = urlParams.get('code')
    const error = urlParams.get('error')

    if (error) {
      this.errorMessage = '認証がキャンセルされました'
      this.cleanUrl()
    } else if (authCode && !this.isAuthenticated) {
      console.log('🔑 認証コード検出:', authCode)
      console.log('🔄 トークン交換を開始')
      
      await this.processAuthCode(authCode)
    } else {
      // 通常の認証状態チェック
      await this.checkAuthStatus()
    }
  },
  methods: {
    ...mapActions('auth', ['exchangeCodeForToken', 'checkAuthStatus', 'redirectToLogin', 'redirectToSignup']),

    async handleLogin() {
      this.redirectToLogin()
    },

    async handleSignup() {
      this.redirectToSignup()
    },

    async processAuthCode(code) {
      this.processing = true
      this.errorMessage = ''

      try {
        const result = await this.exchangeCodeForToken(code)
        
        if (result.success) {
          console.log('✅ 認証成功！URLをクリーンアップ')
          // URLから認証コードを削除（履歴を汚さないようにreplace）
          this.cleanUrl()
          this.$router.push('/')
        } else {
          console.error('❌ 認証失敗:', result.error)
          this.errorMessage = result.error
          this.cleanUrl()
        }
      } catch (error) {
        console.error('💥 認証処理エラー:', error)
        this.errorMessage = '認証処理に失敗しました'
        this.cleanUrl()
      } finally {
        this.processing = false
      }
    },

    cleanUrl() {
      // URLパラメータを削除してクリーンなURLにする
      window.history.replaceState({}, '', window.location.pathname)
    }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: calc(100vh - 52px);
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
}

.card {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.button.is-large {
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
}

.button .icon {
  margin-right: 0.5rem;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
