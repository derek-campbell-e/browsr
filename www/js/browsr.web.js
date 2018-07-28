module = {};
module.exports = function BrowsrWeb(){
  const socket = io('http://localhost:8006');
  let bw = {};

  bw.dimensions = {};
  bw.dimensions.width = $(window).width();
  bw.dimensions.height = $(window).height();

  bw.loadDom = function(html){
    document.documentElement.innerHTML = html;
  };

  bw.domChange = function(mutation){;
    let target = $(`[data-browsr-id='${mutation.target}']`);
    switch(mutation.type){
      case 'attributes':
        target.attr(mutation.attributeName, mutation.currentValue);
      break;
      case 'childList':
        for(let obj of mutation.addedNodes){
          let index = obj.index;
          let node = document.createElement('div');
          node.outerHTML = obj.html;
          console.log(obj.parent);
          let parent = document.querySelector(`[data-browsr-id='${obj.parent}']`);
          try {
            parent.insertBefore(node, parent.children[index]);
          } catch (error){
            console.log("NO PARENT,", obj);
          }
        }
        for(let obj of mutation.removedNodes){
          let parent = document.querySelector(`[data-browsr-id='${obj.parent}']`);
          parent.children[obj.index].remove();
        }
      break;
      default:
        console.log(mutation);
      break;
    }
  };

  let bind = function(){
    let mouseEvents = `mousedown mouseup mousemove mouseover mouseout mouseenter 
    mouseleave`;
    
    $(window).scroll(function(){
      let exports = {};
      exports.type = 'scroll';
      exports.target = 'window';
      exports.pos = {x: $(window).scrollLeft(), y: $(window).scrollTop()};
      socket.emit('dom-event-client', exports, 'window');
      console.log("SCROLLIN");
    });

    $(document).on(`keypress blur focus load resize scroll unload click 
    dblclick  change select submit  error` + mouseEvents, '*', function(e){
      //socket.emit.apply(socket, ['log', e]);
      e.stopPropagation();
      let dom = $(this);
      let id = dom.attr('data-browsr-id');
      let type = e.type;
      let exports = {};
      exports.type = type;
      exports.target = id;
      //console.log(e);
      let cancel = true;
      switch(type){
        case 'blur':
        case 'focus':
        case 'focusin':
        case 'focusout':
        break;
        case 'keydown':
        case 'keypress':
        case 'keyup':
          cancel = false;
          if(!id){
            break;
          }
          
          exports.target = $(e.target).attr('data-browsr-id');
          exports.key = e.key;
          exports.code = e.key;
          exports.keyCode = e.keyCode;
          exports.shiftKey = e.shiftKey;
          exports.metaKey = e.metaKey;
          exports.ctrlKey = e.ctrlKey;
          exports.charCode = e.charCode;
          exports.altKey = e.altKey;
          id = exports.target;
        break;
        case 'click':
          if($(e.target).is(":input")){
            console.log("NOT CANCELLING");
            cancel = false;
          }
        break;
      }
      socket.emit('dom-event-client', exports, id);
      return !cancel;
    });
    socket.on('connect', function(){
      console.log('CONNECTED');
      socket.emit('window-dimensions', bw.dimensions);
    });
    $(window).on('resize', function(){
      bw.dimensions.width = $(window).width();
      bw.dimensions.height = $(window).height();
      socket.emit('window-dimensions', bw.dimensions);
    });
    socket.on('page', bw.loadDom);
    socket.on('dom-change', bw.domChange);
    socket.on('image', bw.imageHandler);
  };

  let init = function(){
    bind();
    return bw;
  }

  return init();
};

const browsrWeb = new module.exports();


