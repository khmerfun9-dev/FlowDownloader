const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');
const axios = require('axios');

// Initialize electron store for persistent data
const store = new Store();

// Backend API configuration
const API_BASE_URL = 'http://localhost:3001/api';

let mainWindow;
let splashWindow;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  splashWindow.loadFile('src/splash.html');

  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

function createMainWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    icon: path.join(__dirname, '../assets/icon_new.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the web app from localhost or bundled files
  const isDev = process.argv.includes('--dev');
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Try to connect to web server first, fallback to local file
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      console.log('Web server not available, loading local file');
      mainWindow.loadFile('renderer/index.html');
    });
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.close();
    }
    mainWindow.show();
    
    // Focus on window
    if (isDev) {
      mainWindow.focus();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Download',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-download');
          }
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('menu-settings');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About FlowDownloader',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About FlowDownloader',
              message: 'FlowDownloader v1.0.0',
              detail: 'Download videos from YouTube, Instagram, and TikTok with advanced features like watermark removal and multiple format support.'
            });
          }
        },
        {
          label: 'Visit Website',
          click: () => {
            shell.openExternal('https://flowdownloader.com');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  createSplashWindow();
  
  setTimeout(() => {
    createMainWindow();
    createMenu();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for communication with renderer process
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-user-data', () => {
  return {
    token: store.get('authToken'),
    user: store.get('userData'),
    license: store.get('licenseData')
  };
});

ipcMain.handle('set-user-data', (event, data) => {
  if (data.token) store.set('authToken', data.token);
  if (data.user) store.set('userData', data.user);
  if (data.license) store.set('licenseData', data.license);
  return true;
});

ipcMain.handle('clear-user-data', () => {
  store.delete('authToken');
  store.delete('userData');
  store.delete('licenseData');
  return true;
});

ipcMain.handle('download-video', async (event, downloadData) => {
  try {
    const token = store.get('authToken');
    const response = await axios.post(`${API_BASE_URL}/download`, downloadData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Download failed');
  }
});

ipcMain.handle('validate-license', async (event, licenseKey) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/license/validate`, {
      licenseKey
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'License validation failed');
  }
});

ipcMain.handle('show-save-dialog', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Video',
    defaultPath: 'video.mp4',
    filters: [
      { name: 'Video Files', extensions: ['mp4', 'avi', 'mov', 'mkv', 'webm'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return result;
});

ipcMain.handle('show-open-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Download Folder',
    properties: ['openDirectory']
  });
  return result;
});

// Handle app updates and notifications
ipcMain.handle('show-notification', (event, title, body) => {
  new Notification({
    title,
    body
  }).show();
});

console.log('FlowDownloader Desktop App Started');