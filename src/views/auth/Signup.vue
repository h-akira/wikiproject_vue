<template>
  <div class="auth-container">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-4">
          <div class="card">
            <div class="card-content">
              <h1 class="title has-text-centered">アカウント作成</h1>
              
              <div class="has-text-centered" v-if="loading">
                <p class="mb-4">
                  Cognito サインアップページに移動しています...
                </p>
                <div class="loader"></div>
              </div>
              
              <div class="has-text-centered" v-if="error">
                <p class="mb-4 has-text-danger">
                  {{ error }}
                </p>
                
                <div class="field">
                  <div class="control">
                    <router-link 
                      to="/login" 
                      class="button is-primary is-fullwidth is-large"
                    >
                      <span class="icon">
                        <i class="fas fa-arrow-left"></i>
                      </span>
                      <span>ログインページへ</span>
                    </router-link>
                  </div>
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
import { mapActions } from 'vuex'

export default {
  name: 'SignupPage',
  data() {
    return {
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.redirectToSignup()
  },
  methods: {
    ...mapActions('auth', ['getAuthUrls']),
    
    async redirectToSignup() {
      try {
        const result = await this.getAuthUrls()
        
        if (result.success && result.data.signup_url) {
          // Cognito サインアップページにリダイレクト
          window.location.href = result.data.signup_url
        } else {
          this.error = 'サインアップページの取得に失敗しました'
          this.loading = false
        }
      } catch (error) {
        this.error = 'エラーが発生しました。ログインページからお試しください。'
        this.loading = false
      }
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
