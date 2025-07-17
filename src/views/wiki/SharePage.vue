<template>
  <div class="share-page padding-side padding-top-10">
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
                v-if="page.share_edit_permission"
                :to="{ name: 'ShareEdit', params: { shareCode } }"
                class="button is-primary"
              >
                <i class="fas fa-edit"></i>&nbsp;
                編集
              </router-link>
              <button 
                @click="copyShareCode"
                class="button is-light"
              >
                <i class="fas fa-share"></i>&nbsp;
                共有
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Share Info -->
      <div class="box">
        <div class="columns">
          <div class="column">
            <p><strong>作成者:</strong> {{ page.username }}</p>
            <p><strong>スラッグ:</strong> {{ page.slug }}</p>
            <p><strong>最終更新:</strong> {{ formatDate(page.last_updated) }}</p>
          </div>
          <div class="column">
            <p><strong>共有コード:</strong> 
              <code>{{ shareCode }}</code>
            </p>
            <p><strong>編集許可:</strong> 
              <span class="tag" :class="page.share_edit_permission ? 'is-success' : 'is-warning'">
                {{ page.share_edit_permission ? '許可' : '不許可' }}
              </span>
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
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { marked } from 'marked'
import hljs from 'highlight.js'

export default {
  name: 'SharePage',
  props: {
    shareCode: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      page: null,
      loading: false,
      error: null,
      currentShareCode: this.shareCode
    }
  },
  computed: {
    renderedContent() {
      if (!this.page?.text) return ''
      
      // Configure marked with highlight.js
      marked.setOptions({
        highlight: function(code, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(code, { language: lang }).value
            } catch (error) {
          // Handle error
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
    this.currentShareCode = to.params.shareCode
    await this.loadPage()
    next()
  },
  methods: {
    ...mapActions('wiki', ['fetchPageByShareCode']),
    async loadPage() {
      this.loading = true
      this.error = null
      
      try {
        const result = await this.fetchPageByShareCode(this.currentShareCode)
        
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
    async copyShareCode() {
      const shareUrl = window.location.href
      
      try {
        await navigator.clipboard.writeText(shareUrl)
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
.share-page {
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
