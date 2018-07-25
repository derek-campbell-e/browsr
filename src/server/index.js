module.exports = function ServerPeripherial(Browsr){
  let sp = {};
  sp.http = require('./http')(Browsr);
  sp.socket = require('./socket')(Browsr, sp.http);
  sp.browser = require('./browser')(Browsr, sp.socket);
  
  
  
  return sp;
};