module.exports = function JavascriptCreator(func, ...args){
  let str = ``;
  let createArgArray = function(args){
    if(args.length === 0){
      return `[]`;
    }
    let str = `[`;
    for(let arg of args){
      str += JSON.stringify(arg);
      str += ',';
    }
    str = str.slice(0, str.length -1);
    str += ']';
    return str;
  };
  str = `
    new Promise(function(resolve, reject){
      let func = ${String(func)};
      let args = ${createArgArray(args)};
      let result = null;
      try {
        result = func.apply(null, args);
      } catch (error) {
        return reject(error);
      }
      
      if(result && result.then){
        result.then(resolve).catch(reject);
      } else {
        resolve(result);
      }
    })
  `;
  return str;
};