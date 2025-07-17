<template>
  <nav class="navbar is-dark is-fixed-top" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" @click="toggleSidebar">
        <i class="fas fa-bars"></i>
      </a>
      <router-link class="navbar-item" to="/">
        <strong>WikiProject</strong>
      </router-link>
      <a 
        role="button" 
        class="navbar-burger" 
        :class="{ 'is-active': mobileMenuOpen }"
        aria-label="menu" 
        aria-expanded="false" 
        @click="toggleMobileMenu"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div class="navbar-menu" :class="{ 'is-active': mobileMenuOpen }">
      <div class="navbar-start">
        <router-link class="navbar-item" to="/">
          ホーム
        </router-link>
        <a class="navbar-item" @click="toggleSidebar">
          記事一覧
        </a>
        <router-link 
          v-if="isAuthenticated" 
          class="navbar-item" 
          to="/create"
        >
          新規作成
        </router-link>
      </div>

      <div class="navbar-end">
        <div v-if="isAuthenticated" class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">
            {{ username || 'ユーザー' }}
          </a>
          <div class="navbar-dropdown">
            <a class="navbar-item" @click="handleLogout">
              <i class="fas fa-sign-out-alt"></i>&nbsp;
              ログアウト
            </a>
          </div>
        </div>
        <div v-else class="navbar-item">
          <div class="buttons">
            <router-link class="button is-primary" to="/signup">
              <strong>Sign up</strong>
            </router-link>
            <router-link class="button is-light" to="/login">
              Log in
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'NavBar',
  data() {
    return {
      mobileMenuOpen: false
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'currentUser', 'username'])
  },
  methods: {
    ...mapActions(['toggleSidebar']),
    ...mapActions('auth', ['logout']),
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
    },
    async handleLogout() {
      try {
        await this.logout()
        this.$router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        // エラーが発生してもログインページにリダイレクト
        this.$router.push('/login')
      }
    }
  }
}
</script>

<style scoped>
.navbar {
  z-index: 1000;
}

.navbar-item {
  cursor: pointer;
}

.navbar-burger {
  cursor: pointer;
}
</style>
