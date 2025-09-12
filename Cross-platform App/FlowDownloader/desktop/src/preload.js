const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // User data management
  getUserData: () => ipcRenderer.invoke('get-user-data'),
  setUserData: (data) => ipcRenderer.invoke('set-user-data', data),
  clearUserData: () => ipcRenderer.invoke('clear-user-data'),
  
  // Download functionality
  downloadVideo: (downloadData) => ipcRenderer.invoke('download-video', downloadData),
  
  // License management
  validateLicense: (licenseKey) => ipcRenderer.invoke('validate-license', licenseKey),
  
  // File system dialogs
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  
  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  
  // Menu event listeners
  onMenuNewDownload: (callback) => {
    ipcRenderer.on('menu-new-download', callback);
  },
  onMenuSettings: (callback) => {
    ipcRenderer.on('menu-settings', callback);
  },
  
  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Platform detection
contextBridge.exposeInMainWorld('platform', {
  isWindows: process.platform === 'win32',
  isMac: process.platform === 'darwin',
  isLinux: process.platform === 'linux'
});

console.log('Preload script loaded successfully');