module.exports = function SocketServer(Browsr, Server){
  const EventEmitter = require('events').EventEmitter;
  let ss = new EventEmitter();

  const io = require('socket.io')(Server);

  let sockets = {};

  ss.broadcast = function(){
    for(let socketID in sockets){
      let socket = sockets[socketID];
      socket.emit.apply(socket, arguments);
    }
  };

  io.on('connection', function (socket) {
    sockets[socket.id] = socket;
    socket.on('disconnect', function(){
      sockets[socket.id] = null;
      delete sockets[socket.id];
    });
    socket.on('url', function(url){
      Browsr.server.browser.loadPage(url);
    });
    socket.on('dom-event-client', function(){
      Browsr.server.browser.processEvent.apply(null, arguments);
    });
    socket.on('window-dimensions', function(dim){
      Browsr.server.browser.setWindow(dim);
    });
    socket.on('log', function(){
      console.log.apply(console, ['WEB LOG:',...arguments]);
    });
  });

  return ss;
};