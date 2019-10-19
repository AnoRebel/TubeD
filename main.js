// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const { showAboutWindow, aboutMenuItem } = require('electron-util');
const contextMenu = require('electron-context-menu');
const path = require('path');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, modal

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    backgroundColor: '#2d3748',
    width: 640,
    height: 480,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('src/index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // var menu = Menu.buildFromTemplate([{
  //   label: 'Help',
  //   submenu: [
  //     aboutMenuItem({
  //       icon: path.join(__dirname, 'src/static/images/*'),
  //       copyright: 'Copyright (C) Ano Rebel',
  //       text: 'Simple youtube video and audio downloader.'
  //     })
  //   ],[
  //     openUrlMenuItem({
  //       label: 'Source Code',
  //       url: 'https://github.com/anorebel/TubeD'
  //     })
  //   ]
  // }])

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// showAboutWindow({
//   icon: path.join(__dirname, 'src/static/images/*'),
//   copyright: 'Copyright (C) Ano Rebel',
//   text: 'Simple youtube video and audio downloader.'
// })

contextMenu({
  prepend: (defaultActions, params, browserWindow) => [{
    label: 'Image',
    // Only show it when right-clicking images
    visible: params.mediaType === 'image'
  },
  {
    label: 'Search Google for "{selection}"',
    // Only show it when right-clicking text
    visible: params.selectionText.trim().length > 0,
    click: () => {
      shell.openExternal(`https://google.com/search?q=${encodeURIComponent(params.selectionText)}`);
    }
  }]
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('data', (event, args) => {
  clearTimeout();
  modal = new BrowserWindow({
    backgroundColor: '#2d3748',
    parent: mainWindow,
    modal: true,
    frame: false,
    alwaysOnTop: true,
    // transparent: true,
    height: 200,
    width: 400,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  modal.on('closed', function () { win = null })
  modal.loadFile('src/download.html')

  // console.log(args);
  // console.log('Frame ID: ', event.frameId);
  modal.webContents.on('did-finish-load', () => {
    modal.webContents.send('download', args)
  })
  modal.show()
});
