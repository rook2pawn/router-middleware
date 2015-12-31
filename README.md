router-middleware
=================

Supports
========

* Express style routing
* Parameterized routes
* Express template engines compatible

    
Features
========

* Stream based template engines
* Express-compatible template engine

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
