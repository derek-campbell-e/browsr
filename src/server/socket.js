module.exports = function SocketServer(Browsr, Server){
  let ss = {};

  const io = require('socket.io')(Server);
  ss.socket = null;

  io.on('connection', function (socket) {
    ss.socket = socket;
    socket.on('url', function(url){
      Browsr.server.browser.loadPage(url);
    });
    socket.on('dom-event-client', function(){
      Browsr.server.browser.processEvent.apply(null, arguments);
    });
  });

  return ss;
};