// Notification system for KantinKu
function showNotification(message, type = 'info') {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    document.body.appendChild(notification);
    
    // Add styles if not already added
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        #notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 12px 20px;
          border-radius: 4px;
          color: white;
          font-weight: bold;
          z-index: 1000;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.3s, transform 0.3s;
          box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        }
        #notification.show {
          opacity: 1;
          transform: translateY(0);
        }
        #notification.success { background-color: #4CAF50; }
        #notification.error { background-color: #F44336; }
        #notification.warning { background-color: #FF9800; }
        #notification.info { background-color: #2196F3; }
      `;
      document.head.appendChild(style);
    }
  }
  
  // Set notification content and type
  notification.textContent = message;
  notification.className = `notification ${type}`;
  
  // Show notification
  notification.classList.add('show');
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}