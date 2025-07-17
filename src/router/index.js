import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/auth/Login.vue'
import Signup from '../views/auth/Signup.vue'
import WikiPage from '../views/wiki/WikiPage.vue'
import EditPage from '../views/wiki/EditPage.vue'
import CreatePage from '../views/wiki/CreatePage.vue'
import SharePage from '../views/wiki/SharePage.vue'
import ShareEdit from '../views/wiki/ShareEdit.vue'
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup
  },
  {
    path: '/create',
    name: 'CreatePage',
    component: CreatePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/wiki/:username/:slug*',
    name: 'WikiPage',
    component: WikiPage,
    props: true
  },
  {
    path: '/edit/:username/:slug*',
    name: 'EditPage',
    component: EditPage,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/share/:shareCode',
    name: 'SharePage',
    component: SharePage,
    props: true
  },
  {
    path: '/share/:shareCode/edit',
    name: 'ShareEdit',
    component: ShareEdit,
    props: true
  },
  {
    path: '/storage',
    name: 'FileStorage',
    component: () => import('../views/storage/FileStorage.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // 認証が必要なページかチェック
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 認証状態をチェック（必要に応じてサーバーに確認）
    await store.dispatch('auth/checkAuthStatus')
    
    if (!store.getters['auth/isAuthenticated']) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
