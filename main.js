const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, screen } = require('electron');
const path = require('path');
const AutoLaunch = require('auto-launch');

let mainWindow;
let tray;
let isExpanded = false;

const PILL_WIDTH = 340;
const PILL_HEIGHT = 68;
const EXPANDED_WIDTH = 420;
const EXPANDED_HEIGHT = 640;

const autoLauncher = new AutoLaunch({
  name: 'Miti',
  path: app.getPath('exe'),
});

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    x: screenWidth - PILL_WIDTH - 20,
    y: 20,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'src', 'assets', 'icon.png'),
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  mainWindow.setVisibleOnAllWorkspaces(true);

  // Enable dragging
  mainWindow.on('will-move', () => {
    // Allow window to be dragged
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  // Create a simple tray icon using nativeImage
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAABUklEQVQ4y6WTzUrDQBSFv0kntVZBF+5cuXHhE/gEvpYv4BO4daHgQl0oiIiCKFRbm2Qmf+MiaSZpOngWM3PvN+feuYOqcl4RzlkfA7z80nI9mmF7AdwBLtACnk/r9CxDfAW0gCew+LOUXpAOwKsq21jXalxjigTcA59OA2aBV8BWWk9vqkoJ0v4DwJoO7AGPxjVL7cjmYPxIJGMFGmBnHJhEkWw4E7gAdsZJG3gEtjP2sCW4F4YA9cLvKoLU9O0xzuv4K+AL+D15BWQ95I+UAayBfQnAD0JuAGmk5erqhSJ2AfugUfgfdjxZynnALvAPrCXAlZUNbFtW4wxJEkSq6p/gS/AO+NapVLhlUpFVVVa1poSkA/A+4BW+j4HtNJz3wNBlu1IMAIwn2G/L5JIXQJ5oAddnyfPg6kp0j+AlcyDZnMa4Bz4H/0B/AKuwn/rKSV5eAAAAABJRU5ErkJggg=='
  );

  tray = new Tray(icon);
  
  const updateTrayMenu = () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '📅 Miti — मिति',
        enabled: false,
      },
      { type: 'separator' },
      {
        label: isExpanded ? 'Compact Mode' : 'Expand Calendar',
        click: () => {
          toggleExpand();
        },
      },
      {
        label: 'Show/Hide',
        click: () => {
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Auto-start with Windows',
        type: 'checkbox',
        checked: true,
        click: (menuItem) => {
          if (menuItem.checked) {
            autoLauncher.enable();
          } else {
            autoLauncher.disable();
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Quit Miti',
        click: () => {
          app.quit();
        },
      },
    ]);
    tray.setContextMenu(contextMenu);
  };

  updateTrayMenu();
  tray.setToolTip('Miti — मिति');

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
      }
    }
  });
}

function toggleExpand() {
  if (!mainWindow) return;

  const bounds = mainWindow.getBounds();
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  if (isExpanded) {
    // Collapse to pill
    isExpanded = false;
    mainWindow.setSize(PILL_WIDTH, PILL_HEIGHT, true);
    // Keep within screen
    let newX = bounds.x;
    let newY = bounds.y;
    if (newX + PILL_WIDTH > screenWidth) newX = screenWidth - PILL_WIDTH - 10;
    if (newY + PILL_HEIGHT > screenHeight) newY = screenHeight - PILL_HEIGHT - 10;
    mainWindow.setPosition(newX, newY);
    mainWindow.webContents.send('toggle-expand', false);
  } else {
    // Expand to full
    isExpanded = true;
    // Adjust position so expanded window stays on screen
    let newX = bounds.x;
    let newY = bounds.y;
    if (newX + EXPANDED_WIDTH > screenWidth) newX = screenWidth - EXPANDED_WIDTH - 10;
    if (newY + EXPANDED_HEIGHT > screenHeight) newY = screenHeight - EXPANDED_HEIGHT - 10;
    if (newX < 0) newX = 10;
    if (newY < 0) newY = 10;
    mainWindow.setPosition(newX, newY);
    mainWindow.setSize(EXPANDED_WIDTH, EXPANDED_HEIGHT, true);
    mainWindow.webContents.send('toggle-expand', true);
  }
}

// IPC Handlers
ipcMain.on('toggle-expand', () => {
  toggleExpand();
});

ipcMain.on('minimize-to-tray', () => {
  if (mainWindow) mainWindow.hide();
});

ipcMain.on('close-app', () => {
  app.quit();
});

ipcMain.on('set-always-on-top', (event, value) => {
  if (mainWindow) mainWindow.setAlwaysOnTop(value);
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();

  // Enable auto-launch by default
  autoLauncher.isEnabled().then((isEnabled) => {
    if (!isEnabled) autoLauncher.enable();
  });
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
