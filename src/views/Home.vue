<template>
  <div class="home">
    <div class="container mt-4">
      <div class="columns">
        <!-- ツリー表示 -->
        <div class="column">
          <div class="card card-bordered">
            <div class="card-content">
              <h3 class="title is-3 has-text-centered">記事一覧</h3>
              <div v-if="loading" class="has-text-centered">
                <i class="fas fa-spinner fa-spin"></i>
                読み込み中...
              </div>
              <div v-else-if="error" class="notification is-danger">
                {{ error }}
              </div>
              <div v-else class="tree-section">
                <div v-if="treeData && treeData.length > 0" class="tree">
                  <ul>
                    <li v-for="item in treeData" :key="item.username || item.name">
                      <strong>{{ item.username || item.name }}</strong>
                      <ul v-if="item.pages && item.pages.length > 0">
                        <li v-for="page in item.pages" :key="page.slug">
                          <router-link 
                            :to="{ name: 'WikiPage', params: { username: item.username, slug: page.slug } }"
                            class="has-text-link"
                          >
                            {{ page.title }}
                          </router-link>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div v-else class="has-text-centered has-text-grey">
                  まだ記事がありません
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 最近の更新 -->
        <div class="column">
          <div class="card card-bordered">
            <div class="card-content">
              <h3 class="title is-3 has-text-centered">最近の更新</h3>
              <div v-if="loading" class="has-text-centered">
                <i class="fas fa-spinner fa-spin"></i>
                読み込み中...
              </div>
              <div v-else-if="error" class="notification is-danger">
                {{ error }}
              </div>
              <div v-else>
                <div v-for="(page, index) in (pages || []).slice(0, 5)" :key="page.username + '/' + page.slug" class="mb-3">
                  <h5 class="title is-6 mb-1">
                    {{ page.title }}
                  </h5>
                  <p>
                    <router-link 
                      :to="{ name: 'WikiPage', params: { username: page.username, slug: page.slug } }"
                      class="has-text-link"
                    >
                      {{ page.username }}/{{ page.slug }}
                    </router-link>
                  </p>
                  <p class="has-text-grey">
                    (最終更新: {{ formatDate(page.last_updated) }})
                  </p>
                  <hr v-if="index < (pages || []).slice(0, 5).length - 1">
                </div>
                <div v-if="!pages || pages.length === 0" class="has-text-centered has-text-grey">
                  最近の更新はありません
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
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'HomePage',
  data() {
    return {
      processing: false
    }
  },
  computed: {
    ...mapState(['loading', 'error']),
    ...mapGetters('wiki', ['treeData']),
    ...mapState('wiki', ['pages']),
    ...mapGetters('auth', ['isAuthenticated'])
  },
  watch: {
    // 認証状態が変化したときにデータをリロード
    isAuthenticated(newVal, oldVal) {
      console.log('🔍 認証状態変化:', { oldVal, newVal })
      if (newVal && !oldVal) {
        // 未認証から認証済みに変化した場合
        console.log('✅ 認証完了 - データをリロード')
        this.loadData()
      }
    }
  },
  async mounted() {
    // 認証コード処理とデータロード
    await this.handleAuthCodeAndLoadData()
  },
  methods: {
    ...mapActions('wiki', ['fetchPages']),
    ...mapActions(['setLoading', 'setError']),
    ...mapActions('auth', ['exchangeCodeForToken', 'checkAuthStatus']),

    async handleAuthCodeAndLoadData() {
      // URLパラメータから認証コードをチェック（最優先）
      const urlParams = new URLSearchParams(window.location.search)
      const authCode = urlParams.get('code')
      const error = urlParams.get('error')

      console.log('🔍 Home.vue mounted - URL params:', { authCode, error })
      console.log('🔍 Current auth status:', this.isAuthenticated)

      if (error) {
        console.log('❌ 認証エラー検出:', error)
        this.cleanUrl()
        // エラーがあってもデータロードは続行
        await this.loadData()
        return
      }

      if (authCode) {
        console.log('🔑 認証コード検出:', authCode)
        console.log('🔄 トークン交換を開始')
        
        // 認証コードがある場合は処理のみ（データロードはwatchが担当）
        await this.processAuthCode(authCode)
        return
      }

      // 通常のデータロード
      console.log('🔍 通常のデータロード実行')
      await this.loadData()
    },

    async processAuthCode(code) {
      this.processing = true

      // 古いクッキーをクリアするため、まず既存の認証状態をクリア
      console.log('🧹 古い認証状態をクリア')
      this.$store.commit('auth/LOGOUT')

      try {
        const result = await this.exchangeCodeForToken(code)
        
        if (result.success) {
          console.log('✅ 認証成功！URLをクリーンアップ')
          // URLから認証コードを削除（履歴を汚さないようにreplace）
          this.cleanUrl()
        } else {
          console.error('❌ 認証失敗:', result.error)
          this.cleanUrl()
        }
      } catch (error) {
        console.error('💥 認証処理エラー:', error)
        this.cleanUrl()
      } finally {
        this.processing = false
      }
    },

    cleanUrl() {
      // URLパラメータを削除してクリーンなURLにする
      window.history.replaceState({}, '', window.location.pathname)
    },

    async loadData() {
      this.setLoading(true)
      
      try {
        await this.fetchPages()
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error)
        this.setError('データの読み込みに失敗しました')
      } finally {
        this.setLoading(false)
      }
    },
    formatDate(dateString) {
      if (!dateString) return '不明'
      const date = new Date(dateString)
      return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.tree-section {
  margin-bottom: 1.5rem;
}

.tree :deep(ul) {
  list-style: none;
  padding-left: 1.5rem;
}

.tree :deep(li) {
  margin: 0.25rem 0;
}

.tree :deep(a) {
  color: #3273dc;
  text-decoration: none;
}

.tree :deep(a:hover) {
  text-decoration: underline;
}
</style>
