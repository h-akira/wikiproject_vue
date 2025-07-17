export default {
  install(app) {
    const toast = {
      success(message) {
        this.show(message, 'success')
      },
      error(message) {
        this.show(message, 'danger')
      },
      info(message) {
        this.show(message, 'info')
      },
      warning(message) {
        this.show(message, 'warning')
      },
      show(message, type = 'info') {
        const notification = document.createElement('div')
        notification.className = `notification is-${type} toast-notification`
        notification.innerHTML = `
          <button class="delete"></button>
          ${message}
        `
        
        // スタイリング
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          max-width: 400px;
          animation: slideIn 0.3s ease-out;
        `
        
        document.body.appendChild(notification)
        
        // 削除ボタンのイベントリスナー
        const deleteButton = notification.querySelector('.delete')
        deleteButton.addEventListener('click', () => {
          this.remove(notification)
        })
        
        // 自動削除
        setTimeout(() => {
          if (notification.parentNode) {
            this.remove(notification)
          }
        }, 5000)
      },
      remove(notification) {
        notification.style.animation = 'slideOut 0.3s ease-out'
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification)
          }
        }, 300)
      }
    }
    
    // CSS アニメーションを追加
    if (!document.querySelector('#toast-styles')) {
      const style = document.createElement('style')
      style.id = 'toast-styles'
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .toast-notification {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `
      document.head.appendChild(style)
    }
    
    app.config.globalProperties.$toast = toast
  }
}
