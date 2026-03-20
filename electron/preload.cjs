const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  showNotification: (payload) => ipcRenderer.send('show-notification', payload),
  getAccentColor: () => ipcRenderer.invoke('get-accent-color'),
  onAccentColorChanged: (callback) => ipcRenderer.on('accent-color-changed', (_event, color) => callback(color))
});
