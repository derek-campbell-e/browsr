module.exports = function Base64r(url, cssFiltering, callback){
  const URL = require('url').URL;
  const request = require('request');
  request.get(url, {}, function(error, response, body){
    
    if(error){
      return callback(false);
    }

    let data = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');

    if(!cssFiltering){
      return callback(data);
    }

    let backgroundImagesRegex = /background-image:url\(["'](.*?)["']\)/g;

    body = body.replace(backgroundImagesRegex, function(match, bgURL){
      let urlObject = new URL(bgURL, url);
      let newURL = 'http://localhost:8006/p?url=' + urlObject.href;
      return `background-image:url("${newURL}");`;
    });

    data = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
    callback(data);
  });
};