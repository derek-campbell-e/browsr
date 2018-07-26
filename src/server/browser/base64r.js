module.exports = function Base64r(url, cssFiltering, callback){
  const request = require('request');
  request.get(url, {}, function(error, response, body){
    if(error){
      return callback(false);
    }
    let data = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
    if(!cssFiltering){
      return callback(data);
    }
    callback(data);
  });
};