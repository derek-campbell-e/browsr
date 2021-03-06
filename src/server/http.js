module.exports = function HTTP(Browsr){
  const express = require('express');
  const app = express();
  const server = require('http').Server(app);
  const fs = require('fs');
  const path = require('path');
  const request = require('request');

  app.use(express.static(path.join(process.cwd(), 'www')));

  app.get('/p', function(req, res){
    let url = req.query.url;
    request.get(url).pipe(res);
  });

  app.get('/load', function(req, res){
    let url = req.query.url;
    Browsr.server.browser.loadPage(url);
    res.send(url);
  });

  server.listen(8006);
  return server;
};