const { app, BrowserWindow, nativeTheme, Notification, ipcMain, systemPreferences, protocol, net } = require('electron');

const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true, supportFetchAPI: true } }
]);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 380, /* Unlocked so responsive CSS can trigger */
    minHeight: 600,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 16, y: 16 },
    vibrancy: 'under-window',
    visualEffectState: 'active',
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  // Load the SvelteKit dev server or built app
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools(); // Uncomment for debugging
  } else {
    mainWindow.loadURL('app://-/');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  protocol.handle('app', (request) => {
    const requestUrl = new URL(request.url);
    let filePath = requestUrl.pathname;
    if (!filePath || filePath === '/') filePath = '/index.html';
    
    // Decode URI to handle spaces and special characters
    filePath = decodeURI(filePath);

    const absolutePath = path.join(__dirname, '../build', filePath);
    
    // SPA fallback: if file not found, serve index.html
    if (!fs.existsSync(absolutePath) || fs.statSync(absolutePath).isDirectory()) {
      return net.fetch(pathToFileURL(path.join(__dirname, '../build/index.html')).toString());
    }
    
    return net.fetch(pathToFileURL(absolutePath).toString());
  });

  nativeTheme.themeSource = 'dark';
  
  ipcMain.on('show-notification', (event, { title, body }) => {
    new Notification({ title, body }).show();
  });

  // Send system accent color to renderer
  ipcMain.handle('get-accent-color', () => {
    try {
      return '#' + systemPreferences.getAccentColor().substring(0, 6);
    } catch { return null; }
  });

  createWindow();

  // Listen for accent color changes (macOS)
  if (process.platform === 'darwin') {
    systemPreferences.subscribeNotification('AppleColorPreferencesChangedNotification', () => {
      if (mainWindow) {
        try {
          const color = '#' + systemPreferences.getAccentColor().substring(0, 6);
          mainWindow.webContents.send('accent-color-changed', color);
        } catch {}
      }
    });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
