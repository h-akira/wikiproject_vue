<template>
  <div class="share-edit-page padding-side padding-top-10">
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
          :to="{ name: 'SharePage', params: { shareCode } }"
          class="button is-light"
        >
          <i class="fas fa-arrow-left"></i>&nbsp;
          戻る
        </router-link>
      </div>
      
      <!-- Info Message -->
      <div class="notification is-info">
        <p><strong>共有編集モード</strong></p>
        <p>タイトルと内容のみ編集できます。その他の設定は変更できません。</p>
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
import { mapActions } from 'vuex'
import VueEasyMDE from 'vue-easymde'
import 'easymde/dist/easymde.min.css'

export default {
  name: 'ShareEdit',
  components: {
    VueEasyMDE
  },
  props: {
    shareCode: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      originalPage: {},
      form: {
        title: '',
        text: ''
      },
      errors: {},
      loading: false,
      saving: false,
      errorMessage: '',
      editorConfig: {
        spellChecker: false,
        renderingConfig: {
          codeSyntaxHighlighting: true
        },
        toolbar: [
          'bold', 'italic', 'heading', '|',
          'quote', 'unordered-list', 'ordered-list', '|',
          'link', 'image', 'table', '|',
          'code', 'horizontal-rule', '|',
          'preview', 'side-by-side', 'fullscreen', '|',
          'guide'
        ]
      }
    }
  },
  async mounted() {
    await this.loadPage()
  },
  methods: {
    ...mapActions('wiki', ['fetchPageByShareCode', 'updatePageByShareCode']),
    async loadPage() {
      this.loading = true
      this.errorMessage = ''
      
      try {
        const result = await this.fetchPageByShareCode(this.shareCode)
        
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
        text: page.text || ''
      }
    },
    validateForm() {
      this.errors = {}
      
      if (!this.form.title.trim()) {
        this.errors.title = 'タイトルは必須です'
      }
      
      return Object.keys(this.errors).length === 0
    },
    async saveAndExit() {
      await this.save()
      if (!this.errorMessage) {
        this.$router.push({
          name: 'SharePage',
          params: { shareCode: this.shareCode }
        })
      }
    },
    async saveAndContinue() {
      await this.save()
      // Stay on the same page
    },
    async save() {
      if (!this.validateForm()) {
        return
      }
      
      this.saving = true
      this.errorMessage = ''
      
      try {
        const result = await this.updatePageByShareCode({
          shareCode: this.shareCode,
          pageData: this.form
        })
        
        if (!result.success) {
          this.errorMessage = result.message
        } else {
          this.originalPage = result.data
        }
      } catch (error) {
        this.errorMessage = 'ページの保存に失敗しました'
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.share-edit-page {
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
