module.exports = function Electron(Browsr, SocketServer){
  
  const {app, BrowserWindow, session, ipcMain} = require('electron');
  const cheerio = require('cheerio');
  let socketSever =  SocketServer;
  
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
    win.webContents.on('dom-ready', function(){
      app.runJS(function(){
        createUniqueIDS();
        createObserver();
      })
    });
    win.webContents.on('did-finish-load', function(){
      app.prePagePipe().then(function(html){
        socketSever.broadcast('page', html);
      }).catch(console.log);
    });
    win.webContents.session.webRequest.onBeforeRequest([], function(details, callback){
      callback({cancel: false});
    });
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

  app.setWindow = function(dimensions){
    win.setSize(dimensions.width, dimensions.height);
  };

  app.processEvent = function(event, uuid){
    console.log(arguments);
    app.runJS(function(event, uuid){
      console.log(arguments);
      let eventClass = null;
      var doc;
      let node = document.querySelector(`[data-browsr-id='${uuid}']`);
      if(!node){
        return;
      }
      if (node.ownerDocument) {
          doc = node.ownerDocument;
      } else if (node.nodeType == 9){
          // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
          doc = node;
      } else {
          throw new Error("Invalid node passed to fireEvent: " + node.id);
      }
      switch (event.type) {
        case "click": 
        case 'mouseover':
        case 'mouseout':
        case 'mouseenter':
        case 'mouseleave':
        case "mousedown":
        case "mouseup":
          eventClass = "MouseEvents";
          break;
        case "focus":
        case "blur":
        case 'focusin':
        case 'focusout':
          eventClass = 'FocusEvent';
        break;

        case "change":
        case "select":
          eventClass = "HTMLEvents";
          break;
        default:
          return;
          break;
      }

      let triggeredEvent = doc.createEvent(eventClass);
      triggeredEvent.initEvent(event.type, true, true);
      triggeredEvent.synthetic = true;
      node.dispatchEvent(triggeredEvent);
     
    }, event, uuid).then(function(){
      //socket.emit('update', new Date());
    });
  };

  ipcMain.on('dom-event', function(event, domchange){
    socketSever.broadcast('dom-change', domchange);
  });


  app.loadPage = function(url){
    win.loadURL(url);
   
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
          if(node.getAttribute('rel') === 'stylesheet'){
            base64r(node.href, true, function(base64){
              if(base64){
                node.href = base64;
              }
            });
          }
        });
      });

      /*
      await app.runJS(function(){
        function uuidv4() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        }
        document.querySelectorAll('*').forEach(function(node) {
          node.setAttribute('data-browsr-id', uuidv4());
        });
      });
      */

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