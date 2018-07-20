module.exports = function ElectronPreload(){
  const {ipcRenderer} = require('electron');


  window.testIPC = function(){
    ipcRenderer.send('dom-event', 'change');
    ipcRenderer.send.apply(ipcRenderer, ['dom-event', ...arguments]);
  };

  window.createObserver = function(){
    var mutationObserver = new MutationObserver(function(mutations) {
      //console.log(mutations);
      //window.testIPC(mutations);
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

  

};

module.exports();