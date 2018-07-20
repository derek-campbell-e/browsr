module.exports = function ClientPeripheral(Browsr){
  let cp = {};
  cp.socket = require('./socket')(Browsr);
  return cp;
};