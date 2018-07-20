module.exports = function SocketServer(Broswr){
  let ss = {};
  const app = require('http').createServer(function(){});
  const io = require('socket.io')(app);

  app.listen(8006);

  io.on('connection', function (socket) {
    console.log("WE GOT A SOCKET");
    socket.io = io;
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
      console.log(data);
    });
    socket.on('url', function(url){
      Broswr.peripheral.browser.loadPage(url, socket);
    });
  });

  return ss;
};