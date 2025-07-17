<template>
  <div class="auth-container">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-4">
          <div class="card">
            <div class="card-content">
              <h1 class="title has-text-centered">ログイン</h1>
              
              <!-- 認証コード処理中の表示 -->
              <div v-if="processing" class="has-text-centered">
                <div class="loading-spinner">
                  <i class="fas fa-spinner fa-spin fa-2x"></i>
                </div>
                <p class="mt-4">認証処理中...</p>
              </div>

              <!-- エラーメッセージ -->
              <div v-if="errorMessage" class="notification is-danger">
                {{ errorMessage }}
              </div>

              <!-- ログインボタン -->
              <div v-if="!processing" class="has-text-centered">
                <p class="mb-4">Cognitoマネージドログインページを使用してログインします。</p>
                
                <div class="field">
                  <div class="control">
                    <button 
                      @click="handleLogin"
                      class="button is-primary is-fullwidth is-large"
                      :class="{ 'is-loading': loading }"
                      :disabled="loading"
                    >
                      <span class="icon">
                        <i class="fab fa-aws"></i>
                      </span>
                      <span>Cognitoでログイン</span>
                    </button>
                  </div>
                </div>

                <div class="field">
                  <div class="control">
                    <button 
                      @click="handleSignup"
                      class="button is-light is-fullwidth"
                      :class="{ 'is-loading': loading }"
                      :disabled="loading"
                    >
                      <span class="icon">
                        <i class="fas fa-user-plus"></i>
                      </span>
                      <span>新規アカウント作成</span>
                    </button>
                  </div>
                </div>

                <div class="mt-4">
                  <p class="is-size-7 has-text-grey">
                    ※ 外部のCognito認証画面が開きます
                  </p>
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
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'LoginPage',
  data() {
    return {
      loading: false,
      processing: false,
      errorMessage: ''
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated'])
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

    // URLパラメータから認証コードを取得
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')

    if (error) {
      this.errorMessage = '認証がキャンセルされました'
      // URLをクリーンアップ
      this.cleanUrl()
    } else if (code) {
      // 認証コードがある場合は処理
      await this.processAuthCode(code)
    }
  },
  methods: {
    ...mapActions('auth', ['getAuthUrls', 'exchangeCodeForToken']),

    async handleLogin() {
      this.loading = true
      this.errorMessage = ''

      try {
        const result = await this.getAuthUrls()
        
        if (result.success) {
          // Cognitoログインページにリダイレクト
          window.location.href = result.data.login_url
        } else {
          this.errorMessage = result.message
        }
      } catch (error) {
        this.errorMessage = 'ログインURLの取得に失敗しました'
      } finally {
        this.loading = false
      }
    },

    async handleSignup() {
      this.loading = true
      this.errorMessage = ''

      try {
        const result = await this.getAuthUrls()
        
        if (result.success) {
          // Cognitoサインアップページにリダイレクト
          window.location.href = result.data.signup_url
        } else {
          this.errorMessage = result.message
        }
      } catch (error) {
        this.errorMessage = 'サインアップURLの取得に失敗しました'
      } finally {
        this.loading = false
      }
    },

    async processAuthCode(code) {
      this.processing = true
      this.errorMessage = ''

      try {
        const result = await this.exchangeCodeForToken(code)
        
        if (result.success) {
          // URLをクリーンアップしてからホームにリダイレクト
          this.cleanUrl()
          this.$router.push('/')
        } else {
          this.errorMessage = result.message
          this.cleanUrl()
        }
      } catch (error) {
        this.errorMessage = '認証処理に失敗しました'
        this.cleanUrl()
      } finally {
        this.processing = false
      }
    },

    cleanUrl() {
      // URLパラメータを削除してクリーンなURLにする
      const url = new URL(window.location)
      url.search = ''
      window.history.replaceState({}, document.title, url.toString())
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

.loading-spinner {
  color: #3273dc;
}

.button.is-large {
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
}

.button .icon {
  margin-right: 0.5rem;
}
</style>
