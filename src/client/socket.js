module.exports = function ClientSocket(){
  const io = require('socket.io-client');
  let cs = {};
  let socket = io('http://localhost:8006');
  socket.on('connect', function(){
    console.log('connected');
  });
  return cs;
};