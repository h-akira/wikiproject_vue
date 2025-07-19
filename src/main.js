import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import toastPlugin from './plugins/toast'
import { config } from './config'

// Bulma CSS
import 'bulma/css/bulma.css'
import '@fortawesome/fontawesome-free/css/all.css'

// Highlight.js for code syntax highlighting
import 'highlight.js/styles/github.css'

const app = createApp(App)

// Add axios to global properties
app.config.globalProperties.$http = axios

// Configure axios defaults using config.js
axios.defaults.baseURL = config.api.baseURL
axios.defaults.timeout = config.api.timeout
axios.defaults.withCredentials = config.api.withCredentials

// Add response interceptor for handling auth errors
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.log('Authentication error, clearing auth state and redirecting to login')
      store.dispatch('auth/logout')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

// Check authentication status on app start (unless auth code present)
const urlParams = new URLSearchParams(window.location.search)
const authCode = urlParams.get('code')

if (!authCode) {
  // 認証コードがない場合のみ認証状態をチェック
  console.log('🔍 App startup - checking auth status')
  store.dispatch('auth/checkAuthStatus')
} else {
  console.log('🔍 App startup - auth code detected, component will handle auth')
}

app.use(store)
app.use(router)
app.use(toastPlugin)

app.mount('#app')
