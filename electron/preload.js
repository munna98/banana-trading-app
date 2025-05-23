// ELECTRON PRELOAD SCRIPT
// electron/preload.js

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  printInvoice: (invoiceData) => ipcRenderer.invoke('print-invoice', invoiceData)
});
