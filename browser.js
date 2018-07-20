module.exports = function Browser(URL, Socket){
  const Nightmare = require('nightmare');
  const nightmare = Nightmare({ show: true });
  const cheerio = require('cheerio');
  nightmare
    .goto(URL)
    .evaluate(function(){

      function replaceComputedStyle(node){
        let style = window.getComputedStyle(node, null);
        for(let styleTag of style){
          node.style[styleTag] = style.getPropertyValue(styleTag);
        }
      }

      function getBase64Image(img) {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/png");
        return dataURL;//.replace(/^data:image\/(png|jpg);base64,/, "");
      }
    
      function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }

      document.querySelectorAll('body *').forEach(function(node) {
        replaceComputedStyle(node);
      });

      document.querySelectorAll('body *').forEach(function(node) {
        node.setAttribute('data-browsr-id', uuidv4());
      });

      document.querySelectorAll('img').forEach(function(node) {
        node.src = getBase64Image(node);
      });

      return document.documentElement.innerHTML;
    })
    .then(function(html){
      let $ = cheerio.load(html);
      $('script').remove();
      Socket.emit('page', $.html());
    })
    .catch(error => {
      console.error('Search failed:', error)
    });
};