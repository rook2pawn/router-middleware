router-middleware
=================

This is a minimal middleware stack that supports unlimited middleware routes and express-like routing.

Cleanly supports a fileserver in tandem with custom GET routes.

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

router-middleware accepts any HTTP verb as listed in the [methods module](https://github.com/jshttp/methods)

with ecstatic fileserver
------------------------

    var router = require('router-middleware');
    var ecstatic = require('ecstatic')({root:__dirname })
    var server = http.createServer(router)
    server.listen(5050);

    router.fileserver(ecstatic)
    router.get('/foobar', function(req,res,next) {
      // any custom routes have precedence over fileserver
    })
  
setting status code handlers 
----------------------------

    router[404](function(req,res) {
      res.writeHead(404);
      res.write("not found :-(");
      res.end() 
    })
