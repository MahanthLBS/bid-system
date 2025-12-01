const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, 'assets/icon.png'), // Optional: add icon
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true, // Security: enable context isolation
      sandbox: true, // Security: enable sandbox
      webSecurity: true, // Security: enable web security
      allowRunningInsecureContent: false // Security: disable insecure content
    },
    show: false, // Don't show until ready
    backgroundColor: '#1e1e1e' // Dark background while loading
  });

  // Show window when ready
  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });

  // Load your FastAPI web UI
  const appUrl = process.env.APP_URL || "http://192.168.0.20:8000";
  
  // Try to load the app
  win.loadURL(appUrl).catch((err) => {
    console.error("Failed to load app:", err);
    
    // Fallback: Show error page
    win.loadFile(path.join(__dirname, 'error.html')).then(() => {
      win.webContents.executeJavaScript(`
        document.body.innerHTML = 
          '<div style="padding: 40px; text-align: center;">
            <h2>🚨 BID System Connection Error</h2>
            <p>Unable to connect to: ${appUrl}</p>
            <p>Please ensure the backend server is running.</p>
            <button onclick="location.reload()">Retry Connection</button>
          </div>'
      `);
    });
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }

  // Handle external links
  win.webContents.setWindowOpenHandler(({ url }) => {
    // Allow same-origin links to open in the app
    if (url.startsWith(appUrl)) {
      return { action: 'allow' };
    }
    // Block external links
    return { action: 'deny' };
  });
}

// Single instance lock - prevent multiple app instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Optional: Create error.html for fallback
// error.html would be a simple HTML file in your project