<template>
  <div class="file-storage">
    <nav class="breadcrumb" aria-label="breadcrumbs">
      <ul>
        <li v-for="(path, index) in breadcrumbs" :key="index" :class="{ 'is-active': index === breadcrumbs.length - 1 }">
          <a @click="navigateToPath(path.path)" v-if="index < breadcrumbs.length - 1">
            {{ path.name }}
          </a>
          <span v-else>{{ path.name }}</span>
        </li>
      </ul>
    </nav>

    <div class="level">
      <div class="level-left">
        <div class="level-item">
          <h1 class="title is-4">ファイルストレージ</h1>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <div class="field is-grouped">
            <div class="control">
              <div class="file">
                <label class="file-label">
                  <input class="file-input" type="file" multiple @change="handleFileUpload">
                  <span class="file-cta">
                    <span class="file-icon">
                      <i class="fas fa-upload"></i>
                    </span>
                    <span class="file-label">
                      ファイルアップロード
                    </span>
                  </span>
                </label>
              </div>
            </div>
            <div class="control">
              <button class="button is-info" @click="showCreateFolderModal = true">
                <span class="icon">
                  <i class="fas fa-folder-plus"></i>
                </span>
                <span>フォルダ作成</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column is-12">
        <div class="card">
          <div class="card-content">
            <div class="table-container">
              <table class="table is-fullwidth is-hoverable">
                <thead>
                  <tr>
                    <th>名前</th>
                    <th>種類</th>
                    <th>サイズ</th>
                    <th>更新日時</th>
                    <th>アクション</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="currentPath !== '/'">
                    <td>
                      <a @click="navigateUp">
                        <span class="icon">
                          <i class="fas fa-arrow-up"></i>
                        </span>
                        上位フォルダ
                      </a>
                    </td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>
                  <tr v-for="item in currentItems" :key="item.id">
                    <td>
                      <a @click="navigateToItem(item)" v-if="item.type === 'folder'">
                        <span class="icon">
                          <i class="fas fa-folder"></i>
                        </span>
                        {{ item.name }}
                      </a>
                      <span v-else>
                        <span class="icon">
                          <i class="fas fa-file"></i>
                        </span>
                        {{ item.name }}
                      </span>
                    </td>
                    <td>{{ item.type === 'folder' ? 'フォルダ' : 'ファイル' }}</td>
                    <td>{{ item.type === 'folder' ? '-' : formatFileSize(item.size) }}</td>
                    <td>{{ formatDate(item.updatedAt) }}</td>
                    <td>
                      <div class="buttons">
                        <button class="button is-small is-info" @click="downloadFile(item)" v-if="item.type === 'file'">
                          <span class="icon">
                            <i class="fas fa-download"></i>
                          </span>
                        </button>
                        <button class="button is-small is-danger" @click="deleteItem(item)">
                          <span class="icon">
                            <i class="fas fa-trash"></i>
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Folder Modal -->
    <div class="modal" :class="{ 'is-active': showCreateFolderModal }">
      <div class="modal-background" @click="showCreateFolderModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">フォルダ作成</p>
          <button class="delete" @click="showCreateFolderModal = false"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">フォルダ名</label>
            <div class="control">
              <input class="input" type="text" v-model="newFolderName" placeholder="フォルダ名を入力">
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-success" @click="createFolder">作成</button>
          <button class="button" @click="showCreateFolderModal = false">キャンセル</button>
        </footer>
      </div>
    </div>

    <!-- Upload Progress Modal -->
    <div class="modal" :class="{ 'is-active': showUploadModal }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">ファイルアップロード中</p>
        </header>
        <section class="modal-card-body">
          <div v-for="(upload, index) in uploads" :key="index" class="mb-3">
            <div class="level">
              <div class="level-left">
                <div class="level-item">
                  <span>{{ upload.name }}</span>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <span>{{ upload.progress }}%</span>
                </div>
              </div>
            </div>
            <progress class="progress is-primary" :value="upload.progress" max="100"></progress>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'FileStorage',
  data() {
    return {
      showCreateFolderModal: false,
      showUploadModal: false,
      newFolderName: '',
      uploads: []
    }
  },
  computed: {
    ...mapGetters('storage', ['currentPath', 'currentItems', 'breadcrumbs'])
  },
  methods: {
    ...mapActions('storage', ['fetchItems', 'uploadFiles', 'createFolder', 'deleteItem', 'downloadFile']),
    
    async handleFileUpload(event) {
      const files = Array.from(event.target.files)
      if (files.length === 0) return

      this.showUploadModal = true
      this.uploads = files.map(file => ({
        name: file.name,
        progress: 0
      }))

      try {
        await this.uploadFiles({
          files,
          path: this.currentPath,
          onProgress: (index, progress) => {
            this.uploads[index].progress = progress
          }
        })
        
        this.showUploadModal = false
        this.uploads = []
        await this.fetchItems(this.currentPath)
        
        this.$toast.success('ファイルアップロードが完了しました')
      } catch (error) {
        this.showUploadModal = false
        this.$toast.error('ファイルアップロードに失敗しました')
      }
    },

    async createFolder() {
      if (!this.newFolderName.trim()) return

      try {
        await this.createFolder({
          name: this.newFolderName,
          path: this.currentPath
        })
        
        this.showCreateFolderModal = false
        this.newFolderName = ''
        await this.fetchItems(this.currentPath)
        
        this.$toast.success('フォルダが作成されました')
      } catch (error) {
        this.$toast.error('フォルダの作成に失敗しました')
      }
    },

    async deleteItem(item) {
      if (!confirm(`${item.name}を削除しますか？`)) return

      try {
        await this.deleteItem(item.id)
        await this.fetchItems(this.currentPath)
        
        this.$toast.success('削除が完了しました')
      } catch (error) {
        this.$toast.error('削除に失敗しました')
      }
    },

    async downloadFile(item) {
      try {
        await this.downloadFile(item.id)
        this.$toast.success('ダウンロードが開始されました')
      } catch (error) {
        this.$toast.error('ダウンロードに失敗しました')
      }
    },

    navigateToItem(item) {
      if (item.type === 'folder') {
        this.fetchItems(item.path)
      }
    },

    navigateToPath(path) {
      this.fetchItems(path)
    },

    navigateUp() {
      const pathParts = this.currentPath.split('/').filter(part => part)
      pathParts.pop()
      const parentPath = pathParts.length > 0 ? '/' + pathParts.join('/') : '/'
      this.fetchItems(parentPath)
    },

    formatFileSize(size) {
      const units = ['B', 'KB', 'MB', 'GB']
      let unitIndex = 0
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }
      return `${size.toFixed(1)} ${units[unitIndex]}`
    },

    formatDate(date) {
      return new Date(date).toLocaleString('ja-JP')
    }
  },

  async mounted() {
    await this.fetchItems('/')
  }
}
</script>

<style scoped>
.file-storage {
  padding: 1rem;
}

.table-container {
  overflow-x: auto;
}

.file-input {
  display: none;
}

.progress {
  margin-top: 0.5rem;
}
</style>
