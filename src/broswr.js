module.exports = function Browsr(options){
  let br = {};

  switch(options.peripheral){
    case 'client':
      br.peripheral = require('./client')(br);
    break;
    case 'server':
      br.peripheral = require('./server')(br);
    break;
  }
  
  return br;
};