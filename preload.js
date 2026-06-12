const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  toggleExpand: () => ipcRenderer.send('toggle-expand'),
  minimizeToTray: () => ipcRenderer.send('minimize-to-tray'),
  closeApp: () => ipcRenderer.send('close-app'),
  setAlwaysOnTop: (value) => ipcRenderer.send('set-always-on-top', value),
  onToggleExpand: (callback) => ipcRenderer.on('toggle-expand', (event, expanded) => callback(expanded)),
  storeGet: (key) => ipcRenderer.sendSync('store-get', key),
  storeSet: (key, value) => ipcRenderer.send('store-set', key, value),
});
