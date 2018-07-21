module.exports = function Electron(Browsr){
  
  const {app, BrowserWindow, session, ipcMain} = require('electron');
  const cheerio = require('cheerio');
  
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  let win
  
  function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({
      width: 800, 
      height: 600, 
      show: true, 
      x:2900, 
      y:0, 
      webPreferences:{
        nodeIntegration: false,
        preload: require('path').join(__dirname, './preload.js')
      },
    })
  
    // and load the index.html of the app.
    //win.loadURL(URL)
  
    // Open the DevTools.
    //win.webContents.openDevTools()
  
    // Emitted when the window is closed.
    win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null
    })
  }
  
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow)
  
  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow()
    }
  });

  app.processEvent = function(event, uuid){
    app.runJS(function(event, uuid){
      console.log(arguments);
      let triggeredEvent = new CustomEvent(event.type, event);
      let element = document.querySelector(`[data-browsr-id='${uuid}']`);
      if(!element){
        return;
      }
      document.querySelector(`[data-browsr-id='${uuid}']`).dispatchEvent(triggeredEvent);
    }, event, uuid).then(function(){
      //socket.emit('update', new Date());
    });
  };

  app.loadPage = function(url){
    const socket = Browsr.server.socket.socket;
    ipcMain.on('dom-event', function(event, domchange){
      console.log(domchange);
    });
    socket.on('click', function(uuid){
      app.runJS(function(uuid){
        document.querySelector(`[data-browsr-id='${uuid}']`).click();
      }, uuid).then(function(){
        socket.emit('update', new Date());
      });
    });

    win.loadURL(url);
    win.webContents.on('dom-ready', function(){
      app.runJS(function(){
        createObserver();
      })
    });
    win.webContents.on('did-finish-load', function(){
      app.prePagePipe().then(function(html){
        socket.broadcast.emit('page', html);
      }).catch(console.log);
    });
  };

  app.prePagePipe = function(){
    return new Promise(async function(resolve, reject){

      await app.runJS(function(){
        document.querySelectorAll('*').forEach(function(node) {
          if(typeof node.src === 'undefined' || node.src.length === 0){
            return;
          }
          let currentURL = window.location.href;
          let isAbsolute = new RegExp('^(?:[a-z]+:)?//', 'i');
          if(isAbsolute.test(node.src)){
            node.src = new URL(node.src, currentURL);
          }
        });
      });

      await app.runJS(function(){
        document.querySelectorAll('*').forEach(function(node) {
          if(typeof node.href === 'undefined' || node.href.length === 0){
            return;
          }
          let currentURL = window.location.href;
          let isAbsolute = new RegExp('^(?:[a-z]+:)?//', 'i');
          if(isAbsolute.test(node.href)){
            node.href = new URL(node.href, currentURL);
          }
        });
      });

      await app.runJS(function(){
        function uuidv4() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        }
        document.querySelectorAll('body *').forEach(function(node) {
          node.setAttribute('data-browsr-id', uuidv4());
        });
      });

      let html = await app.runJS(function(){
        return document.documentElement.innerHTML;
      });

      let $ = cheerio.load(html);
      $('noscript').remove();
      $('script').remove();
      resolve($.html());
    });
  };

  app.runJS = function(func, ...args){
    return new Promise(function(resolve, reject){
      const js = require('./javascript').apply(null, [func,...args]);
      win.webContents.executeJavaScript(js).then(resolve).catch(reject);
    });
  };

  let exitHandler = function(){
    app.quit();
    process.kill(process.pid, 'SIGUSR2');
  };

  process.on('exit', exitHandler)
  process.on('SIGINT', exitHandler)
  process.on('SIGTERM', exitHandler)
  process.on('SIGQUIT', exitHandler)
  process.on('SIGHUP', exitHandler)
  process.on('SIGBREAK', exitHandler)

  return app;

};