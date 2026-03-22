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

  // Follow system theme (no forced override)
  
  ipcMain.on('show-notification', (event, { title, body }) => {
    new Notification({ title, body }).show();
  });

  // Theme detection IPC
  ipcMain.handle('get-theme', () => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  });

  nativeTheme.on('updated', () => {
    const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
    if (mainWindow) {
      mainWindow.webContents.send('theme-changed', theme);
    }
  });

  // Send system accent color to renderer
  function getSystemAccentColor() {
    try {
      const raw = systemPreferences.getAccentColor();
      if (raw && raw.length >= 6) return '#' + raw.substring(0, 6);
      return '#007AFF'; // Apple default blue
    } catch { return '#007AFF'; }
  }

  ipcMain.handle('get-accent-color', () => getSystemAccentColor());

  createWindow();

  // Listen for accent color changes
  let lastAccentColor = getSystemAccentColor();
  function broadcastAccentColor() {
    if (!mainWindow) return;
    const color = getSystemAccentColor();
    if (color !== lastAccentColor) {
      lastAccentColor = color;
      mainWindow.webContents.send('accent-color-changed', color);
    }
  }

  if (process.platform === 'darwin') {
    // macOS notification for accent color changes
    systemPreferences.subscribeNotification('AppleColorPreferencesChangedNotification', broadcastAccentColor);
    // Polling failsafe every 3s (notification can miss sometimes)
    setInterval(broadcastAccentColor, 3000);
  } else if (process.platform === 'win32') {
    // Windows accent color change event
    systemPreferences.on('accent-color-changed', (_event, color) => {
      if (mainWindow) mainWindow.webContents.send('accent-color-changed', '#' + color.substring(0, 6));
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
