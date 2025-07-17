<template>
  <div class="edit-page padding-side padding-top-10">
    <div v-if="loading" class="has-text-centered">
      <i class="fas fa-spinner fa-spin fa-2x"></i>
      <p>読み込み中...</p>
    </div>
    
    <div v-else>
      <!-- Action Buttons -->
      <div class="buttons mb-4">
        <button 
          @click="saveAndExit"
          class="button is-primary"
          :class="{ 'is-loading': saving }"
          :disabled="saving"
        >
          <i class="fas fa-save"></i>&nbsp;
          保存して終了
        </button>
        <button 
          @click="saveAndContinue"
          class="button is-info"
          :class="{ 'is-loading': saving }"
          :disabled="saving"
        >
          <i class="fas fa-save"></i>&nbsp;
          保存して継続
        </button>
        <router-link 
          :to="{ name: 'WikiPage', params: { username: originalPage.username, slug: originalPage.slug } }"
          class="button is-light"
        >
          <i class="fas fa-arrow-left"></i>&nbsp;
          戻る
        </router-link>
      </div>
      
      <!-- Error Message -->
      <div v-if="errorMessage" class="notification is-danger">
        {{ errorMessage }}
      </div>
      
      <!-- Edit Form -->
      <form @submit.prevent="saveAndExit">
        <!-- Title -->
        <div class="field">
          <label class="label">タイトル</label>
          <div class="control">
            <input
              v-model="form.title"
              class="input is-large"
              :class="{ 'is-danger': errors.title }"
              type="text"
              placeholder="記事のタイトル"
              required
            >
          </div>
          <p v-if="errors.title" class="help is-danger">{{ errors.title }}</p>
        </div>
        
        <!-- Slug -->
        <div class="field">
          <label class="label">スラッグ</label>
          <div class="control">
            <input
              v-model="form.slug"
              class="input"
              :class="{ 'is-danger': errors.slug }"
              type="text"
              placeholder="記事のスラッグ (例: programming/vue/basic)"
              required
            >
          </div>
          <p v-if="errors.slug" class="help is-danger">{{ errors.slug }}</p>
          <p class="help">スラッシュ(/)で階層を区切ることができます</p>
        </div>
        
        <!-- Priority -->
        <div class="field">
          <label class="label">優先度</label>
          <div class="control">
            <input
              v-model.number="form.priority"
              class="input"
              type="number"
              placeholder="0"
            >
          </div>
          <p class="help">数値が大きいほど上位に表示されます</p>
        </div>
        
        <!-- Settings -->
        <div class="field">
          <div class="columns">
            <div class="column">
              <div class="field">
                <div class="control">
                  <label class="checkbox">
                    <input v-model="form.public" type="checkbox">
                    公開
                  </label>
                </div>
              </div>
              
              <div class="field" v-if="form.public">
                <div class="control">
                  <label class="checkbox">
                    <input v-model="form.edit_permission" type="checkbox">
                    編集許可
                  </label>
                </div>
              </div>
            </div>
            
            <div class="column">
              <div class="field">
                <div class="control">
                  <label class="checkbox">
                    <input v-model="form.share" type="checkbox">
                    共有
                  </label>
                </div>
              </div>
              
              <div v-if="form.share">
                <div class="field">
                  <label class="label">共有コード</label>
                  <div class="control has-icons-right">
                    <input
                      v-model="form.share_code"
                      class="input"
                      type="text"
                      readonly
                    >
                    <span class="icon is-small is-right">
                      <button 
                        @click="generateShareCode"
                        class="button is-small"
                        type="button"
                        title="新しい共有コードを生成"
                      >
                        <i class="fas fa-refresh"></i>
                      </button>
                    </span>
                  </div>
                </div>
                
                <div class="field">
                  <div class="control">
                    <label class="checkbox">
                      <input v-model="form.share_edit_permission" type="checkbox">
                      共有編集許可
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Content Editor -->
        <div class="field">
          <label class="label">内容</label>
          <div class="control">
            <VueEasyMDE
              v-model="form.text"
              :configs="editorConfig"
              :class="{ 'is-danger': errors.text }"
            />
          </div>
          <p v-if="errors.text" class="help is-danger">{{ errors.text }}</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import VueEasyMDE from 'vue-easymde'
import 'easymde/dist/easymde.min.css'
import { config } from '../../config'

export default {
  name: 'EditPage',
  components: {
    VueEasyMDE
  },
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
      originalPage: {},
      form: {
        title: '',
        slug: '',
        text: '',
        priority: 0,
        public: false,
        edit_permission: false,
        share: false,
        share_code: '',
        share_edit_permission: false
      },
      errors: {},
      loading: false,
      saving: false,
      errorMessage: '',
      editorConfig: {
        spellChecker: config.ui.editor.spellChecker,
        renderingConfig: {
          codeSyntaxHighlighting: config.ui.editor.codeSyntaxHighlighting
        },
        toolbar: config.ui.editor.toolbar
      }
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'currentUser'])
  },
  async mounted() {
    if (!this.isAuthenticated) {
      this.$router.push(config.auth.defaultRedirectAfterLogout)
      return
    }
    
    await this.loadPage()
  },
  methods: {
    ...mapActions('wiki', ['fetchArticle', 'updateArticle']),
    async loadPage() {
      this.loading = true
      this.errorMessage = ''
      
      try {
        // 注意: 旧形式のusername/slugから新形式のarticleIdに変換が必要
        // 一時的にusername/slugで記事を検索（実際の実装では記事IDが必要）
        const result = await this.fetchArticle(`${this.username}/${this.slug}`)
        
        if (result.success) {
          this.originalPage = result.data
          this.populateForm(result.data)
        } else {
          this.errorMessage = result.message
        }
      } catch (error) {
        this.errorMessage = 'ページの読み込みに失敗しました'
      } finally {
        this.loading = false
      }
    },
    populateForm(page) {
      this.form = {
        title: page.title || '',
        slug: page.slug || '',
        text: page.text || page.content || '',
        priority: page.priority || 0,
        public: page.public || false,
        edit_permission: page.edit_permission || false,
        share: page.share || false,
        share_code: page.share_code || page.share_id || '',
        share_edit_permission: page.share_edit_permission || false
      }
    },
    validateForm() {
      this.errors = {}
      
      if (!this.form.title.trim()) {
        this.errors.title = 'タイトルは必須です'
      }
      
      if (!this.form.slug.trim()) {
        this.errors.slug = 'スラッグは必須です'
      } else if (!/^[a-zA-Z0-9_\-/]+$/.test(this.form.slug)) {
        this.errors.slug = 'スラッグには英数字、ハイフン、アンダースコア、スラッシュのみ使用できます'
      }
      
      return Object.keys(this.errors).length === 0
    },
    generateShareCode() {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let result = ''
      for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      this.form.share_code = result
    },
    async save() {
      if (!this.validateForm()) {
        return
      }
      
      this.saving = true
      this.errorMessage = ''
      
      try {
        const result = await this.updateArticle({
          articleId: this.originalPage.id,
          articleData: this.form
        })
        
        if (result.success) {
          this.$router.push({
            name: 'WikiPage',
            params: { 
              username: this.username, 
              slug: this.form.slug 
            }
          })
        } else {
          this.errorMessage = result.message
        }
      } catch (error) {
        this.errorMessage = 'ページの更新に失敗しました'
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.edit-page {
  max-width: 1200px;
  margin: 0 auto;
}

.editor-container {
  border: 1px solid #dbdbdb;
  border-radius: 4px;
}

.editor-container.is-danger {
  border-color: #ff3860;
}
</style>
