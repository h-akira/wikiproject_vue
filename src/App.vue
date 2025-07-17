<template>
  <div id="app">
    <NavBar />
    <Sidebar />
    <main class="main-content" :class="{ 'sidebar-open': sidebarOpen }">
      <router-view />
    </main>
  </div>
</template>

<script>
import NavBar from './components/layout/NavBar.vue'
import Sidebar from './components/layout/Sidebar.vue'
import { mapState } from 'vuex'

export default {
  name: 'App',
  components: {
    NavBar,
    Sidebar
  },
  computed: {
    ...mapState(['sidebarOpen'])
  }
}
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.main-content {
  margin-left: 0;
  transition: margin-left 0.3s ease;
  min-height: calc(100vh - 52px);
  padding-top: 52px;
}

.main-content.sidebar-open {
  margin-left: 250px;
}

.padding-side {
  padding-left: 1rem;
  padding-right: 1rem;
}

.padding-top-10 {
  padding-top: 2.5rem;
}

.padding-bottom-10 {
  padding-bottom: 2.5rem;
}

.card-bordered {
  border: 1px solid #dbdbdb;
}

.tree ul {
  list-style: none;
  padding-left: 1.5rem;
}

.tree li {
  margin: 0.25rem 0;
}

.tree a {
  color: #3273dc;
  text-decoration: none;
}

.tree a:hover {
  text-decoration: underline;
}

.a-white {
  color: white !important;
}

.content pre {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
  padding: 1rem;
  overflow-x: auto;
}

.content blockquote {
  border-left: 4px solid #3273dc;
  margin: 1rem 0;
  padding: 0.5rem 0 0.5rem 1rem;
  background-color: #f8f9fa;
}
</style>
