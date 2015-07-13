router-middleware
=================

This is a minimal middleware stack that supports unlimited middleware routes and express-like routing.

Cleanly supports a fileserver in tandem with custom GET routes.

Why?
----

While express is quite useful for a "total" package, it is itself a closed ecosystem because it pre-empts the native objects
with augmented express-js mechanics. This pre-emption goes beyond the req and res objects, but also [error handling](https://github.com/rook2pawn/express-domains-issue). This module aims to be agnostic and modifies nothing.

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

with fileserver
---------------

    var router = require('router-middleware');
    var ecstatic = require('ecstatic')({root:__dirname })
    var server = http.createServer(router)
    server.listen(5050);

    router.fileserver(ecstatic)
    router.get('/foobar', function(req,res,next) {
      // any custom routes have precedence over fileserver
    })

if fileserver is set, will serve as next() at the end of any GET middleware chain
---------------------------------------------------------------------------------

    var qs = require('querystring'); var url = require('url');
    router.get('/admin', function(req,res,next) {
      var obj = qs.parse(url.parse(req.url).query);
      if (obj.token == validtoken) 
        next() // will move to fileserver
    })

  
setting status code handlers 
----------------------------

    router[404](function(req,res) {
      res.writeHead(404);
      res.write("not found :-(");
      res.end() 
    })

routing via custom conditional functions
----------------------------------------

instead of a text string to match the url basename, you can instead have a function evaluate based on the url path basename. 

    router.get(function(pathname) {
      if (pathname.indexOf('/p') === 0)  
        return true
    }, function(req,res,next) {
      res.write(' :p ')
      res.end()
    })

    // GET /piano  --> :p

