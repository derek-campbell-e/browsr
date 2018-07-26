var _setImmediate = setImmediate;
process.once('loaded', function() {
  global.setImmediate = _setImmediate;
});

module.exports = function ElectronPreload(){
  const {ipcRenderer} = require('electron');


  window.base64r = require('./base64r');

  window.contentSecurityPolicy = function(){
    try {
      let head = document.getElementsByTagName('head')[0];
      head.insertAdjacentHTML('afterbegin', `<meta http-equiv="Content-Security-Policy" content="default-src * data: blob: * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * data: blob: 'unsafe-inline';" />`);
    } catch (error){
      console.log(error);
    }
  };

  window.testIPC = function(){
    //ipcRenderer.send('dom-event', 'change');
    ipcRenderer.send.apply(ipcRenderer, ['dom-event', ...arguments]);
  };

  window.createObserver = function(){
    var mutationObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation){
        console.log(mutation);
        if(mutation.attributeName === 'data-browsr-id'){
          return;
        }
        let mut = {};
        mut.type = mutation.type;
        mut.attributeName = mutation.attributeName;
        mut.addedNodes = Array.from(mutation.addedNodes).map(function(node){
          return hasUUID(node, true);
        });
        mut.removedNodes = Array.from(mutation.removedNodes).map(function(node){
          return hasUUID(node, true);
        });
        mut.target = mutation.target.getAttribute('data-browsr-id');
        mut.currentValue = mutation.target.getAttribute(mutation.attributeName);
        if(mut.attributeName === 'src'){
          mut.currentValue = (new URL(mut.currentValue, window.location.href)).href;
        }
        window.testIPC(mut);
      });
    });
  
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
      attributeOldValue: true,
      characterDataOldValue: true
    });
  };

  window.uuidv4 = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  window.hasUUID = function(node, giveIfNull){
    try {
      let hasUUID = node.getAttribute('data-browsr-id');
      if(!hasUUID && giveIfNull){
        let uuid = uuidv4();
        node.setAttribute('data-browsr-id', uuid);
        return uuid;
      }
      return hasUUID;
    } catch (error){

    }
  };

  window.createUniqueIDS = function(){
    document.querySelectorAll('*').forEach(function(node) {
      node.setAttribute('data-browsr-id', uuidv4());
    });
  };

};

module.exports();