<template>
  <div class="auth-container">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-4">
          <div class="card">
            <div class="card-content">
              <h1 class="title has-text-centered">アカウント作成</h1>
              
              <div class="has-text-centered">
                <p class="mb-4">
                  アカウント作成は Cognito マネージドページで行います。<br>
                  ログインページにリダイレクトします。
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
export default {
  name: 'SignupPage',
  mounted() {
    // 自動的にログインページにリダイレクト
    setTimeout(() => {
      this.$router.push('/login')
    }, 2000)
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
</style>
