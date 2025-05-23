// ELECTRON MAIN PROCESS
// electron/main.js

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { printInvoice } = require('./printer');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200, 
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/logo.png')
  });

  // Load the Next.js app
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../out/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle thermal printer integration
ipcMain.handle('print-invoice', async (event, invoiceData) => {
  try {
    await printInvoice(invoiceData);
    return { success: true };
  } catch (error) {
    console.error('Printing failed:', error);
    return { success: false, error: error.message };
  }
});
