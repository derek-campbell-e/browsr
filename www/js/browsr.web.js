module = {};
module.exports = function BrowsrWeb(){
  const socket = io('http://localhost:8006');
  let bw = {};

  bw.loadDom = function(html){
    let $html = $(html);
    $(document).find('head').html($html.find('head').html());
    $html.find('head').remove();
    $(document).find('body').html($html);
  };

  bw.domChange = function(mutation){
    let target = $(`[data-browsr-id='${mutation.target}']`);
    switch(mutation.type){
      case 'attributes':
        target.attr(mutation.attributeName, mutation.currentValue);
      break;
    }
  };

  let bind = function(){
    $(document).on(`blur focus focusin focusout load resize scroll unload click 
    dblclick mousedown mouseup mousemove mouseover mouseout mouseenter 
    mouseleave change select submit keydown keypress keyup error`, '*', function(e){
      let dom = $(this);
      let id = dom.attr('data-browsr-id');
      let type = e.type;
      socket.emit('dom-event-client', e, id);
      return false;
    });
    socket.on('connect', function(){
      console.log('CONNECTED');
    });
    socket.on('page', bw.loadDom);
    socket.on('dom-change', bw.domChange);
  };

  let init = function(){
    bind();
    return bw;
  }

  return init();
};

const browsrWeb = new module.exports();


