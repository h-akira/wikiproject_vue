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
                <div v-if="treeData.length > 0" class="tree">
                  <tree-item 
                    v-for="item in treeData" 
                    :key="item.username || item.name" 
                    :item="item"
                  />
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
                <div v-for="(page, index) in pages.slice(0, 5)" :key="page.username + '/' + page.slug" class="mb-3">
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
                  <hr v-if="index < pages.slice(0, 5).length - 1">
                </div>
                <div v-if="pages.length === 0" class="has-text-centered has-text-grey">
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
                    >
                      {{ page.username }}/{{ page.slug }}
                    </router-link>
                  </p>
                  <p class="has-text-grey">
                    (最終更新: {{ formatDate(page.last_updated) }})
                  </p>
                  <hr v-if="index < Math.min(pages.length, 5) - 1">
                </div>
                <div v-if="pages.length === 0" class="has-text-centered has-text-grey">
                  最近の更新はありませんdding-bottom-10">
      <h1 class="title is-1 has-text-centered">ホーム</h1>
    </div>
    
    <div class="padding-side">
      <div class="columns">
        <!-- 階層図 -->
        <div class="column padding-side">
          <div class="card card-bordered">
            <div class="card-content">
              <h3 class="title is-3 has-text-centered">階層図</h3>
              <div v-if="loading" class="has-text-centered">
                <i class="fas fa-spinner fa-spin"></i>
                読み込み中...
              </div>
              <div v-else-if="error" class="notification is-danger">
                {{ error }}
              </div>
              <div v-else class="tree">
                <div v-for="(tree, index) in treeData" :key="index" class="tree-section">
                  <h4 class="subtitle is-5">{{ tree.username }}</h4>
                  <div v-html="tree.html"></div>
                </div>
                <div v-if="treeData.length === 0" class="has-text-centered has-text-grey">
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
                <div v-for="(page, index) in pages.slice(0, 5)" :key="page.username + '/' + page.slug">
                  <h5 class="title is-5">
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
                  <hr v-if="index < pages.slice(0, 5).length - 1">
                </div>
                <div v-if="pages.length === 0" class="has-text-centered has-text-grey">
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
  computed: {
    ...mapState(['loading', 'error']),
    ...mapGetters('wiki', ['treeData']),
    ...mapState('wiki', ['pages'])
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    ...mapActions('wiki', ['fetchPages']),
    ...mapActions(['setLoading', 'setError']),
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
