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

  bw.domChange = function(mutation){
    console.log(mutation);
    let target = $(`[data-browsr-id='${mutation.target}']`);
    switch(mutation.type){
      case 'attributes':
        target.attr(mutation.attributeName, mutation.currentValue);
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

    $(document).on(`blur focus load resize scroll unload click 
    dblclick  change select submit  error`, '*', function(e){
      let dom = $(this);
      let id = dom.attr('data-browsr-id');
      let type = e.type;
      let exports = {};
      exports.type = type;
      exports.target = id;
      //exports.extra = e;
      console.log(exports);
      socket.emit('dom-event-client', exports, id);
      switch(type){
        case 'blur':
        case 'focus':
        case 'focusin':
        case 'focusout':
        case 'keydown':
        case 'keypress':
        case 'keyup':
          return true;
        break;
        case 'click':
          if($(e.target).is(":input")){
            console.log("NOT CANCELLING");
            return true;
          }
        break;
      }
      return false;
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


