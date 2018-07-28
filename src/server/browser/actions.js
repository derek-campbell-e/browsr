module.exports = function ElectronActions(app){
  let actions = {};

  actions.click = function(selector){
    return app.runJS(function(selector){
      document.activeElement.blur();
      let node = document.querySelector(selector);
      if(!node){
        return false;
      }
      let bounds = node.getBoundingClientRect();
      let event = new MouseEvent('click', {
        view: document.window,
        bubbles: true,
        cancelable: true,
        clientX: bounds.left + bounds.width / 2,
        clientY: bounds.top + bounds.height / 2
      });
      node.dispatchEvent(event);
    }, selector);
  };

  actions.mousedown = function(selector){
    return app.runJS(function(selector){
      let node = document.querySelector(selector);
      if(!node){
        return false;
      }
      let bounds = node.getBoundingClientRect();
      let event = new MouseEvent('mousedown', {
        view: document.window,
        bubbles: true,
        cancelable: true,
        clientX: bounds.left + bounds.width / 2,
        clientY: bounds.top + bounds.height / 2
      });
      node.dispatchEvent(event);
    }, selector);
  };

  actions.mouseup = function(selector){
    return app.runJS(function(selector){
      let node = document.querySelector(selector);
      if(!node){
        return false;
      }
      let bounds = node.getBoundingClientRect();
      let event = new MouseEvent('mouseup', {
        view: document.window,
        bubbles: true,
        cancelable: true,
        clientX: bounds.left + bounds.width / 2,
        clientY: bounds.top + bounds.height / 2
      });
      node.dispatchEvent(event);
    }, selector);
  };

  actions.mouseover = function(selector){
    return app.runJS(function(selector){
      let node = document.querySelector(selector);
      if(!node){
        return false;
      }
      let bounds = node.getBoundingClientRect();
      let event = new MouseEvent('mouseover', {
        view: document.window,
        bubbles: true,
        cancelable: true,
        clientX: bounds.left + bounds.width / 2,
        clientY: bounds.top + bounds.height / 2
      });
      node.dispatchEvent(event);
    }, selector);
  };

  actions.mouseout = function(selector){
    return app.runJS(function(selector){
      let node = document.querySelector(selector);
      if(!node){
        return false;
      }
      let bounds = node.getBoundingClientRect();
      let event = new MouseEvent('mouseout', {
        view: document.window,
        bubbles: true,
        cancelable: true,
        clientX: bounds.left + bounds.width / 2,
        clientY: bounds.top + bounds.height / 2
      });
      node.dispatchEvent(event);
    }, selector);
  };

  actions.focus = function(selector){
    return app.runJS(function(selector){
      document.querySelector(selector).focus()
    }, selector);
  };

  actions.blur = function(selector){
    return app.runJS(function(selector){
      let node = document.querySelector(selector);
      if (node) {
        node.blur();
      }
    }, selector);
  };

  actions.type = function(selector, text){
    return app.runJS(function(selector, text){
      let node = document.querySelector(selector);
      if(!node){
        return false;
      }
      node.focus();
      switch(text){
        case 'Backspace':
          node.value = node.value.slice(0, node.value.length - 1);
        break;
        case 'Enter':
        break;
        case 'Tab':
          node.value += '\t';
        break;
        default:
          node.value += text;
        break;
      } 
      log(node.value);
    }, selector, text);
  };

  actions.scroll = function(pos){
    return app.runJS(function(pos){
      window.scrollTo(pos.x, pos.y);
    }, pos);
  };

  actions.dbi = function(uuid){
    return `[data-browsr-id="${uuid}"]`;
  };

  return actions;
};