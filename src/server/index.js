module.exports = function ServerPeripherial(Broswr){
  let sp = {};
  sp.socket = require('./socket')(Broswr);
  sp.browser = require('./browser')(Broswr);
  return sp;
};