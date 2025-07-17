<template>
  <aside class="sidebar" :class="{ 'is-open': sidebarOpen }">
    <div class="sidebar-content">
      <div class="sidebar-header">
        <h3 class="title is-4 has-text-white">ナビゲーション</h3>
        <button class="delete is-medium" @click="closeSidebar"></button>
      </div>
      
      <div class="sidebar-body">
        <div class="menu">
          <p class="menu-label has-text-white">
            メニュー
          </p>
          <ul class="menu-list">
            <li>
              <router-link to="/" class="has-text-white">
                <span class="icon">
                  <i class="fas fa-home"></i>
                </span>
                ホーム
              </router-link>
            </li>
            <li>
              <router-link to="/storage" class="has-text-white">
                <span class="icon">
                  <i class="fas fa-folder"></i>
                </span>
                ファイルストレージ
              </router-link>
            </li>
          </ul>
        </div>
        
        <div class="menu mt-4">
          <p class="menu-label has-text-white">
            記事一覧
          </p>
          <div v-if="loading" class="has-text-centered">
            <i class="fas fa-spinner fa-spin"></i>
            読み込み中...
          </div>
          
          <div v-else-if="error" class="notification is-danger">
            {{ error }}
          </div>
          
          <div v-else>
            <div v-for="(tree, index) in treeData" :key="index" class="tree-section">
              <h4 class="subtitle is-6 has-text-white">{{ tree.username }}</h4>
              <div class="tree" v-html="tree.html"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="sidebar-overlay" @click="closeSidebar"></div>
  </aside>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'SidebarComponent',
  computed: {
    ...mapState(['sidebarOpen', 'loading', 'error']),
    ...mapGetters('wiki', ['treeData'])
  },
  async mounted() {
    await this.fetchPages()
  },
  methods: {
    ...mapActions(['toggleSidebar']),
    ...mapActions('wiki', ['fetchPages']),
    closeSidebar() {
      if (this.sidebarOpen) {
        this.toggleSidebar()
      }
    }
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: -250px;
  width: 250px;
  height: 100vh;
  background-color: #363636;
  transition: left 0.3s ease;
  z-index: 999;
  overflow: hidden;
}

.sidebar.is-open {
  left: 0;
}

.sidebar-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1001;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #4a4a4a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2c2c2c;
}

.sidebar-body {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  color: white;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
  display: none;
}

.sidebar.is-open ~ .sidebar-overlay,
.sidebar.is-open .sidebar-overlay {
  display: block;
}

.tree-section {
  margin-bottom: 1.5rem;
}

.tree :deep(ul) {
  list-style: none;
  padding-left: 1rem;
  margin-left: 0;
}

.tree :deep(li) {
  margin: 0.25rem 0;
}

.tree :deep(a) {
  color: #fff;
  text-decoration: none;
  padding: 0.25rem 0;
  display: inline-block;
}

.tree :deep(a:hover) {
  color: #3273dc;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100vw;
    left: -100vw;
  }
  
  .sidebar.is-open {
    left: 0;
  }
}
</style>
