const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Navigation methods
  navigateTo: (path) => ipcRenderer.send('navigate-to', path),
  
  // Platform info
  platform: process.platform,
  
  // App info
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  // Window controls
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  close: () => ipcRenderer.invoke('close-window'),
  
  // File operations (for future use)
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  
  // System info
  getSystemInfo: () => ipcRenderer.invoke('get-system-info')
});

// Listen for navigation commands from main process
ipcRenderer.on('navigate-to', (event, path) => {
  // This will be handled by the Next.js router
  if (window.next && window.next.router) {
    window.next.router.push(path);
  } else {
    // Fallback: reload the page with the new path
    window.location.href = path;
  }
});

// Prevent context menu in production
if (process.env.NODE_ENV !== 'development') {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
}

// Prevent drag and drop of files
document.addEventListener('dragover', (e) => {
  e.preventDefault();
});

document.addEventListener('drop', (e) => {
  e.preventDefault();
});




