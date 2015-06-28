router-middleware
=================

This is a minimal middleware stack that supports unlimited middleware routes and express-like routing.

example
-------

  var http = require('http');
  var router = require('router-middleware');
  var server = http.createServer(router)
  server.listen(5050);

  var val = 0;
  var a = function(req,res,next) {
    val++
    next()
  }
  var b = function(req,res,next) {
    val++
    next()
  }
  var c = function(req,res,next) {
    val++
    res.end("the article!\n");
  }

  router.get('/article',a,b,c); // "the article!"
  // and val == 3

router-middleware accepts any HTTP verb as listed in the [methods moudle](https://github.com/jshttp/methods)

with ecstatic
-------------

  var router = require('router-middleware');
  var ecstatic = require('ecstatic')({root:__dirname })
  var server = http.createServer(router)
  server.listen(5050);
  
  router.get('/foo', ecstatic)
  
setting status code handlers 
----------------------------

  router.404(fn)
