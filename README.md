Write fully featured http services without the bloat

[![Build Status](https://travis-ci.org/rook2pawn/router-middleware.svg?branch=master)](https://travis-ci.org/rook2pawn/router-middleware)

router-middleware
=================

Supports
========
* Express style routing
* Parameterized routes
* Any template engines 
* Any fileserver
    
Uses any Template Engine
========================
* Any Express-compatible template engine
* Any stream-based template engine

Uses any Fileserver
===================
* Ecstatic
* etc.

Example
=======
    var http = require('http')
    var router = require('router-middleware')

    router.get('/user/:username', function(req,res,next) {
      res.writeHead(200)
      res.end("Hello " + res.body.username + "!")
    })    
 
    // GET /user/joe
    // Hello joe!

With a Fileserver - (ecstatic)
=============================
    var http = require('http')
    var router = require('router-middleware')
    var ecstatic = require('ecstatic')({root:__dirname })

    router.fileserver(ecstatic)

    // any custom routes you set will have precedence 
    // all other GET requests falls-through to the fileserver


Contributions
=============

Contributions are welcome! Pull requests are promptly reviewed.


License
=======

MIT
