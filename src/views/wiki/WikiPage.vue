<template>
  <div class="wiki-page padding-side padding-top-10">
    <div v-if="loading" class="has-text-centered">
      <i class="fas fa-spinner fa-spin fa-2x"></i>
      <p>読み込み中...</p>
    </div>
    
    <div v-else-if="error" class="notification is-danger">
      {{ error }}
    </div>
    
    <div v-else-if="page">
      <!-- Page Header -->
      <div class="level">
        <div class="level-left">
          <div class="level-item">
            <h1 class="title">{{ page.title }}</h1>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <div class="buttons">
              <router-link 
                v-if="canEdit"
                :to="{ name: 'EditPage', params: { username: page.username, slug: page.slug } }"
                class="button is-primary"
              >
                <i class="fas fa-edit"></i>&nbsp;
                編集
              </router-link>
              <button 
                v-if="canDelete"
                @click="showDeleteModal = true"
                class="button is-danger"
              >
                <i class="fas fa-trash"></i>&nbsp;
                削除
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Page Info -->
      <div class="box">
        <div class="columns">
          <div class="column">
            <p><strong>作成者:</strong> {{ page.username }}</p>
            <p><strong>スラッグ:</strong> {{ page.slug }}</p>
            <p><strong>最終更新:</strong> {{ formatDate(page.last_updated) }}</p>
          </div>
          <div class="column">
            <p><strong>公開状態:</strong> 
              <span class="tag" :class="page.public ? 'is-success' : 'is-warning'">
                {{ page.public ? '公開' : '非公開' }}
              </span>
            </p>
            <p v-if="page.share"><strong>共有コード:</strong> 
              <code>{{ page.share_code }}</code>
              <button 
                @click="copyShareCode"
                class="button is-small is-light ml-2"
                title="共有URLをコピー"
              >
                <i class="fas fa-copy"></i>
              </button>
            </p>
          </div>
        </div>
      </div>
      
      <!-- Page Content -->
      <div class="content" v-html="renderedContent"></div>
    </div>
    
    <div v-else>
      <div class="notification is-warning">
        ページが見つかりません
      </div>
    </div>
    
    <!-- Delete Modal -->
    <div class="modal" :class="{ 'is-active': showDeleteModal }">
      <div class="modal-background" @click="showDeleteModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">ページの削除</p>
          <button class="delete" @click="showDeleteModal = false"></button>
        </header>
        <section class="modal-card-body">
          <p>本当にこのページを削除しますか？この操作は取り消せません。</p>
          <p><strong>{{ page?.title }}</strong></p>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-danger" @click="deletePage" :disabled="deleting">
            <span v-if="deleting">
              <i class="fas fa-spinner fa-spin"></i>&nbsp;
            </span>
            削除
          </button>
          <button class="button" @click="showDeleteModal = false">キャンセル</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { marked } from 'marked'
import hljs from 'highlight.js'

export default {
  name: 'WikiPage',
  props: {
    username: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      page: null,
      loading: false,
      error: null,
      showDeleteModal: false,
      deleting: false,
      currentUsername: this.username,
      currentSlug: this.slug
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'currentUser']),
    canEdit() {
      if (!this.isAuthenticated || !this.page) return false
      return this.page.username === this.currentUser.username || 
             (this.page.public && this.page.edit_permission)
    },
    canDelete() {
      if (!this.isAuthenticated || !this.page) return false
      return this.page.username === this.currentUser.username
    },
    renderedContent() {
      if (!this.page?.text) return ''
      
      // Configure marked with highlight.js
      marked.setOptions({
        highlight: function(code, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(code, { language: lang }).value
            } catch (error) {
          // Handle highlight error
          console.error('Highlight error:', error)
        }
          }
          return hljs.highlightAuto(code).value
        }
      })
      
      return marked(this.page.text)
    }
  },
  async mounted() {
    await this.loadPage()
  },
  async beforeRouteUpdate(to, from, next) {
    this.currentUsername = to.params.username
    this.currentSlug = to.params.slug
    await this.loadPage()
    next()
  },
  methods: {
    ...mapActions('wiki', ['fetchPage', 'deletePage as deletePageAction']),
    async loadPage() {
      this.loading = true
      this.error = null
      
      try {
        const result = await this.fetchPage({
          username: this.currentUsername,
          slug: this.currentSlug
        })
        
        if (result.success) {
          this.page = result.data
        } else {
          this.error = result.message
        }
      } catch (error) {
        this.error = 'ページの読み込みに失敗しました'
      } finally {
        this.loading = false
      }
    },
    async deletePage() {
      this.deleting = true
      
      try {
        const result = await this.deletePageAction({
          username: this.currentUsername,
          slug: this.currentSlug
        })
        
        if (result.success) {
          this.$router.push('/')
        } else {
          this.error = result.message
        }
      } catch (error) {
        this.error = 'ページの削除に失敗しました'
      } finally {
        this.deleting = false
        this.showDeleteModal = false
      }
    },
    async copyShareCode() {
      if (!this.page?.share_code) return
      
      const shareUrl = `${window.location.origin}/share/${this.page.share_code}`
      
      try {
        await navigator.clipboard.writeText(shareUrl)
        // Could add a toast notification here
        alert('共有URLをコピーしました')
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('共有URLをコピーしました')
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
.wiki-page {
  max-width: 1200px;
  margin: 0 auto;
}

.content :deep(pre) {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
  padding: 1rem;
  overflow-x: auto;
}

.content :deep(blockquote) {
  border-left: 4px solid #3273dc;
  margin: 1rem 0;
  padding: 0.5rem 0 0.5rem 1rem;
  background-color: #f8f9fa;
}

.content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.content :deep(th),
.content :deep(td) {
  border: 1px solid #dbdbdb;
  padding: 0.5rem;
  text-align: left;
}

.content :deep(th) {
  background-color: #f5f5f5;
  font-weight: bold;
}
</style>
