import axios from 'axios'
import { config, getEndpointURL } from '../../config'

export default {
  namespaced: true,
  state: {
    articles: [],
    currentArticle: null,
    loading: false
  },
  mutations: {
    SET_ARTICLES(state, articles) {
      state.articles = articles
    },
    SET_CURRENT_ARTICLE(state, article) {
      state.currentArticle = article
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    ADD_ARTICLE(state, article) {
      state.articles.unshift(article)
    },
    UPDATE_ARTICLE(state, updatedArticle) {
      const index = state.articles.findIndex(a => a.id === updatedArticle.id)
      if (index !== -1) {
        state.articles.splice(index, 1, updatedArticle)
      }
      if (state.currentArticle && state.currentArticle.id === updatedArticle.id) {
        state.currentArticle = updatedArticle
      }
    },
    DELETE_ARTICLE(state, articleId) {
      state.articles = state.articles.filter(a => a.id !== articleId)
      if (state.currentArticle && state.currentArticle.id === articleId) {
        state.currentArticle = null
      }
    }
  },
  actions: {
    // 記事一覧取得
    async fetchArticles({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.get(config.api.endpoints.wiki.articles)
        commit('SET_ARTICLES', response.data.articles)
        return { success: true, data: response.data.articles }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.error || '記事一覧の取得に失敗しました' 
        }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // 記事詳細取得
    async fetchArticle({ commit }, articleId) {
      commit('SET_LOADING', true)
      try {
        const url = getEndpointURL(config.api.endpoints.wiki.articleDetail, { id: articleId })
        const response = await axios.get(url)
        commit('SET_CURRENT_ARTICLE', response.data)
        return { success: true, data: response.data }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.error || '記事が見つかりません' 
        }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // 記事作成
    async createArticle({ commit }, articleData) {
      try {
        const response = await axios.post(config.api.endpoints.wiki.articles, articleData)
        commit('ADD_ARTICLE', response.data)
        return { success: true, data: response.data }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.error || '記事の作成に失敗しました' 
        }
      }
    },

    // 記事更新
    async updateArticle({ commit }, { articleId, articleData }) {
      try {
        const url = getEndpointURL(config.api.endpoints.wiki.articleDetail, { id: articleId })
        const response = await axios.put(url, articleData)
        commit('UPDATE_ARTICLE', response.data)
        return { success: true, data: response.data }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.error || '記事の更新に失敗しました' 
        }
      }
    },

    // 記事削除
    async deleteArticle({ commit }, articleId) {
      try {
        const url = getEndpointURL(config.api.endpoints.wiki.articleDetail, { id: articleId })
        await axios.delete(url)
        commit('DELETE_ARTICLE', articleId)
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.error || '記事の削除に失敗しました' 
        }
      }
    },

    // 共有記事取得
    async fetchSharedArticle({ commit }, shareId) {
      commit('SET_LOADING', true)
      try {
        const url = getEndpointURL(config.api.endpoints.share.article, { shareId })
        const response = await axios.get(url)
        commit('SET_CURRENT_ARTICLE', response.data)
        return { success: true, data: response.data }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.error || '共有記事が見つかりません' 
        }
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  getters: {
    articles: state => state.articles,
    currentArticle: state => state.currentArticle,
    loading: state => state.loading
  }
}
