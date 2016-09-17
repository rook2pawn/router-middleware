Write fully featured http services without the bloat

[![Build Status](https://travis-ci.org/rook2pawn/router-middleware.svg?branch=master)](https://travis-ci.org/rook2pawn/router-middleware)

router-middleware
=================


Supports
========
* Legacy Support for Express Template Engines
* Legacy Support for Express Routes

Features
========
* Chainable middleware
* Parameterized routes

Any Template Engine
========================
* Any Express-compatible template engine
* Any stream-based template engine
* Tagged Template Strings

Any Fileserver
===================
* Ecstatic
* express.static 

Example
=======
    var http = require('http')
    var router = require('router-middleware')
    var app = router()
    var server = http.createServer(app)
  
    app.get('/user/:username', function(req,res,next) {
      res.writeHead(200)
      res.end("Hello " + res.body.username + "!")
    })    
 
    // GET /user/joe
    // Hello joe!

With Fileserver Ecstatic
========================
    var http = require('http')
    var router = require('router-middleware')
    var app = router()
    var ecstatic = require('ecstatic')({root:__dirname })
    var server = http.createServer(app)

    app.fileserver(ecstatic)

    // any custom routes you set will have precedence 
    // all other GET requests falls-through to the fileserver

With Fileserver Express
=======================
    var http = require('http')
    var router = require('router-middleware')
    var app = router() 
    var express = require('express')
    var server = http.createServer(app)

    app.fileserver(express.static('mydirectory'))

    // any custom routes you set will have precedence 
    // all other GET requests falls-through to the fileserver

With a Express Template Engine
================================
    var router = require('router-middleware')
    var app = router()
    app.engine('view', yourengine) // i.e. index.view
    app.set('views', './views'); // specify the views directory
    app.set('view engine', 'view'); // register the template engine (i.e. for extension .view)

With a Stream Template Engine
=============================
    var router = require('router-middleware')
    var through = require('through')

    var app = router()
    app.streamengine('view', yourengine)
    app.set('views', './views'); // specify the views directory
    app.set('view engine', 'view'); // register the template engine

where an example of "yourengine" is 

    function (filePath, options, res) { // define the template engine
      fs
      .createReadStream(filePath)
      .pipe(through(function write(data) {
          this.queue(data.toString().toUpperCase()) //data *must* not be null
        },  
        function end () { //optional
          this.queue(null)
        })) 
      .pipe(res)
    }

Contributions
=============

Contributions are welcome! Pull requests are promptly reviewed.


License
=======

The MIT License (MIT)
Copyright (c) 2016 David Wee - rook2pawn@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
