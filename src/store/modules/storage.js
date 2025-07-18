import axios from 'axios'
import { config, getEndpointURL } from '../../config'

const state = {
  currentPath: '/',
  items: [],
  breadcrumbs: []
}

const getters = {
  currentPath: (state) => state.currentPath,
  currentItems: (state) => state.items,
  breadcrumbs: (state) => state.breadcrumbs,
  uploadConfig: () => config.storage.upload
}

const mutations = {
  SET_CURRENT_PATH(state, path) {
    state.currentPath = path
  },
  SET_ITEMS(state, items) {
    state.items = items
  },
  SET_BREADCRUMBS(state, breadcrumbs) {
    state.breadcrumbs = breadcrumbs
  }
}

const actions = {
  // ファイル一覧取得
  async fetchItems({ commit }, path = '/') {
    try {
      const response = await axios.get(`${config.api.endpoints.storage.upload}?path=${encodeURIComponent(path)}`)
      
      commit('SET_CURRENT_PATH', path)
      commit('SET_ITEMS', response.data.items)
      commit('SET_BREADCRUMBS', generateBreadcrumbs(path))
      
      return response.data
    } catch (error) {
      console.error('Failed to fetch storage items:', error)
      throw error
    }
  },

  // ファイルアップロード
  async uploadFile(_, { fileData }) {
    try {
      const response = await axios.post(config.api.endpoints.storage.upload, fileData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'ファイルアップロードに失敗しました' 
      }
    }
  },

  // ファイル詳細取得
  async fetchFileDetail(_, fileId) {
    try {
      const url = getEndpointURL(config.api.endpoints.storage.fileDetail, { fileId })
      const response = await axios.get(url)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'ファイル情報の取得に失敗しました' 
      }
    }
  },

  // ファイル削除
  async deleteFile(_, fileId) {
    try {
      const url = getEndpointURL(config.api.endpoints.storage.fileDetail, { fileId })
      await axios.delete(url)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'ファイル削除に失敗しました' 
      }
    }
  },

  // 複数ファイルアップロード（プログレス付き）
  async uploadFiles(_, { files, path, onProgress }) {
    const promises = files.map(async (file, index) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('path', path)
      
      const axiosConfig = {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          if (onProgress) {
            onProgress(index, progress)
          }
        }
      }
      
      const response = await axios.post(config.api.endpoints.storage.upload, formData, axiosConfig)
      return response.data
    })
    
    return Promise.all(promises)
  }
}

// パンくずリスト生成ヘルパー
function generateBreadcrumbs(path) {
  const paths = path.split('/').filter(p => p !== '')
  const breadcrumbs = [{ name: 'ホーム', path: '/' }]
  
  let currentPath = ''
  paths.forEach(pathPart => {
    currentPath += '/' + pathPart
    breadcrumbs.push({
      name: pathPart,
      path: currentPath
    })
  })
  
  return breadcrumbs
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
