import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { spawn } from 'child_process'
import { decode } from 'iconv-lite'
import { globalShortcut } from 'electron'
import path from 'path'

let pythonProcess = null
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    // const test_python_link = 'G:\\czr\\AutoStzb\\AutoStzb\\toolkit\\python.exe'
    // const test_file_link = 'G:\\czr\\AutoStzb\\AutoStzb\\start.py'
    // 链接替换成正式项目链接
    const python_link = './toolkit/python.exe'
    const file_link = './start.py'
    if (pythonProcess == null) {
      pythonProcess = spawn(python_link, ['-u', file_link])
      pythonProcess.stdout.on('data', (data) => {
        data = decode(data, 'utf-8')
        if (data.includes('Running on all addresses.')) {
          setTimeout(() => {
            mainWindow.show()
          }, 2000)
        }
        pythonProcess.stderr.on('data', (data) => {
          data = decode(data, 'utf-8')
          mainWindow.webContents.send('shell_error', data)
          console.error('stderr: ', decode(data, 'utf-8'))
        })
        pythonProcess.on('close', (code) => {
          mainWindow.webContents.send('shell_close', code)
        })
        // console.log('stdout:', decode(data, 'utf-8'))
      })
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openPath('')
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
app.on('ready', () => {
  // 注册Ctrl+R快捷键
  globalShortcut.register('CommandOrControl+R', () => {
    // 找到当前获得焦点的窗口并刷新
    let focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) {
      focusedWindow.reload()
    }
  })
})
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    globalShortcut.unregisterAll()
    pythonProcess.kill()
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
